"""Stand up the Airlock room using only the Agent API (Pro plan friendly).

The Warden creates a room it owns, then adds the other agents and the human
owner (so you can watch and approve in the Band UI). Prints the new chat id;
put it in .env as AIRLOCK_CHAT_ID.

Run from project root: uv run python -m scripts.seed_room
"""

from __future__ import annotations

from band.client.rest import ChatRoomRequest, ParticipantRequest

from scripts._band import AGENTS, agent_client, agent_id


def main() -> None:
    wc = agent_client("warden")

    owner = wc.agent_api_identity.get_agent_me().data.owner_uuid
    print(f"owner (you): {owner}")

    chat = wc.agent_api_chats.create_agent_chat(chat=ChatRoomRequest()).data
    chat_id = chat.id
    print(f"created room: {chat_id}")

    to_add = [(n, agent_id(n)) for n in AGENTS if n != "warden"] + [("you (human)", owner)]
    for label, pid in to_add:
        try:
            wc.agent_api_participants.add_agent_chat_participant(
                chat_id, participant=ParticipantRequest(participant_id=pid)
            )
            print(f"added: {label}")
        except Exception as e:
            print(f"skip:  {label}: {type(e).__name__} {str(e)[:160]}")

    print("\nParticipants:")
    print(wc.agent_api_participants.list_agent_chat_participants(chat_id))
    print(f"\n>>> Update .env:  AIRLOCK_CHAT_ID={chat_id}")


if __name__ == "__main__":
    main()
