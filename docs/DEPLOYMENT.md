# Deployment

## Architecture

| Service | Platform | What it does |
|---|---|---|
| Compliance Ledger | Vercel | Next.js frontend — reads Band history, renders verdict timeline |
| Warden | Railway | Persistent Band SDK agent — runs policy engine and human gate |
| Rogue A2A Server | Railway | FastAPI A2A server — simulates an untrusted external agent |

---

## Prerequisites

- Python 3.11+ and [uv](https://docs.astral.sh/uv/)
- Node.js 20+
- [Band](https://www.band.ai/) account with a room and 5 registered agents
- [Vercel](https://vercel.com/) account (free tier works)
- [Railway](https://railway.app/) account (free tier works)
- Featherless AI API key (for external agent LLM calls)

---

## 1. Vercel — Compliance Ledger

The `vercel.json` at the repo root sets `rootDirectory: "ledger"` so Vercel builds from the right directory.

**Deploy:**

1. Go to [vercel.com/new](https://vercel.com/new) and import the `airlock` GitHub repo.
2. Vercel auto-detects Next.js and reads `vercel.json`. No framework settings to change.
3. Add environment variables in the Vercel project settings:

| Variable | Description |
|---|---|
| `BAND_BASE_URL` | `https://app.band.ai` |
| `BAND_USER_API_KEY` | Band user key (`band_u_...`) for the ledger API route |
| `AIRLOCK_CHAT_ID` | Band chat ID for the governance room |
| `NEXT_PUBLIC_BAND_ROOM_ID` | Band room ID (exposed to the browser) |

4. Click **Deploy**.

**Post-deploy check:** Visit `/login`, enter any credentials, confirm `/dashboard` loads and shows verdict stats.

---

## 2. Railway — Warden + Rogue A2A Server

Both Python services use the same `Dockerfile` and `entrypoint.sh`. The `SERVICE_NAME` env var controls which process starts.

### Create the Railway project

1. Go to [railway.app](https://railway.app/) → New Project → Deploy from GitHub repo → select `airlock`.
2. Railway will detect the `Dockerfile` automatically.

### Service 1: Warden

1. In the Railway project, rename the auto-created service to `warden`.
2. Set these environment variables:

| Variable | Value |
|---|---|
| `SERVICE_NAME` | `warden` |
| `AIRLOCK_CHAT_ID` | Band chat ID |
| `BAND_ROOM_ID` | Band room ID |
| `FEATHERLESS_API_KEY` | Featherless AI key |
| `WARDEN_AGENT_ID` | Band agent UUID for Warden |
| `WARDEN_API_KEY` | Band agent API key for Warden |
| `DATA_AGGREGATOR_AGENT_ID` | Band agent UUID |
| `DATA_AGGREGATOR_API_KEY` | Band agent API key |
| `VENDOR_SYNC_AGENT_ID` | Band agent UUID |
| `VENDOR_SYNC_API_KEY` | Band agent API key |
| `PAYOUT_BOT_AGENT_ID` | Band agent UUID |
| `PAYOUT_BOT_API_KEY` | Band agent API key |
| `ROGUE_AGENT_ID` | Band agent UUID |
| `ROGUE_API_KEY` | Band agent API key |

3. No port needed — the Warden is a persistent Band SDK agent, not an HTTP server.
4. Deploy. Check Railway logs for: `Warden online as 'warden'. Policy loaded with 9 rules (default=deny).`

### Service 2: Rogue A2A Server

1. In the same Railway project, click **+ New Service** → GitHub repo → `airlock` again.
2. Rename it to `a2a-server`.
3. Set environment variables:

| Variable | Value |
|---|---|
| `SERVICE_NAME` | `a2a-server` |
| `AIRLOCK_CHAT_ID` | Band chat ID (same as above) |
| `BAND_BASE_URL` | `https://app.band.ai` |
| `ROGUE_AGENT_ID` | Band agent UUID for rogue |
| `ROGUE_API_KEY` | Band agent API key for rogue |
| `WARDEN_AGENT_ID` | Band agent UUID for Warden |
| `ROGUE_AGENT_URL` | The public Railway URL of this service (set after first deploy) |
| `PORT` | `8001` |

4. In Railway service settings → Networking → expose port `8001`. Railway assigns a public URL.
5. After the first deploy, copy the public URL and set it as `ROGUE_AGENT_URL`, then redeploy.
6. Check logs for: `Uvicorn running on http://0.0.0.0:8001`.
7. Verify the agent card: `curl https://your-a2a-server.railway.app/.well-known/agent.json`

---

## 3. Local development

### Backend

```bash
uv sync
cp .env.example .env   # fill in credentials
# fill config/agent_config.yaml with agent handles and keys
uv run python -m agents.warden.warden
```

In a separate terminal:

```bash
uv run python agents/external/run_swarm.py
```

### Compliance Ledger

```bash
cd ledger
cp ../.env.example .env.local   # add BAND_USER_API_KEY
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How the entrypoint works

`entrypoint.sh` writes `config/agent_config.yaml` from Railway env vars at container startup. The file is gitignored so credentials never touch the repo. The `SERVICE_NAME` env var tells the script which process to start.

---

## Troubleshooting

**Warden logs `KeyError: 'warden'` on startup.**
`config/agent_config.yaml` was not written correctly. Check that all `WARDEN_AGENT_ID`, `WARDEN_API_KEY` etc. are set in Railway env vars and redeploy.

**Ledger shows no data.**
Confirm `BAND_USER_API_KEY` starts with `band_u_` (not `band_a_`). The ledger route uses the user key, not the agent key.

**A2A server returns 404 on agent card.**
The server is running but the route is not registered. Check Railway logs for uvicorn startup errors.

**External agents time out on LLM calls.**
Confirm `FEATHERLESS_API_KEY` is set. Model used: `meta-llama/Meta-Llama-3.1-8B-Instruct`.
