# Airlock — Analytics

All metrics derive from Band message/event history (no separate analytics store). The point: governance you can measure.

## 1. Events (posted as Band events / message_type)

| Event | message_type | metadata fields |
|---|---|---|
| request_received | task | request_id, agent_handle, action_type |
| verdict_rendered | task | request_id, decision, matched_rule, latency_ms |
| escalation_raised | task | request_id, escalated_to |
| human_decision | text | request_id, decision (approve/deny), decided_by |
| action_executed | tool_result | request_id, action_type, executed=true |
| action_blocked | error | request_id, action_type, reason |

Every event carries `request_id` in metadata so the ledger can group a full request lifecycle.

## 2. Metrics

| Metric | Definition | Why it matters |
|---|---|---|
| Auto-clear rate | allow / total requests | shows the system reduces human load |
| Escalation rate | human / total requests | shows the human only sees what matters |
| Denial rate | deny / total requests | shows enforcement is active |
| Blocked-harm count | actions blocked that were privileged/irreversible | the headline safety number |
| Raw-A2A-allowed delta | actions raw A2A would have executed but Airlock gated | the diff panel's number |
| Time-to-decision | human_decision.ts - escalation.ts | human-in-loop responsiveness |
| Verdict latency | verdict_rendered.latency_ms | policy engine speed |

## 3. Dashboard (in the ledger UI)

- Top strip: 4 counters, total requests, auto-clear rate, escalations, blocked-harm count.
- Timeline: per-request lifecycle (request → verdict → human → executed/blocked).
- Diff panel: raw-A2A-allowed delta, the actions Airlock stopped.

## 4. Demo instrumentation

- The scenario driver tags each request so the post-run dashboard shows a clean mix: several auto-clears, one escalate+approve, one hard-deny, and the rogue agent's two blocked attempts.
- Target demo numbers: ~60% auto-clear, ~20% escalate, ~20% deny, blocked-harm >= 2. Tuned so the dashboard tells the governance story at a glance.
