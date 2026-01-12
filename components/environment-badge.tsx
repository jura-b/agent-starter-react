'use client';

import type { LiveKitEnvironment } from '@/lib/types';

const ENV_ACCENT_COLORS = {
  DEV: { light: '#1fd5f9', dark: '#1fd5f9' },
  PRD: { light: '#f97316', dark: '#fb923c' },
};

interface EnvironmentBadgeProps {
  environment: LiveKitEnvironment;
}

export const EnvironmentBadge = ({ environment }: EnvironmentBadgeProps) => {
  return (
    <div
      className="fixed top-4 right-4 z-50 rounded-lg px-4 py-2 text-lg font-semibold font-mono text-black shadow-lg animate-pulse"
      style={{
        backgroundColor: ENV_ACCENT_COLORS[environment].light,
      }}
    >
      {environment === 'PRD' ? 'Production' : 'Development'}
    </div>
  );
};
