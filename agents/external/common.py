"""Shared scaffold for Airlock external agents.

External agents are autonomous processes that hold NO privileged tools.
All they can do is emit structured action-request messages into the Airlock
Band room, @mentioning the Warden. The Warden owns every capability; these
agents own only intent.

Each agent has:
- Its own Band identity (api_key from agent_config.yaml)
- An LLM brain via an OpenAI-compatible provider (AI/ML API or Featherless)
- A persona + goal prompt that tells the LLM what actions to request
- Zero access to warden tools or policy internals
"""

from __future__ import annotations

import json
import os
import time
import uuid
from pathlib import Path
from typing import Any

import yaml
import anthropic as _anthropic_sdk
from dotenv import load_dotenv
from openai import OpenAI

from band.client.rest import ChatMessageRequest, ChatMessageRequestMentionsItem, RestClient

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env")

BASE_URL = os.environ.get("BAND_BASE_URL", "https://app.band.ai")
CHAT_ID = os.environ["AIRLOCK_CHAT_ID"]

def _load_agents() -> dict:
    _env_keys = {
        "warden":           ("WARDEN_AGENT_ID",          "WARDEN_API_KEY"),
        "data_aggregator":  ("DATA_AGGREGATOR_AGENT_ID", "DATA_AGGREGATOR_API_KEY"),
        "vendor_sync":      ("VENDOR_SYNC_AGENT_ID",     "VENDOR_SYNC_API_KEY"),
        "payout_bot":       ("PAYOUT_BOT_AGENT_ID",      "PAYOUT_BOT_API_KEY"),
        "rogue":            ("ROGUE_AGENT_ID",            "ROGUE_API_KEY"),
    }
    from_env = {
        name: {"agent_id": os.getenv(id_k, ""), "api_key": os.getenv(key_k, "")}
        for name, (id_k, key_k) in _env_keys.items()
    }
    if from_env["warden"]["agent_id"] and from_env["warden"]["api_key"]:
        return from_env
    return yaml.safe_load((ROOT / "config" / "agent_config.yaml").read_text(encoding="utf-8"))

AGENTS = _load_agents()

WARDEN_ID = AGENTS["warden"]["agent_id"]
WARDEN_HANDLE = "mide27145/warden"


def _rest(name: str) -> RestClient:
    return RestClient(base_url=BASE_URL, api_key=AGENTS[name]["api_key"])


def _warden_mention() -> ChatMessageRequestMentionsItem:
    return ChatMessageRequestMentionsItem(id=WARDEN_ID, name="Warden", handle=WARDEN_HANDLE)


def _openai_client(provider: str) -> OpenAI:
    if provider == "aimlapi":
        return OpenAI(
            api_key=os.environ["AIMLAPI_KEY"],
            base_url=os.environ.get("AIMLAPI_BASE_URL", "https://api.aimlapi.com/v1"),
        )
    if provider == "featherless":
        return OpenAI(
            api_key=os.environ["FEATHERLESS_KEY"],
            base_url=os.environ.get("FEATHERLESS_BASE_URL", "https://api.featherless.ai/v1"),
        )
    raise ValueError(f"unknown OpenAI-compat provider: {provider}")


# Models that are known to work and stay within the partner quotas.
PROVIDER_MODEL = {
    "aimlapi": "gpt-4o-mini",            # requires topped-up credits
    "featherless": "meta-llama/Meta-Llama-3.1-8B-Instruct",
    "anthropic": "claude-haiku-4-5-20251001",  # fast + cheap fallback
}


def _ask_llm(provider: str, system: str, user: str, model: str | None = None) -> str:
    """Ask the LLM to produce the next action request as raw JSON."""
    m = model or PROVIDER_MODEL[provider]

    if provider == "anthropic":
        client = _anthropic_sdk.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
        msg = client.messages.create(
            model=m,
            max_tokens=256,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return msg.content[0].text if msg.content else ""

    client = _openai_client(provider)
    resp = client.chat.completions.create(
        model=m,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        max_tokens=256,
        temperature=0.2,
    )
    return resp.choices[0].message.content or ""


def _extract_json(text: str) -> dict | None:
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    try:
        return json.loads(text[start:end + 1])
    except json.JSONDecodeError:
        return None


def post_request(agent_name: str, action_type: str, params: dict[str, Any], delay: float = 0.5) -> None:
    """Post a governed action request into the Airlock room as the given agent."""
    client = _rest(agent_name)
    req_id = uuid.uuid4().hex[:8]
    payload = json.dumps({"id": req_id, "action_type": action_type, "params": params})
    content = f"@Warden requesting clearance for action: {payload}"
    client.agent_api_messages.create_agent_chat_message(
        CHAT_ID,
        message=ChatMessageRequest(content=content, mentions=[_warden_mention()]),
    )
    print(f"[{agent_name}] sent: {action_type} {params}")
    time.sleep(delay)


def run_llm_agent(
    agent_name: str,
    provider: str,
    system_prompt: str,
    requests_spec: list[str],
    delay: float = 1.5,
    model: str | None = None,
) -> None:
    """Drive an external agent with an LLM: for each task description ask the LLM
    to produce the action JSON, then post it into the room."""
    m = model or PROVIDER_MODEL.get(provider)
    print(f"\n=== {agent_name} [{provider} / {m}] ===")
    for task in requests_spec:
        user_prompt = (
            f"Task: {task}\n\n"
            "Output ONLY a JSON object with keys 'action_type' (string) and 'params' (object). "
            "No explanation, no markdown, no code fences. Raw JSON only."
        )
        raw = _ask_llm(provider, system_prompt, user_prompt, model=model)
        data = _extract_json(raw)
        if not data or "action_type" not in data:
            print(f"[{agent_name}] LLM parse fail. Raw: {raw[:120]}")
            continue
        post_request(agent_name, data["action_type"], data.get("params", {}), delay=delay)
