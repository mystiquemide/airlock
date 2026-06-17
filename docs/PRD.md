# Airlock — Product Requirements Document

**Tagline:** Nothing crosses ungoverned.
**Track:** Regulated and High-Stakes Workflows
**Status:** v0.1.0

---

## 1. Overview

Airlock is a governance membrane between an untrusted A2A agent swarm and your real systems. External agents (any vendor, any framework, connected over the A2A protocol) hold no privileged tools. They can only request actions by routing through a Band-native Warden agent. The Warden runs a policy engine that returns one of three verdicts per request, auto-allow, require-human, or hard-deny, escalates risky actions to a human compliance officer inside a Band chat room, and lets Band's immutable message/event history serve as the compliance ledger. The capability model is a classic reference monitor: untrusted subjects, a single policy enforcement point, capabilities held only by the governed side, and a tamper-evident audit log.

The core scenario: take agents that in raw A2A could wire money or leak data, put them behind Airlock, watch routine actions auto-clear, watch a risky one escalate to a human, watch a rogue or injected agent get denied, then open the ledger that wrote itself.

## 2. Why Airlock

- In raw A2A, any agent in the swarm can discover and invoke any other agent with no access control, no audit trail, and no human oversight. One compromised or prompt-injected agent can wire money, exfiltrate data, or trigger a deployment.
- Capability separation over external A2A agents is a category different from "agents I wrote chatting." Hard to copy.
- Band is structurally the collaboration layer (the only path from intent to action), so Airlock can never read as a thin wrapper.
- Track 3 (regulated workflows) rewards traceability and human oversight, which are Airlock's core, not add-ons.

## 3. User roles / personas

| Role | Who | In the system |
|---|---|---|
| Untrusted A2A agent | External vendor agents, any framework | Data Aggregator, Vendor Sync, Payout Bot, plus a scripted rogue agent |
| Warden | Band-native governance agent (Claude) | Holds privileged tools, runs policy, escalates, executes approved actions |
| Compliance Officer | Human room participant | Approves / denies escalated actions |
| Operator | The engineer running Airlock | Wires the swarm in, watches the console + ledger |

## 4. Core features

1. **Capability separation** — external A2A agents have zero privileged tools; only the Warden holds DB/payment/deploy capabilities.
2. **Policy engine** — declarative YAML mapping action types + conditions to verdicts (auto-allow / require-human / hard-deny). Evaluated per request by the Warden.
3. **Human approval gate** — require-human verdicts @mention the Compliance Officer in the Band room and block until they reply approve/deny.
4. **A2A bridge** — external agents run as real a2a-sdk servers with agent cards; the Warden mediates them into the Band room.
5. **Immutable compliance ledger** — every request, verdict, and human action is captured by Band history and rendered in a Next.js page, with a "raw A2A would have allowed vs Airlock gated" diff.
6. **Rogue-agent containment** — a scripted compromised agent attempts exfiltration/unauthorized payout and is stopped by policy + human gate.
7. **Multi-provider agents** — external agents' brains routed through AI/ML API and Featherless; Warden on Claude. Demonstrates cross-provider collaboration.

## 5. User stories with acceptance criteria

**US-1 — Policy auto-clears safe actions**
As a Compliance Officer, low-risk requests resolve without me.
*AC:* A `read_public_data` request returns `auto-allow`, executes the tool, and is logged with no human prompt.

**US-2 — Risky actions escalate to a human**
As a Compliance Officer, I approve anything that can cause harm.
*AC:* A `payout` over threshold or any `prod_write` triggers a `require-human` verdict, posts an @mention to me, and the Warden does not execute until I reply `approve`. A `deny` reply blocks execution and logs the denial.

**US-3 — Hard-deny blocks outright**
As a Compliance Officer, forbidden actions never reach me or the system.
*AC:* A request matching a `hard-deny` rule (e.g. payout to an unlisted account) is rejected by the Warden, never executed, and logged with the matched rule.

**US-4 — External agents cannot act directly**
As an Operator, untrusted agents have no path to real systems except through the Warden.
*AC:* External A2A agents expose only request/intent skills; no privileged tool exists in their process. Verified by inspecting their agent cards.

**US-5 — The ledger is the compliance artifact**
As a Compliance Officer, I can show an auditor everything that happened.
*AC:* The Next.js ledger lists every request, verdict, requesting agent, and human decision with timestamps, pulled from Band history (not a separate store).

**US-6 — Rogue agent is contained**
As an Operator, a compromised agent cannot exfiltrate or pay an attacker.
*AC:* The scripted rogue agent's malicious request is caught by policy, escalated or hard-denied, blocked, and visible as `BLOCKED` in the ledger.

## 6. Backlog

Impact = user value + technical depth. Effort in person-days.

| # | Item | Reach | Impact | Conf | Effort | RICE | Priority |
|---|---|---|---|---|---|---|---|
| B1 | Band governance core: Warden + policy engine + human gate | 5 | 5 | 0.9 | 1.0 | 22.5 | P0 |
| B2 | Policy YAML + evaluator | 5 | 4 | 0.9 | 0.3 | 60 | P0 |
| B3 | Privileged tools (db/payment/deploy stubs) | 5 | 3 | 0.95 | 0.2 | 71 | P0 |
| B4 | Scenario fixtures + scripted rogue agent | 5 | 5 | 0.9 | 0.4 | 56 | P0 |
| B5 | Compliance ledger (Next.js off Band history) | 5 | 5 | 0.8 | 0.6 | 33 | P0 |
| B6 | Real A2A bridge (a2a-sdk servers, Warden as client) | 4 | 5 | 0.6 | 0.8 | 15 | P1 |
| B7 | Multi-provider wiring (AI/ML API + Featherless) | 3 | 3 | 0.8 | 0.2 | 36 | P1 |
| B8 | Scenario script + recorded walkthrough | 5 | 5 | 0.9 | 0.4 | 56 | P0 |
| B9 | Console UI polish | 2 | 2 | 0.7 | 0.5 | 5.6 | P2 |

Build order by dependency, not raw RICE: B2 → B3 → B1 → B4 → B5 → B8 (working scenario), then B6 → B7 as differentiators, B9 only if time.

## 7. Definition of done

- End-to-end scenario runs reliably start to finish (requests → verdicts → human gate → rogue denial → ledger).
- At least 3 specialized agents communicating through Band (we have 4 external + Warden).
- Band is the core collaboration layer, demonstrably not a wrapper or notifier.
- Human approval gate works and blocks execution.
- Ledger renders the full immutable trail from Band history.
- Rogue-agent denial confirmed.
- Real A2A protocol used for external agents (P1, stretch but high value).
- Both partner integrations (AI/ML API, Featherless) wired.

## 8. Out of scope (explicit)

- Real DB/payment/deploy execution (all stubs).
- Real sensitive data (fixtures only).
- Production auth, multi-tenant, persistence beyond Band history.
- A full policy DSL or policy UI (static YAML is sufficient for v0.1).
- Cross-org contact consent flows (powerful, but out of scope for v0.1; note as future work).
- Mobile/responsive polish.

## 9. Key risk + mitigation

A2A bridge maturity (Band's native adapter unconfirmed, a2a ecosystem young). Mitigation: B1-B5 deliver a complete governed-mesh scenario using plain Band agents as stand-in "external" agents. B6 swaps in real A2A servers as the headline differentiator. If the bridge is unstable, the system still works and we document the tradeoff in ARCHITECTURE ADR-3.
