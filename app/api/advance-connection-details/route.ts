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

    const agentName: string | undefined = envAgentName;
    const customRoomName: string = body?.room_name;
    const participantAttributes: Record<string, string> = body?.participant_attributes || {};
    const userParticipantName: string =
      body?.participant_name ||
      uniqueNamesGenerator({
        dictionaries: [names, names],
        separator: ' ',
        style: 'capital',
        length: 2,
      });

    // Strip empty values from participant attributes
    const cleanedAttributes: Record<string, string> = {};
    for (const [key, value] of Object.entries(participantAttributes)) {
      if (value && value.trim()) {
        cleanedAttributes[key] = value.trim();
      }
    }

    // Derive participantType from attributes or default to 'user'
    const participantType: 'user' | 'human_agent' =
      (cleanedAttributes['zai.role'] as 'user' | 'human_agent') || 'user';

    // Generate participant token
    const randomNumber = Math.floor(Math.random() * 10_000);
    const participantName = `${userParticipantName}`;
    const participantIdentity = `${userParticipantName.toLowerCase().replaceAll(' ', '_')}_${randomNumber}`;
    const roomName = customRoomName;

    const participantToken = await createParticipantToken(
      {
        identity: participantIdentity,
        name: participantName,
        attributes: cleanedAttributes,
        ttl: '60m',
      },
      roomName,
      agentName,
      apiKey,
      apiSecret
    );

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
