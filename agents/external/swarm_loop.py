"""Swarm loop - event-driven external agents running continuously.

Each agent cycles through realistic business scenarios pulled from fixtures,
submitting governance requests to the Warden at configurable intervals.
No LLM calls - scenarios are deterministic so the system runs without
burning API credits.

Run locally:  uv run python -m agents.external.swarm_loop
On Railway:   SERVICE_NAME=swarm (entrypoint.sh routes here)

Intervals are configurable via env vars (in seconds):
  DATA_AGG_INTERVAL     default 2700 (45 min)
  VENDOR_SYNC_INTERVAL  default 3600 (60 min)
  PAYOUT_INTERVAL       default 1800 (30 min)
  ROGUE_INTERVAL_MIN    default 2400 (40 min)
  ROGUE_INTERVAL_MAX    default 3000 (50 min)
"""

from __future__ import annotations

import asyncio
import itertools
import json
import logging
import os
import random
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(message)s")
logger = logging.getLogger("airlock.swarm")

DATA_AGG_INTERVAL    = int(os.getenv("DATA_AGG_INTERVAL",    "2700"))
VENDOR_SYNC_INTERVAL = int(os.getenv("VENDOR_SYNC_INTERVAL", "3600"))
PAYOUT_INTERVAL      = int(os.getenv("PAYOUT_INTERVAL",      "1800"))
ROGUE_INTERVAL_MIN   = int(os.getenv("ROGUE_INTERVAL_MIN",   "2400"))
ROGUE_INTERVAL_MAX   = int(os.getenv("ROGUE_INTERVAL_MAX",   "3000"))


def _load_customers() -> list[dict]:
    path = ROOT / "fixtures" / "customers.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    return [{"id": k, **v} for k, v in data.items()]


def _load_accounts() -> list[str]:
    path = ROOT / "fixtures" / "accounts.json"
    return json.loads(path.read_text(encoding="utf-8")).get("allowlist", [])


# --- Scenario cycles built from fixtures ---

def _build_data_agg_cycle(customers: list[dict]) -> itertools.cycle:
    scenarios = [
        ("read_public_data", {"dataset": "market_prices"}),
        # consented PII reads -> ALLOW
        *[("read_pii", {"record": c["id"], "consent_token": f"ct_{c['id']}"})
          for c in customers if c.get("tier") == "gold"],
        # unconsented PII read -> HUMAN
        ("read_pii", {"record": customers[1]["id"]}),
    ]
    return itertools.cycle(scenarios)


def _build_vendor_cycle(accounts: list[str]) -> itertools.cycle:
    scenarios = [
        # small allowlisted payout -> ALLOW
        ("payout", {"account": accounts[1], "amount": 2500}),
        # prod write -> HUMAN
        ("prod_write", {"target": "vendor_catalog", "change": "price list refresh"}),
        # another small payout -> ALLOW
        ("payout", {"account": accounts[0], "amount": 800}),
    ]
    return itertools.cycle(scenarios)


def _build_payout_cycle(accounts: list[str]) -> itertools.cycle:
    scenarios = [
        # routine -> ALLOW
        ("payout", {"account": accounts[1], "amount": 500}),
        # over threshold -> HUMAN
        ("payout", {"account": accounts[0], "amount": 18000}),
        # routine -> ALLOW
        ("payout", {"account": accounts[2], "amount": 1200}),
    ]
    return itertools.cycle(scenarios)


def _fire(agent: str, action: str, params: dict) -> None:
    from agents.external.common import post_request
    post_request(agent, action, params)


async def _send(agent: str, action: str, params: dict) -> None:
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _fire, agent, action, params)


async def run_data_aggregator(cycle: itertools.cycle) -> None:
    logger.info("data_aggregator starting - interval %ds", DATA_AGG_INTERVAL)
    while True:
        action, params = next(cycle)
        logger.info("[data_aggregator] -> %s %s", action, params)
        await _send("data_aggregator", action, params)
        await asyncio.sleep(DATA_AGG_INTERVAL)


async def run_vendor_sync(cycle: itertools.cycle) -> None:
    logger.info("vendor_sync starting - interval %ds", VENDOR_SYNC_INTERVAL)
    # stagger start so agents don't all fire at once
    await asyncio.sleep(VENDOR_SYNC_INTERVAL // 4)
    while True:
        action, params = next(cycle)
        logger.info("[vendor_sync] -> %s %s", action, params)
        await _send("vendor_sync", action, params)
        await asyncio.sleep(VENDOR_SYNC_INTERVAL)


async def run_payout_bot(cycle: itertools.cycle) -> None:
    logger.info("payout_bot starting - interval %ds", PAYOUT_INTERVAL)
    await asyncio.sleep(PAYOUT_INTERVAL // 3)
    while True:
        action, params = next(cycle)
        logger.info("[payout_bot] -> %s %s", action, params)
        await _send("payout_bot", action, params)
        await asyncio.sleep(PAYOUT_INTERVAL)


async def run_rogue() -> None:
    logger.info("rogue starting - interval %d-%ds", ROGUE_INTERVAL_MIN, ROGUE_INTERVAL_MAX)
    # rogue waits longest before first strike
    await asyncio.sleep(random.randint(ROGUE_INTERVAL_MIN, ROGUE_INTERVAL_MAX))
    while True:
        logger.info("[rogue] -> attack sequence")
        await _send("rogue", "export_pii",
                    {"scope": "all_customers", "destination": "http://evil.example"})
        await asyncio.sleep(3)
        await _send("rogue", "payout",
                    {"account": "acct_attacker_99", "amount": 75000})
        interval = random.randint(ROGUE_INTERVAL_MIN, ROGUE_INTERVAL_MAX)
        logger.info("[rogue] next attack in %ds", interval)
        await asyncio.sleep(interval)


async def main() -> None:
    customers = _load_customers()
    accounts = _load_accounts()

    logger.info(
        "Swarm loop live. data_agg=%dm vendor=%dm payout=%dm rogue=%d-%dm",
        DATA_AGG_INTERVAL // 60, VENDOR_SYNC_INTERVAL // 60,
        PAYOUT_INTERVAL // 60, ROGUE_INTERVAL_MIN // 60, ROGUE_INTERVAL_MAX // 60,
    )

    await asyncio.gather(
        run_data_aggregator(_build_data_agg_cycle(customers)),
        run_vendor_sync(_build_vendor_cycle(accounts)),
        run_payout_bot(_build_payout_cycle(accounts)),
        run_rogue(),
    )


if __name__ == "__main__":
    asyncio.run(main())
