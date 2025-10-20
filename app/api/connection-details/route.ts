import { NextResponse } from 'next/server';
import { AccessToken, type AccessTokenOptions, type VideoGrant } from 'livekit-server-sdk';
import { RoomConfiguration } from '@livekit/protocol';

// NOTE: you are expected to define the following environment variables in `.env.local`:
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

// don't cache the results
export const revalidate = 0;

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

export async function POST(req: Request) {
  try {
    if (LIVEKIT_URL === undefined) {
      throw new Error('LIVEKIT_URL is not defined');
    }
    if (API_KEY === undefined) {
      throw new Error('LIVEKIT_API_KEY is not defined');
    }
    if (API_SECRET === undefined) {
      throw new Error('LIVEKIT_API_SECRET is not defined');
    }

    // Parse agent configuration, room name and phone numbers from request body
    const body = await req.json();
    const agentName: string = body?.room_config?.agents?.[0]?.agent_name;
    const customRoomName: string = body?.room_name;
    const fromPhoneNumber: string = body?.from_phone_number || '';
    const destinationPhoneNumber: string = body?.destination_phone_number || '';
    const userParticipantName: string = body?.participant_name || 'user';

    // Generate participant token
    const randomNumber = Math.floor(Math.random() * 10_000);
    const participantName = `${userParticipantName}_${randomNumber}`.toUpperCase();
    const participantIdentity = `${userParticipantName}_${randomNumber}`;
    const roomName = customRoomName;

    const participantToken = await createParticipantToken(
      {
        identity: participantIdentity,
        name: participantName,
        attributes: {
          'sip.phoneNumber': fromPhoneNumber,
          'sip.trunkPhoneNumber': destinationPhoneNumber,
          'zai.role': userParticipantName, // "user" or "human_agent"
          'zai.channel_type': 'text',
        },
        ttl: '60m',
      },
      roomName,
      agentName
    );

    // Return connection details
    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken: participantToken,
      participantName,
    };
    const headers = new Headers({
      'Cache-Control': 'no-store',
    });
    return NextResponse.json(data, { headers });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new NextResponse(error.message, { status: 500 });
    }
  }
}

function createParticipantToken(
  userInfo: AccessTokenOptions,
  roomName: string,
  agentName?: string
): Promise<string> {
  const at = new AccessToken(API_KEY, API_SECRET, userInfo);

  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);

  if (agentName) {
    at.roomConfig = new RoomConfiguration({
      agents: [{ agentName }],
    });
  }

  return at.toJwt();
}
