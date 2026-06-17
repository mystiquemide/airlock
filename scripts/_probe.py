"""Probe what the Agent API allows on a Pro plan: identity, self-join, list."""

from __future__ import annotations

from band.client.rest import ParticipantRequest

from scripts._band import CHAT_ID, agent_client, agent_id


def main() -> None:
    wc = agent_client("warden")

    print("== agent identity ==")
    try:
        print(wc.agent_api_identity.get_agent_me())
    except Exception as e:
        print("identity error:", e)

    print("\n== warden self-add to existing room ==")
    try:
        r = wc.agent_api_participants.add_agent_chat_participant(
            CHAT_ID, participant=ParticipantRequest(participant_id=agent_id("warden"))
        )
        print("self-add ok:", r)
    except Exception as e:
        print("self-add error:", type(e).__name__, str(e)[:300])

    print("\n== list participants (agent api) ==")
    try:
        print(wc.agent_api_participants.list_agent_chat_participants(CHAT_ID))
    except Exception as e:
        print("list error:", type(e).__name__, str(e)[:300])

    print("\n== agent creates its own chat (fallback) ==")
    try:
        from band.client.rest import ChatRoomRequest
        print("ChatRoomRequest fields:", getattr(ChatRoomRequest, "model_fields", {}).keys())
    except Exception as e:
        print("chatroomrequest import err:", e)


if __name__ == "__main__":
    main()
