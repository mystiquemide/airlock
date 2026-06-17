"""Shared helpers for Airlock scripts: load creds and build REST clients."""

from __future__ import annotations

import os
from pathlib import Path

import yaml
from dotenv import load_dotenv

from band.client.rest import RestClient

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

BASE_URL = os.environ.get("BAND_BASE_URL", "https://app.band.ai")
CHAT_ID = os.environ["AIRLOCK_CHAT_ID"]
AGENTS = yaml.safe_load((ROOT / "config" / "agent_config.yaml").read_text(encoding="utf-8"))


def user_client() -> RestClient:
    return RestClient(base_url=BASE_URL, api_key=os.environ["BAND_USER_API_KEY"])


def agent_client(name: str) -> RestClient:
    return RestClient(base_url=BASE_URL, api_key=AGENTS[name]["api_key"])


def agent_id(name: str) -> str:
    return AGENTS[name]["agent_id"]
