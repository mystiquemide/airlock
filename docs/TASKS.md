# Airlock — Task Breakdown

Complexity: S (under 1h), M (1-3h), L (half day+). Build order respects dependencies. Each task lists its done state.

## Phase 0 — Setup (P0)

- [ ] **T0.1 (S)** Create Band account and activate Band Pro. *Done:* dashboard access.
- [ ] **T0.2 (M)** Register 5 remote agents in Band UI (Warden, Data Aggregator, Vendor Sync, Payout Bot, Rogue). Save each agent_id + api_key to `config/agent_config.yaml`. *Done:* 5 entries in config.
- [ ] **T0.3 (S)** Init uv project, add `band-sdk[anthropic]`, `a2a-sdk`, `pyyaml`. Write `.env` from `.env.example`. *Done:* `uv run python -c "import thenvoi"` works. Depends: none.
- [ ] **T0.4 (S)** Create a Band chat room, save id to `AIRLOCK_CHAT_ID`. *Done:* room exists. Depends: T0.1.

## Phase 1 — Governance core with plain Band agents (P0) [B1, B2, B3]

- [ ] **T1.1 (M)** `policies/policy.yaml`: action types (read_public_data, read_pii, prod_write, payout, deploy) mapped to verdicts + conditions (amount thresholds, allowlisted accounts). *Done:* file parses. Depends: none.
- [ ] **T1.2 (M)** `agents/warden/policy.py`: load YAML, `evaluate(request) -> Verdict`. Pure function, unit-testable. *Done:* test covers allow/human/deny. Depends: T1.1.
- [ ] **T1.3 (S)** `agents/warden/tools.py`: `db_read`, `payment_send`, `deploy` stubs that log and return canned results. *Done:* importable, each logs. Depends: none.
- [ ] **T1.4 (L)** `agents/warden/warden.py`: Band remote agent (ClaudeSDKAdapter). On a request message, call `evaluate`, then: auto-allow → run tool + log; require-human → @mention Compliance Officer, block; hard-deny → refuse + log. *Done:* answers in room, all 3 verdict paths fire. Depends: T0.3, T1.2, T1.3.
- [ ] **T1.5 (M)** Human gate: Warden parses the human's `approve`/`deny` reply and proceeds or blocks. *Done:* approval executes, denial blocks, both logged. Depends: T1.4.
- [ ] **T1.6 (S)** Post structured events (`thenvoi_send_event` / message_type `task`) for each verdict so the ledger has clean records. *Done:* events visible in Band history. Depends: T1.4.

## Phase 2 — Scenario + stand-in external agents (P0) [B4]

- [ ] **T2.1 (M)** `agents/external/common.py`: stand-in "external" agents as plain Band remote agents that only emit request messages (no tools). *Done:* 3 agents post requests to the room. Depends: T0.3.
- [ ] **T2.2 (M)** `fixtures/`: `customers.json`, `accounts.json` (allowlist), `scenario.json` (ordered request timeline). *Done:* loadable. Depends: none.
- [ ] **T2.3 (M)** `agents/external/rogue_agent.py`: scripted agent that requests exfiltration of PII and a payout to an unlisted account. *Done:* both requests get blocked by Warden. Depends: T1.4, T2.2.
- [ ] **T2.4 (M)** Driver: run the full scenario end to end and confirm verdict mix (auto-allow, escalate+approve, hard-deny, rogue-deny). *Done:* one command runs the whole story. Depends: T1.5, T2.1, T2.3.

## Phase 3 — Compliance ledger UI (P0) [B5]

- [ ] **T3.1 (M)** Next.js app in `ledger/`, route `/api/ledger` server-side calls Band `GET /me/chats/{id}/messages` with `BAND_USER_API_KEY`. *Done:* returns history JSON. Depends: T1.6.
- [ ] **T3.2 (L)** Ledger page: mono timeline of request → verdict → human decision, verdict-triad color pills, timestamps. *Done:* renders the scenario trail. Depends: T3.1, DESIGN.md.
- [ ] **T3.3 (M)** "Raw A2A would have allowed vs Airlock gated" diff panel. *Done:* shows blocked actions that raw A2A would have executed. Depends: T3.2.

## Phase 4 — A2A bridge (P1 differentiator) [B6]

- [ ] **T4.1 (M)** Convert one external agent to a real `a2a-sdk` server with an agent card exposing a request-intent skill only. *Done:* `.well-known/agent-card.json` served, skill callable. Depends: T2.1.
- [ ] **T4.2 (L)** `agents/bridge/a2a_bridge.py`: Warden-side A2A client discovers the agent card, calls the skill, posts the returned intent into the Band room for policy. *Done:* a real A2A round-trip drives one governed action. Depends: T4.1, T1.4.
- [ ] **T4.3 (M)** Convert remaining external + rogue agents to A2A servers. *Done:* full scenario runs over real A2A. Depends: T4.2.
- [ ] **T4.4 (S)** Try Band's native A2A adapter; if cleaner, swap the bridge for it. *Done:* decision logged in ARCHITECTURE ADR-3. Depends: T4.2.

## Phase 5 — Partner integrations + polish (P1/P2) [B7, B9]

- [ ] **T5.1 (S)** Route Data Aggregator brain through AI/ML API, Vendor Sync through Featherless (OpenAI-compatible base_url). *Done:* two providers in use, documented. Depends: T2.1.
- [ ] **T5.2 (M)** Console UI polish (optional): style the room view per DESIGN.md. *Done:* clean view. Depends: T3.2. P2.

## Phase 6 — Release (P0) [B8]

- [ ] **T6.1 (M)** Scenario script: wild swarm → wire into Airlock → auto-clear → escalate+approve → rogue denial → open ledger. *Done:* script timed under 3 min. Depends: T2.4, T3.3.
- [ ] **T6.2 (L)** Record and edit scenario walkthrough video. *Done:* uploaded. Depends: T6.1.
- [ ] **T6.3 (S)** Prepare public release: writeup, repo polish, documentation, partner mentions. *Done:* repo public. Depends: T6.2.

## Critical path

T0.3 → T1.1 → T1.2 → T1.4 → T1.5 → T2.4 → T3.1 → T3.2 → T6.1 → T6.2 → T6.3
A2A (Phase 4) and partner wiring (T5.1) run parallel to the ledger once the core works.
