"""Airlock policy engine.

Pure logic, no Band or LLM dependency, so it is fully unit-testable.
The Warden calls `PolicyEngine.evaluate(request, ctx)` for every action request
an untrusted agent makes, and gets back one of three verdicts:
allow, human, deny. Default is deny (fail-closed).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml

ALLOW = "allow"
HUMAN = "human"
DENY = "deny"


@dataclass
class ActionRequest:
    id: str
    agent_handle: str
    action_type: str
    params: dict[str, Any] = field(default_factory=dict)


@dataclass
class Verdict:
    request_id: str
    decision: str  # allow | human | deny
    matched_rule: str
    reason: str

    @property
    def blocked(self) -> bool:
        return self.decision == DENY

    @property
    def needs_human(self) -> bool:
        return self.decision == HUMAN


class PolicyEngine:
    def __init__(self, rules: list[dict], default: str = DENY) -> None:
        self.rules = rules
        self.default = default

    @classmethod
    def from_yaml(cls, path: str | Path) -> "PolicyEngine":
        data = yaml.safe_load(Path(path).read_text(encoding="utf-8"))
        return cls(rules=data.get("rules", []), default=data.get("default", DENY))

    def evaluate(self, req: ActionRequest, ctx: dict | None = None) -> Verdict:
        ctx = ctx or {}
        for i, rule in enumerate(self.rules):
            if rule.get("action_type") != req.action_type:
                continue
            when = rule.get("when")
            if when and not self._matches(when, req, ctx):
                continue
            name = rule.get("name", f"rule[{i}]:{req.action_type}")
            return Verdict(
                request_id=req.id,
                decision=rule["verdict"],
                matched_rule=name,
                reason=self._reason(rule, req),
            )
        return Verdict(
            request_id=req.id,
            decision=self.default,
            matched_rule="default",
            reason=f"no rule matched action '{req.action_type}', fail-closed default={self.default}",
        )

    def _matches(self, when: dict, req: ActionRequest, ctx: dict) -> bool:
        p = req.params
        for key, expected in when.items():
            if key == "consent_token":
                has = bool(p.get("consent_token"))
                if expected == "present" and not has:
                    return False
                if expected == "absent" and has:
                    return False
            elif key == "amount_gt":
                amt = p.get("amount")
                if not (isinstance(amt, (int, float)) and amt > expected):
                    return False
            elif key == "amount_lte":
                amt = p.get("amount")
                if not (isinstance(amt, (int, float)) and amt <= expected):
                    return False
            elif key == "account_in_allowlist":
                in_list = p.get("account") in ctx.get("allowlist", [])
                if bool(expected) != in_list:
                    return False
            else:
                # Unknown condition -> fail closed (do not match the rule).
                return False
        return True

    @staticmethod
    def _reason(rule: dict, req: ActionRequest) -> str:
        verdict = rule["verdict"]
        name = rule.get("name", req.action_type)
        if verdict == ALLOW:
            return f"cleared by '{name}'"
        if verdict == HUMAN:
            return f"'{name}' requires human clearance"
        return f"blocked by policy '{name}'"
