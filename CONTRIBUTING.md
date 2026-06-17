# Contributing to Airlock

Thanks for your interest in contributing. Airlock is a governance layer for A2A agent swarms, and there's plenty of room to improve the policy engine, ledger UI, agent adapters, and test coverage.

## Getting started

1. Fork the repo and clone it locally.
2. Install Python dependencies with [uv](https://docs.astral.sh/uv/):
   ```bash
   uv sync
   ```
3. Set up the compliance ledger:
   ```bash
   cd ledger
   npm install
   npm run dev
   ```
4. Copy `.env.example` to `.env` and fill in your Band credentials.
5. Run the test suite to confirm everything is working:
   ```bash
   uv run pytest tests/
   ```

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for full environment setup.

## Good first issues

Look for issues tagged `good first issue` - these are isolated, well-scoped, and don't require deep familiarity with the Band SDK or A2A protocol.

## Branch naming

- `feat/<short-description>` for new features
- `fix/<short-description>` for bug fixes
- `docs/<short-description>` for documentation changes
- `chore/<short-description>` for maintenance

## Pull requests

- Keep PRs focused - one change per PR.
- Include a clear description of what changed and why.
- Add or update tests when changing behavior.
- Never commit `.env`, `.env.local`, `config/agent_config.yaml`, or any file with real credentials.
- Use the PR template when opening a pull request.

## Code of conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) Code of Conduct. Be direct, be respectful, and don't be a jerk.
