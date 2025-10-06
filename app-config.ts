import type { AppConfig } from './lib/types';

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'Chat Support Agent Demo',
  pageTitle: 'Chat Support Agent Demo',
  pageDescription: 'Chat Support Agent Demo',

  supportsChatInput: true,
  supportsVideoInput: false,
  supportsScreenShare: false,
  isPreConnectBufferEnabled: true,

  logo: 'https://cdn-icons-png.flaticon.com/512/1028/1028931.png',
  accent: '#c616ff',
  logoDark: 'https://cdn-icons-png.flaticon.com/512/1028/1028931.png',
  accentDark: '#c616ff',
  startButtonText: 'Get Support',

  agentName: process.env.AGENT_NAME,
  livekitUrl: process.env.LIVEKIT_URL,
  maskedLivekitApiKey: process.env.LIVEKIT_API_KEY?.substring(0, 4) + '****', // masked api key
};
