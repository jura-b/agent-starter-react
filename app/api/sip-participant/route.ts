import { NextResponse } from 'next/server';
import { AgentDispatchClient, SipClient } from 'livekit-server-sdk';
import { names, uniqueNamesGenerator } from 'unique-names-generator';

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

export const revalidate = 0;

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

    const body = await req.json();
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
    const sipClient = new SipClient(LIVEKIT_URL, API_KEY, API_SECRET);

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
    const dispatchClient = new AgentDispatchClient(LIVEKIT_URL, API_KEY, API_SECRET);
    const dispatch = await dispatchClient.createDispatch(room_name, 'zai-agent');

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
