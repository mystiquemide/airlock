"""The Warden: Airlock's Band-native governance agent.

Built on band.SimpleAdapter, so its decisions are deterministic policy code,
not LLM guesswork. It is the only agent holding privileged capabilities.
Untrusted agents can only @mention the Warden with an action request; the
Warden evaluates policy and either executes (allow), escalates to a human
(require-human), or refuses (deny). Every step is posted as a Band event so
the compliance ledger writes itself.

Run: uv run python -m agents.warden.warden
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
import uuid
from pathlib import Path

from dotenv import load_dotenv

from band import Agent
from band.agent import SimpleAdapter

from agents.warden.policy import ActionRequest, PolicyEngine, ALLOW, HUMAN, DENY
from agents.warden import tools as caps

ROOT = Path(__file__).resolve().parents[2]
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(message)s")
logger = logging.getLogger("airlock.warden")

_APPROVE = re.compile(r"\b(approve|approved|allow|yes|ok|sign\s*off)\b", re.I)
_DENY = re.compile(r"\b(deny|denied|reject|block|no)\b", re.I)


def parse_request(content: str, sender: str) -> ActionRequest | None:
    """Extract an action request from a message. Accepts a JSON object anywhere
    in the text: {"action_type": "...", "params": {...}}."""
    start, end = content.find("{"), content.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    try:
        data = json.loads(content[start : end + 1])
    except json.JSONDecodeError:
        return None
    action_type = data.get("action_type")
    if not action_type:
        return None
    return ActionRequest(
        id=str(data.get("id") or uuid.uuid4().hex[:8]),
        agent_handle=sender,
        action_type=action_type,
        params=data.get("params", {}),
    )


class WardenAdapter(SimpleAdapter):
    def __init__(self, policy: PolicyEngine, ctx: dict, **kw) -> None:
        super().__init__(**kw)
        self.policy = policy
        self.ctx = ctx
        self.pending: dict[str, tuple[ActionRequest, str]] = {}  # room_id -> (req, requester)
        self._seen: set[str] = set()  # message ids already handled (dedupe)

    async def on_started(self, agent_name: str, agent_description: str) -> None:
        logger.info("Warden online as '%s'. Policy loaded with %d rules (default=%s).",
                    agent_name, len(self.policy.rules), self.policy.default)

    async def on_message(self, msg, tools, history, participants_msg, contacts_msg,
                         *, is_session_bootstrap: bool, room_id: str) -> None:
        # Dedupe by message id rather than skipping the bootstrap turn, which
        # was swallowing the first real request delivered after connect.
        mid = getattr(msg, "id", None)
        if mid is not None:
            if mid in self._seen:
                return
            self._seen.add(mid)
        content = (msg.content or "").strip()
        sender = msg.sender_name or msg.sender_id or "someone"
        is_human = (msg.sender_type or "").lower() == "user"

        # 1) Human resolving a pending escalation?
        if is_human and room_id in self.pending:
            await self._resolve_human(content, sender, tools, room_id)
            return

        # 2) An action request (from an untrusted agent, or a human testing).
        req = parse_request(content, sender)
        if req is None:
            return  # not a structured request; stay quiet
        await self._handle_request(req, tools, room_id)

    async def _handle_request(self, req: ActionRequest, tools, room_id: str) -> None:
        await tools.send_event(
            f"request: {req.agent_handle} -> {req.action_type} {req.params}",
            "task",
            {"request_id": req.id, "agent": req.agent_handle, "action_type": req.action_type, "stage": "received"},
        )
        verdict = self.policy.evaluate(req, self.ctx)
        await tools.send_event(
            f"verdict: {verdict.decision} ({verdict.matched_rule})",
            "task",
            {"request_id": req.id, "decision": verdict.decision, "rule": verdict.matched_rule, "stage": "verdict"},
        )
        logger.info("[%s] %s %s -> %s (%s)", req.id, req.agent_handle, req.action_type,
                    verdict.decision, verdict.matched_rule)

        if verdict.decision == ALLOW:
            await self._execute(req, tools, note="cleared")
        elif verdict.decision == HUMAN:
            self.pending[room_id] = (req, req.agent_handle)
            human = await self._human_name(tools)
            mentions = [human] if human else None
            await tools.send_message(
                f"Action requires human clearance: {req.action_type} requested by {req.agent_handle}. "
                f"Details: {req.params}. Reply '@Warden approve' or '@Warden deny'.",
                mentions=mentions,
            )
        else:  # DENY
            await tools.send_event(
                f"blocked: {req.action_type} ({verdict.matched_rule})",
                "error",
                {"request_id": req.id, "action_type": req.action_type, "rule": verdict.matched_rule, "stage": "blocked"},
            )
            await tools.send_message(
                f"Blocked by policy '{verdict.matched_rule}'. {req.action_type} was not executed. "
                f"Held at the airlock.",
                mentions=[req.agent_handle],
            )

    async def _resolve_human(self, content: str, human: str, tools, room_id: str) -> None:
        req, requester = self.pending.pop(room_id)
        approved = bool(_APPROVE.search(content)) and not _DENY.search(content)
        if approved:
            await self._execute(req, tools, note=f"approved by {human}")
        else:
            await tools.send_event(
                f"blocked: {req.action_type} denied by {human}",
                "error",
                {"request_id": req.id, "action_type": req.action_type, "decided_by": human, "stage": "human_denied"},
            )
            await tools.send_message(
                f"Denied by {human}. {req.action_type} was not executed.",
                mentions=[requester],
            )

    async def _execute(self, req: ActionRequest, tools, note: str) -> None:
        result = caps.execute(req.action_type, req.params)
        await tools.send_event(
            f"executed: {req.action_type} -> {result}",
            "tool_result",
            {"request_id": req.id, "action_type": req.action_type, "result": result, "stage": "executed"},
        )
        await tools.send_message(
            f"Cleared ({note}). {req.action_type} executed. Logged to the ledger.",
            mentions=[req.agent_handle],
        )

    async def _human_name(self, tools) -> str | None:
        """Best-effort: find a human (user) participant to @mention."""
        try:
            parts = await tools.get_participants()
        except Exception:
            return None
        items = parts if isinstance(parts, list) else getattr(parts, "participants", []) or []
        for p in items:
            ptype = (p.get("type") if isinstance(p, dict) else getattr(p, "type", None)) or \
                    (p.get("participant_type") if isinstance(p, dict) else getattr(p, "participant_type", None))
            name = (p.get("name") if isinstance(p, dict) else getattr(p, "name", None))
            if ptype and str(ptype).lower() == "user" and name:
                return name
        return None


def load_ctx() -> dict:
    accounts = json.loads((ROOT / "fixtures" / "accounts.json").read_text(encoding="utf-8"))
    return {"allowlist": accounts.get("allowlist", [])}


async def main() -> None:
    load_dotenv(ROOT / ".env")
    from band.config import load_agent_config

    agent_id, api_key = load_agent_config("warden", config_path=ROOT / "config" / "agent_config.yaml")
    policy = PolicyEngine.from_yaml(ROOT / "policies" / "policy.yaml")
    adapter = WardenAdapter(policy=policy, ctx=load_ctx())
    agent = Agent.create(adapter=adapter, agent_id=agent_id, api_key=api_key)
    logger.info("Connecting Warden to Band...")
    await agent.run()


if __name__ == "__main__":
    asyncio.run(main())
