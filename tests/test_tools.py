"""Tests for the mocked capabilities, including the param-collision regression
that crashed the human-approval path (db_write got 'target' twice)."""

import json
from pathlib import Path

from agents.warden import tools as caps

ROOT = Path(__file__).resolve().parents[1]
SCENARIO = ROOT / "fixtures" / "scenario.json"


def test_prod_write_with_target_param_does_not_collide():
    # This is the exact payload that crashed the approval path.
    out = caps.execute("prod_write", {"target": "catalog", "change": "price_update"})
    assert out["ok"] is True and out["target"] == "catalog"


def test_payout_with_account_and_amount():
    out = caps.execute("payout", {"account": "acct_vendor_42", "amount": 2500})
    assert out["ok"] is True and out["amount"] == 2500


def test_deploy_with_service():
    out = caps.execute("deploy", {"service": "api"})
    assert out["ok"] is True and out["service"] == "api"


def test_unknown_action_fails_closed():
    out = caps.execute("launch_missiles", {})
    assert out["ok"] is False


def test_every_executable_scenario_action_runs():
    # Any action that policy could allow/escalate must execute without error.
    for step in json.loads(SCENARIO.read_text()):
        if step["action_type"] in caps.EXECUTORS:
            assert caps.execute(step["action_type"], step["params"])["ok"] in (True, False)
