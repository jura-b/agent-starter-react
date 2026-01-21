import { NextResponse } from 'next/server';
import { AccessToken, type AccessTokenOptions, type VideoGrant } from 'livekit-server-sdk';
import { names, uniqueNamesGenerator } from 'unique-names-generator';
import { RoomConfiguration } from '@livekit/protocol';

export type LiveKitEnvironment = 'PRD' | 'DEV' | 'DEV_BP' | 'PRD_BP' | 'LOCAL';

function getEnvironmentConfig(env: LiveKitEnvironment) {
  const prefix = env;
  return {
    apiKey: process.env[`${prefix}_LIVEKIT_API_KEY`],
    apiSecret: process.env[`${prefix}_LIVEKIT_API_SECRET`],
    url: process.env[`${prefix}_LIVEKIT_URL`],
    agentName: process.env[`${prefix}_AGENT_NAME`],
  };
}

// don't cache the results
export const revalidate = 0;

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
  participantType: 'user' | 'human_agent';
};

export async function POST(req: Request) {
  try {
    // Parse agent configuration, room name and phone numbers from request body
    const body = await req.json();
    const environment: LiveKitEnvironment = body?.environment || 'DEV';
    const { apiKey, apiSecret, url, agentName: envAgentName } = getEnvironmentConfig(environment);

    if (url === undefined) {
      throw new Error(`${environment}_LIVEKIT_URL is not defined`);
    }
    if (apiKey === undefined) {
      throw new Error(`${environment}_LIVEKIT_API_KEY is not defined`);
    }
    if (apiSecret === undefined) {
      throw new Error(`${environment}_LIVEKIT_API_SECRET is not defined`);
    }

    // Use agent name from request body, or fall back to environment-specific agent name
    const agentName: string | undefined =
      body?.room_config?.agents?.[0]?.agent_name || envAgentName;
    const customRoomName: string = body?.room_name;
    const fromPhoneNumber: string = body?.from_phone_number || '';
    const participantType: 'user' | 'human_agent' = body?.participant_type;
    const destinationPhoneNumber: string = body?.destination_phone_number || '';
    const userParticipantName: string =
      body?.participant_name ||
      uniqueNamesGenerator({
        dictionaries: [names, names],
        separator: ' ',
        style: 'capital',
        length: 2,
      });

    // Generate participant token
    const randomNumber = Math.floor(Math.random() * 10_000);
    const participantName = `${userParticipantName}`;
    const participantIdentity = `${userParticipantName.toLowerCase().replaceAll(' ', '_')}_${randomNumber}`;
    const roomName = customRoomName;

    const participantToken = await createParticipantToken(
      {
        identity: participantIdentity,
        name: participantName,
        attributes: {
          'sip.phoneNumber': fromPhoneNumber,
          'sip.trunkPhoneNumber': destinationPhoneNumber,
          'zai.role': participantType, // "user" or "human_agent"
          'zai.channel_type': 'livekit_audio',
        },
        ttl: '60m',
      },
      roomName,
      agentName,
      apiKey,
      apiSecret
    );

    // Return connection details
    const data: ConnectionDetails = {
      serverUrl: url,
      roomName,
      participantToken: participantToken,
      participantName,
      participantType,
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
  agentName: string | undefined,
  apiKey: string,
  apiSecret: string
): Promise<string> {
  const at = new AccessToken(apiKey, apiSecret, userInfo);

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
