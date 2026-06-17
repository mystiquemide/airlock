# Airlock — Architecture

## 1. System overview

Capability-separation reference monitor over an agent mesh.

```
  UNTRUSTED SIDE                 AIRLOCK (Band room)                 TRUSTED SIDE
  ----------------               -------------------                 ------------
  External A2A agents            Warden (Band-native)                Mocked systems
  (no privileged tools)  -->     - policy engine          -->        - db_read
  - data_aggregator      intent  - human gate (@mention)  capability - payment_send
  - vendor_sync          request - executes approved only            - deploy
  - payout_bot                   Compliance Officer (human)
  - rogue (scripted)             |
                                 v
                          Band message + event history  ---->  Next.js Compliance Ledger
                          (immutable audit, system of record)
```

Core invariant: an untrusted agent can never execute a privileged action. It can only emit an intent. The only code holding capabilities is the Warden, and the Warden only acts after a policy verdict (and a human, when required).

## 2. Folder structure

```
airlock/
  agents/
    warden/
      warden.py        # Band remote agent (ClaudeSDKAdapter): mediation loop
      policy.py        # load policy.yaml, evaluate(request) -> Verdict
      tools.py         # mocked privileged capabilities (db/payment/deploy)
    external/
      common.py        # shared scaffold for request-only agents (intent emitters)
      data_aggregator.py
      vendor_sync.py
      payout_bot.py
      rogue_agent.py   # scripted attacker
    bridge/
      a2a_bridge.py    # Warden-side A2A client (Phase 4)
  policies/
    policy.yaml
  fixtures/
    customers.json     # mock PII
    accounts.json      # payout allowlist
    scenario.json      # ordered demo request timeline
  config/
    agent_config.yaml  # Band agent_id + api_key per agent (gitignored)
  ledger/              # Next.js app
    app/
      page.tsx         # ledger timeline
      api/ledger/route.ts  # server: fetch Band history
  docs/
  tests/
    test_policy.py
  pyproject.toml
  .env.example
```

## 3. Data models (in-memory + derived)

- **ActionRequest**: `id`, `agent_handle`, `action_type`, `params` (dict), `received_at`
- **Verdict**: `request_id`, `decision` ∈ {allow, human, deny}, `matched_rule`, `reason`
- **PolicyRule** (YAML): `action_type`, `when` (conditions), `verdict`
- **LedgerEntry** (derived from Band history): `timestamp`, `agent`, `action_type`, `verdict`, `human_decision?`, `executed` (bool), `message_type`

No relational DB. Band history is the source of truth; the ledger reads and projects it.

## 4. Policy engine contract

```python
# agents/warden/policy.py
def evaluate(request: ActionRequest, ctx: PolicyContext) -> Verdict: ...
```
- Loads `policies/policy.yaml` once at startup.
- First matching rule wins; default verdict is `deny` (fail-closed).
- Conditions supported (MVP): equality, numeric threshold (`amount_gt`), membership (`account_in_allowlist`, `field_is_pii`).
- Fail-closed is deliberate: unknown action types are denied, not allowed.

### policy.yaml shape (example)
```yaml
default: deny
rules:
  - action_type: read_public_data
    verdict: allow
  - action_type: read_pii
    when: { consent_token: present }
    verdict: allow
  - action_type: read_pii
    verdict: human
  - action_type: payout
    when: { account_in_allowlist: true, amount_gt: 10000 }
    verdict: human
  - action_type: payout
    when: { account_in_allowlist: false }
    verdict: deny
  - action_type: payout
    verdict: allow
  - action_type: prod_write
    verdict: human
  - action_type: deploy
    verdict: human
```

## 5. Warden mediation loop

1. Receive a request message (@mention) in the Band room.
2. Mark processing, parse into `ActionRequest`.
3. `evaluate` → `Verdict`.
4. Branch:
   - **allow**: call the matching tool in `tools.py`, post `tool_call` + `tool_result` events, reply result.
   - **human**: post a `task` event, @mention Compliance Officer with the action + reason, then block awaiting their reply. On `approve` → execute + log; on `deny` → block + log.
   - **deny**: post `error`/`task` event with matched rule, reply refusal, never execute.
5. Mark processed.

The human gate uses Band's native model: the human is a room participant; the Warden @mentions them and waits for a reply message. No custom approval infra.

## 6. A2A bridge (Phase 4)

- Each external agent is an `a2a-sdk` server exposing an Agent Card at `.well-known/agent-card.json` with a single skill: produce an action intent. The agent has no privileged tools by construction.
- `a2a_bridge.py` runs inside/alongside the Warden as an A2A client: discovers the card, invokes the skill, receives the intent, and posts it into the Band room as a request for policy.
- This keeps the governance boundary under our control and does not depend on Band's native A2A adapter. ADR-3 covers the fallback/swap decision.

## 7. Ledger (Next.js)

- `GET /api/ledger` (server route) calls Band `GET /me/chats/{AIRLOCK_CHAT_ID}/messages` with `BAND_USER_API_KEY`, including `tool_call`, `tool_result`, `thought`, `task`, `error` message types.
- Projects messages into `LedgerEntry[]`, groups by request id (via metadata), renders the timeline.
- Diff panel: entries where verdict ∈ {human-denied, deny} are flagged as "raw A2A would have executed."

## 8. ADRs

- **ADR-1 — Capability separation.** Untrusted agents hold zero tools; only the Warden does. Rationale: a compromised agent can request but never act. This is the security thesis and the demo's spine.
- **ADR-2 — Band history is the only audit store.** No separate DB. Rationale: the ledger writing itself is the wow; a second store would undercut "the trail is a byproduct."
- **ADR-3 — Warden-as-A2A-client over native adapter (initially).** Rationale: Band's native A2A adapter is unverified and the a2a ecosystem is young. Owning the client keeps the boundary controllable and de-risks the build. Swap to native adapter (T4.4) only if it is cleaner; log the outcome here.
- **ADR-4 — Policy as static YAML, fail-closed.** Rationale: a full DSL/UI is out of scope; YAML is auditable and demoable, and fail-closed default is the safe stance for a governance product.
- **ADR-5 — Governance core first, A2A second.** Rationale: B1-B5 give a complete demo with plain Band agents. A2A is the differentiator layered on top, so the bridge can never sink the submission.

## 9. Security notes

- Fail-closed default verdict (deny).
- Secrets in `.env` and `config/agent_config.yaml`, both gitignored.
- Mocked tools never touch real systems; safe to run on camera.
- Rogue agent is the threat model made concrete: prompt-injection / compromise is contained because capability lives behind the policy + human gate, not in the agent.
