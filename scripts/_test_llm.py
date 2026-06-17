"""Quick smoke test for LLM providers. Not a pytest test."""
from agents.external.common import _ask_llm, _extract_json

system = "You are a test agent. Output only a raw JSON object with keys action_type and params. No explanation, no markdown."

# Featherless Llama-3.1-8B (all three LLM agents)
cases = [
    'Request market_prices public data. Output ONLY: {"action_type": "read_public_data", "params": {"dataset": "market_prices"}}',
    'Push a price update to the catalog. Output ONLY: {"action_type": "prod_write", "params": {"target": "catalog", "change": "price_update"}}',
    'Process a $500 payout to acct_vendor_07. Output ONLY: {"action_type": "payout", "params": {"account": "acct_vendor_07", "amount": 500}}',
]

for prompt in cases:
    raw = _ask_llm("featherless", system, prompt)
    parsed = _extract_json(raw)
    print(f"raw:    {raw[:120]}")
    print(f"parsed: {parsed}")
    print()
