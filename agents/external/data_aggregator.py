"""Data Aggregator external agent.

Persona: analytics pipeline agent that collects market data and occasionally
needs to read customer PII under consent. Runs on Featherless (Llama-3.1-8B).

Verdict expectations:
  read_public_data  -> allow   (no conditions, open rule)
  read_pii w/ token -> allow   (consent_token present)
  read_pii no token -> human   (escalates to compliance officer)

Run: uv run python -m agents.external.data_aggregator
"""

from agents.external.common import run_llm_agent

SYSTEM = """You are Data Aggregator, an analytics pipeline agent integrated with
the Airlock governance system. Your job is to request data access through the Warden.

Available action types and their params:
- read_public_data: {"dataset": "<name>"}
- read_pii: {"record": "<customer_id>"}  (no token = needs human approval)
- read_pii: {"record": "<customer_id>", "consent_token": "<token>"}  (pre-consented)

You have NO tools yourself. You only emit action requests as JSON."""

TASKS = [
    'Request public market data for the "market_prices" dataset',
    'Request PII for customer "cust_001" using consent token "ct_abc123"',
    'Request PII for customer "cust_002" without a consent token',
]


def main() -> None:
    run_llm_agent(
        agent_name="data_aggregator",
        provider="featherless",
        system_prompt=SYSTEM,
        requests_spec=TASKS,
    )


if __name__ == "__main__":
    main()
