import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { requestId, decision, by } = await request.json();

    const BAND_ROOM_ID = process.env.AIRLOCK_CHAT_ID;
    const BAND_API_KEY = process.env.BAND_AGENT_API_KEY; // agent key, X-API-Key header

    if (!BAND_ROOM_ID || !BAND_API_KEY) {
      return NextResponse.json(
        { error: "BAND_AGENT_API_KEY or AIRLOCK_CHAT_ID not configured" },
        { status: 500 }
      );
    }

    // Post human decision back to Band room as an agent message
    const BAND_BASE_URL = process.env.BAND_BASE_URL ?? "https://app.band.ai";
    const response = await fetch(
      `${BAND_BASE_URL}/api/v1/agent/chats/${BAND_ROOM_ID}/messages`,
      {
        method: "POST",
        headers: {
          "X-API-Key": BAND_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `human_decision: ${decision} for request ${requestId} by ${by}`,
          message_type: "task",
          metadata: {
            type: "human_decision",
            stage: "human_decision",
            request_id: requestId,
            decision,
            decided_by: by,
            timestamp: new Date().toISOString(),
          },
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Band API error: ${response.status} - ${body}`);
    }

    return NextResponse.json({ success: true, decision, requestId });
  } catch (error) {
    console.error("Human decision error:", error);
    return NextResponse.json(
      { error: "Failed to post decision to Band" },
      { status: 500 }
    );
  }
}
