"""Mocked privileged capabilities.

These are the ONLY tools that touch "real systems". They live only on the
Warden. Untrusted agents never import this module. Every call logs and returns
canned data, so they can be exercised safely without touching real systems.

Each tool takes the request's params dict (no positional args) to avoid
argument collisions when an action's params happen to share a key name.
"""

from __future__ import annotations

import logging

logger = logging.getLogger("airlock.tools")


def db_read(params: dict) -> dict:
    target = params.get("dataset") or params.get("record") or params.get("target") or "data"
    logger.info("db_read target=%s", target)
    return {"ok": True, "tool": "db_read", "target": target, "rows": 1}


def db_write(params: dict) -> dict:
    target = params.get("target", "prod")
    logger.info("db_write target=%s change=%s", target, params.get("change"))
    return {"ok": True, "tool": "db_write", "target": target, "applied": True}


def payment_send(params: dict) -> dict:
    account, amount = params.get("account", "?"), params.get("amount", 0)
    logger.info("payment_send account=%s amount=%s", account, amount)
    return {"ok": True, "tool": "payment_send", "account": account, "amount": amount}


def deploy(params: dict) -> dict:
    service = params.get("service", "?")
    logger.info("deploy service=%s", service)
    return {"ok": True, "tool": "deploy", "service": service, "released": True}


# Map a policy action_type to the capability that fulfills it.
EXECUTORS = {
    "read_public_data": db_read,
    "read_pii": db_read,
    "prod_write": db_write,
    "payout": payment_send,
    "deploy": deploy,
}


def execute(action_type: str, params: dict) -> dict:
    """Run the capability for an approved action. Unknown types fail closed."""
    fn = EXECUTORS.get(action_type)
    if fn is None:
        logger.warning("no executor for action_type=%s", action_type)
        return {"ok": False, "error": f"no executor for {action_type}"}
    return fn(params)
