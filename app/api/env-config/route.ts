import { NextResponse } from 'next/server';

type LiveKitEnvironment = 'PRD' | 'DEV' | 'DEV_BP' | 'PRD_BP' | 'LOCAL';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const env = (searchParams.get('env') as LiveKitEnvironment) || 'DEV';

  const prefix = env;
  const livekitUrl = process.env[`${prefix}_LIVEKIT_URL`];
  const apiKey = process.env[`${prefix}_LIVEKIT_API_KEY`];
  const agentName = process.env[`${prefix}_AGENT_NAME`];

  return NextResponse.json({
    environment: env,
    livekitUrl: livekitUrl || 'Not configured',
    maskedLivekitApiKey: apiKey ? apiKey.substring(0, 4) + '****' : 'Not configured',
    agentName: agentName || 'Not configured',
  });
}
