import type { AppConfig, LiveKitEnvironment } from './lib/types';

export const LIVEKIT_ENVIRONMENTS: { env: LiveKitEnvironment; label: string }[] = [
  { env: 'PRD', label: 'Production' },
  { env: 'DEV', label: 'Development' },
  { env: 'DEV_BP', label: 'Development BP' },
  { env: 'PRD_BP', label: 'Production BP' },
  { env: 'LOCAL', label: 'Local' },
];

export function getEnvironmentConfig(env: LiveKitEnvironment) {
  const prefix = env;
  return {
    livekitUrl: process.env[`${prefix}_LIVEKIT_URL`],
    maskedLivekitApiKey: process.env[`${prefix}_LIVEKIT_API_KEY`]?.substring(0, 4) + '****',
    agentName: process.env[`${prefix}_AGENT_NAME`],
  };
}

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: '100,000,000X',
  pageTitle: '100,000,000X Agent',
  pageDescription: '100,000,000X Voice Agent',

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  logo: 'https://venngage-wordpress.s3.amazonaws.com/uploads/2022/09/meme_surprised_shocked_pikachu.png',
  accent: '#002cf2',
  logoDark:
    'https://venngage-wordpress.s3.amazonaws.com/uploads/2022/09/meme_surprised_shocked_pikachu.png',
  accentDark: '#1fd5f9',
  startButtonText: 'Simulate SIP-like Call',

  // Default to DEV environment
  agentName: '',
  livekitUrl: '',
  maskedLivekitApiKey: '',
};
