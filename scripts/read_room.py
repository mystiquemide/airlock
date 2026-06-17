"""Dump the Airlock room trail (text + events) via the Agent API context.
This is the same source the compliance ledger UI will read.

Run: uv run python -m scripts.read_room
"""

from __future__ import annotations

from scripts._band import CHAT_ID, agent_client


def main() -> None:
    c = agent_client("warden")
    resp = c.agent_api_context.get_agent_chat_context(CHAT_ID, page=1, page_size=100)
    data = getattr(resp, "data", resp)
    items = data if isinstance(data, list) else getattr(data, "messages", None) or getattr(data, "context", None) or data
    print(f"--- room trail ({CHAT_ID}) ---")
    try:
        for m in items:
            sender = getattr(m, "sender_name", None) or getattr(m, "sender_id", "?")
            mtype = getattr(m, "message_type", "?")
            content = getattr(m, "content", "")
            print(f"[{mtype:11}] {sender:16} | {content}")
    except TypeError:
        print(items)


if __name__ == "__main__":
    main()
