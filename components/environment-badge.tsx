'use client';

import type { LiveKitEnvironment } from '@/lib/types';

const ENV_ACCENT_COLORS = {
  DEV: { light: '#1fd5f9', dark: '#1fd5f9' },
  PRD: { light: '#f97316', dark: '#fb923c' },
  DEV_BP: { light: '#1fd5f9', dark: '#1fd5f9' }, // Same as DEV
  PRD_BP: { light: '#f97316', dark: '#fb923c' }, // Same as PRD
  LOCAL: { light: '#22c55e', dark: '#4ade80' }, // Green tone
};

const ENV_LABELS: Record<LiveKitEnvironment, string> = {
  DEV: 'Development',
  PRD: 'Production',
  DEV_BP: 'Development BP',
  PRD_BP: 'Production BP',
  LOCAL: 'Local',
};

interface EnvironmentBadgeProps {
  environment: LiveKitEnvironment;
}

export const EnvironmentBadge = ({ environment }: EnvironmentBadgeProps) => {
  return (
    <div
      className="fixed top-4 right-4 z-50 animate-pulse rounded-lg px-4 py-2 font-mono text-lg font-semibold text-black shadow-lg"
      style={{
        backgroundColor: ENV_ACCENT_COLORS[environment].light,
      }}
    >
      {ENV_LABELS[environment]}
    </div>
  );
};
