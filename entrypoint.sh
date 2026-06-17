#!/bin/sh
set -e

# Write agent config from Railway env vars so the gitignored file
# exists in the container without committing credentials.
mkdir -p config
cat > config/agent_config.yaml << YAML
warden:
  agent_id: "${WARDEN_AGENT_ID}"
  api_key: "${WARDEN_API_KEY}"

data_aggregator:
  agent_id: "${DATA_AGGREGATOR_AGENT_ID}"
  api_key: "${DATA_AGGREGATOR_API_KEY}"

vendor_sync:
  agent_id: "${VENDOR_SYNC_AGENT_ID}"
  api_key: "${VENDOR_SYNC_API_KEY}"

payout_bot:
  agent_id: "${PAYOUT_BOT_AGENT_ID}"
  api_key: "${PAYOUT_BOT_API_KEY}"

rogue:
  agent_id: "${ROGUE_AGENT_ID}"
  api_key: "${ROGUE_API_KEY}"
YAML

case "$SERVICE_NAME" in
  warden)
    exec uv run python -m agents.warden.warden
    ;;
  a2a-server)
    exec uv run python agents/rogue_a2a_server.py
    ;;
  *)
    echo "Unknown SERVICE_NAME: $SERVICE_NAME. Set to 'warden' or 'a2a-server'."
    exit 1
    ;;
esac
