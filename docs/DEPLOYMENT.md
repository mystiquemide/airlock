# Deployment

## Prerequisites

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) package manager
- Node.js 20+
- A [Band](https://www.band.ai/) account
- Five agents registered in Band: `warden`, `data-aggregator`, `vendor-sync`, `payout-bot`, `rogue-vendor`
- Featherless AI API key (for external agent LLM calls)

## Environment variables

### Python backend (`.env` at project root)

| Variable | Description |
|---|---|
| `BAND_ROOM_ID` | Band room ID for the governance room |
| `BAND_AGENT_API_KEY` | Warden agent key (`band_a_...`) |
| `AIRLOCK_CHAT_ID` | Band chat ID |
| `FEATHERLESS_API_KEY` | Featherless AI key for external agents |

### Next.js ledger (`ledger/.env.local`)

| Variable | Description |
|---|---|
| `BAND_BASE_URL` | Band API base URL (e.g. `https://app.band.ai`) |
| `BAND_USER_API_KEY` | Band user key (`band_u_...`) for ledger API route |
| `AIRLOCK_CHAT_ID` | Same chat ID as the Python backend |
| `NEXT_PUBLIC_BAND_ROOM_ID` | Room ID for client-side Band room link |

## Local build

### Backend

```bash
uv sync
cp .env.example .env   # fill in your credentials
# fill config/agent_config.yaml with agent handles and keys
uv run python -m agents.warden.warden
```

In a separate terminal:

```bash
uv run python agents/external/run_swarm.py
```

### Compliance ledger

```bash
cd ledger
cp ../.env.example .env.local   # add BAND_USER_API_KEY
npm install
npm run build
npm run start
```

Or for development:

```bash
npm run dev
```

## Vercel deployment (ledger)

The compliance ledger is a standard Next.js app deployable to Vercel. The `vercel.json` at the project root sets `rootDirectory` to `ledger` so Vercel builds from the correct subdirectory.

1. Push the repo to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Vercel will auto-detect Next.js and use the `vercel.json` config.
4. Set the environment variables in the Vercel project settings (match `ledger/.env.local`).
5. Deploy.

## Post-deploy verification

After deploying the ledger, verify:

- `/login` loads and accepts any credentials
- `/dashboard` shows verdict stats (may be zeroed if no swarm has run)
- `/ledger` loads and polls Band history
- `/policy` loads the YAML rules
- `/agents` shows all 5 registered agents

If the ledger shows no data, confirm `AIRLOCK_CHAT_ID` and `BAND_USER_API_KEY` are set correctly in Vercel environment variables.

## Troubleshooting

**Ledger shows "COULD NOT LOAD POLICY" on the policy page.**
The policy page reads `policies/policy.yaml` relative to the project root. On Vercel, this file is not available since the backend is not deployed there. The policy editor is intended for local use or a backend-hosted deployment.

**Band API returns 401.**
The ledger API route uses the `band_u_...` user key, not the `band_a_...` agent key. Confirm `BAND_USER_API_KEY` starts with `band_u_`.

**External agents time out on LLM calls.**
Confirm `FEATHERLESS_API_KEY` is set and the model `meta-llama/Meta-Llama-3.1-8B-Instruct` is available on your Featherless account.

**`uv sync` fails.**
Requires Python 3.11+. Run `python --version` to check. Install via [python.org](https://www.python.org/downloads/) or `pyenv`.
