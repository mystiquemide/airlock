# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-17

### Added

- Warden agent with YAML policy engine (9 rules, fail-closed, first-match verdicts)
- Three verdict types: ALLOW (auto-execute), HUMAN (gate on human approval), DENY (hard block)
- Human gate using Band native @mention routing - blocks until compliance officer responds
- Rogue A2A server using `a2a-sdk` to simulate external attacker agent
- Four external agents: `data_aggregator`, `vendor_sync`, `payout_bot`, `rogue_vendor` (Featherless LLM-driven)
- `run_swarm.py` - one-command scenario driver running all agents in sequence
- Compliance ledger (Next.js 16, App Router) with live Band history polling
- Ledger pages: dashboard, full request ledger, request detail, agent registry, policy viewer, policy editor, settings
- Policy editor with PIN gate, inline YAML editing, and live save to `policy.yaml`
- Authentication shell: cookie-based session gate, login page, logout
- DiffPanel component showing what raw A2A would have executed unchecked
- Rogue agent visual callout with A2A badge and coral row highlighting
- Auto-poll every 30 seconds on the ledger page with manual refresh
- Six-stage Band event parsing: `request_received`, `verdict_rendered`, `escalation_raised`, `human_decision`, `action_executed`, `action_blocked`
- CI workflow for Next.js build and Python test suite
- CodeQL security analysis
- Dependabot for npm, pip, and GitHub Actions
