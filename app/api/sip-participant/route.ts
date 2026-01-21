import { NextResponse } from 'next/server';
import { AgentDispatchClient, SipClient } from 'livekit-server-sdk';
import { names, uniqueNamesGenerator } from 'unique-names-generator';

type LiveKitEnvironment = 'PRD' | 'DEV' | 'DEV_BP' | 'PRD_BP' | 'LOCAL';

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const environment: LiveKitEnvironment = body?.environment || 'DEV';
    const { apiKey, apiSecret, url, agentName } = getEnvironmentConfig(environment);

    if (url === undefined) {
      throw new Error(`${environment}_LIVEKIT_URL is not defined`);
    }
    if (apiKey === undefined) {
      throw new Error(`${environment}_LIVEKIT_API_KEY is not defined`);
    }
    if (apiSecret === undefined) {
      throw new Error(`${environment}_LIVEKIT_API_SECRET is not defined`);
    }

    const { sip_number, sip_trunk_id, sip_call_to, room_name, wait_until_answered = true } = body;

    // Validate required fields
    if (!sip_number || !sip_trunk_id || !sip_call_to || !room_name) {
      throw new Error('Missing required SIP parameters');
    }

    // Generate participant name and identity same way as left form
    const randomNumber = Math.floor(Math.random() * 10_000);
    const userParticipantName = uniqueNamesGenerator({
      dictionaries: [names, names],
      separator: ' ',
      style: 'capital',
      length: 2,
    });
    const participantName = `${userParticipantName}`;
    const participantIdentity = `${userParticipantName.toLowerCase().replaceAll(' ', '_')}_${randomNumber}`;

    // Initialize SIPClient
    const sipClient = new SipClient(url, apiKey, apiSecret);

    // Create SIP participant
    const sipParticipant = await sipClient.createSipParticipant(
      sip_trunk_id,
      sip_call_to,
      room_name,
      {
        participantIdentity: participantIdentity,
        participantName: participantName,
        participantAttributes: {
          'zai.role': 'user',
          'zai.channel_type': 'livekit_audio',
        },
        waitUntilAnswered: wait_until_answered,
        fromNumber: sip_number,
        playRingtone: true,
        playDialtone: true,
        krispEnabled: true,
      }
    );

    // Initialize AgentDispatchClient and dispatch agent to the same room
    const dispatchClient = new AgentDispatchClient(url, apiKey, apiSecret);
    const dispatch = agentName ? await dispatchClient.createDispatch(room_name, agentName) : null;

    const headers = new Headers({
      'Cache-Control': 'no-store',
    });

    return NextResponse.json(
      {
        success: true,
        participant: sipParticipant,
        dispatch: dispatch,
      },
      { headers }
    );
  } catch (error) {
    console.error('SIP participant creation error:', error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('Internal server error', { status: 500 });
  }
}
