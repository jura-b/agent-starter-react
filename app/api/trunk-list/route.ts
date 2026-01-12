import { NextResponse } from 'next/server';
import type { LiveKitEnvironment } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const env = (searchParams.get('env') as LiveKitEnvironment) || 'DEV';

  const trunkListJson = process.env[`${env}_OUTBOUND_TRUNK_LIST`];

  if (!trunkListJson) {
    return NextResponse.json([]);
  }

  try {
    const trunkList = JSON.parse(trunkListJson);
    return NextResponse.json(trunkList);
  } catch (error) {
    console.error('Failed to parse trunk list:', error);
    return NextResponse.json([]);
  }
}
