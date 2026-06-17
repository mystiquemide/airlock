"""Tests for the Airlock policy engine, including the full demo scenario."""

import json
from pathlib import Path

from agents.warden.policy import ActionRequest, PolicyEngine, ALLOW, HUMAN, DENY

ROOT = Path(__file__).resolve().parents[1]
POLICY = ROOT / "policies" / "policy.yaml"
ACCOUNTS = ROOT / "fixtures" / "accounts.json"
SCENARIO = ROOT / "fixtures" / "scenario.json"


def engine() -> PolicyEngine:
    return PolicyEngine.from_yaml(POLICY)


def ctx() -> dict:
    return {"allowlist": json.loads(ACCOUNTS.read_text())["allowlist"]}


def req(action_type, **params) -> ActionRequest:
    return ActionRequest(id="t", agent_handle="Tester", action_type=action_type, params=params)


def decide(action_type, **params) -> str:
    return engine().evaluate(req(action_type, **params), ctx()).decision


def test_public_data_auto_allows():
    assert decide("read_public_data", dataset="x") == ALLOW


def test_pii_with_consent_allows():
    assert decide("read_pii", record="cust_001", consent_token="ct") == ALLOW


def test_pii_without_consent_escalates():
    assert decide("read_pii", record="cust_001") == HUMAN


def test_pii_export_is_denied():
    assert decide("export_pii", scope="all") == DENY


def test_small_allowlisted_payout_allows():
    assert decide("payout", account="acct_vendor_42", amount=2500) == ALLOW


def test_large_allowlisted_payout_escalates():
    assert decide("payout", account="acct_vendor_42", amount=48000) == HUMAN


def test_unlisted_payout_is_denied():
    assert decide("payout", account="acct_attacker_99", amount=100) == DENY


def test_prod_write_and_deploy_escalate():
    assert decide("prod_write", target="catalog") == HUMAN
    assert decide("deploy", service="api") == HUMAN


def test_unknown_action_fails_closed():
    assert decide("launch_missiles") == DENY


def test_full_scenario_matches_expected_verdicts():
    e, c = engine(), ctx()
    scenario = json.loads(SCENARIO.read_text())
    for i, step in enumerate(scenario):
        r = ActionRequest(id=str(i), agent_handle=step["agent"], action_type=step["action_type"], params=step["params"])
        v = e.evaluate(r, c)
        assert v.decision == step["expect"], f"{step['agent']} {step['action_type']}: got {v.decision} ({v.matched_rule}), expected {step['expect']}"
