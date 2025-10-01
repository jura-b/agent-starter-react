import type { AppConfig } from './lib/types';

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

  agentName: process.env.AGENT_NAME,
  livekitUrl: process.env.LIVEKIT_URL,
  maskedLivekitApiKey: process.env.LIVEKIT_API_KEY?.substring(0, 4) + '****', // masked api key
};
