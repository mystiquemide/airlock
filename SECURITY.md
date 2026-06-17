# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 0.1.x | Yes |

## Reporting a vulnerability

If you find a security vulnerability in Airlock, do not open a public issue. Email **mide27145@gmail.com** with:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix if you have one

You'll get a response within 72 hours. If the issue is confirmed, a fix will be prioritized and you'll be credited in the changelog.

## Security design

Airlock is designed fail-closed:

- **Unknown action types are denied by default.** If a rule doesn't match, the verdict is `deny`, never `allow`.
- **Privileged tools are isolated.** External agents carry no capabilities. The only code that can execute a privileged action is the Warden, and only after a policy verdict.
- **All secrets are gitignored.** `.env`, `.env.local`, and `config/agent_config.yaml` are never committed. See `.gitignore`.
- **Band history is immutable.** The audit ledger is derived from Band's message history, which cannot be altered retroactively.
- **Human gate is blocking.** When a policy verdict is `human`, the Warden waits for a real human response before proceeding. There is no timeout that auto-approves.
