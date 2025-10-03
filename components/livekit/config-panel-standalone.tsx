'use client';

import React from 'react';
import type { AppConfig } from '@/lib/types';

interface ConfigPanelStandaloneProps {
  appConfig: AppConfig;
}

export const ConfigPanelStandalone = ({ appConfig }: ConfigPanelStandaloneProps) => {
  return (
    <div className="fixed top-4 right-4 z-10 min-w-[280px] rounded-lg border border-gray-700 bg-gray-900/90 p-4 text-left backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-200">Configuration</h3>

      <div className="space-y-2 text-xs">
        {/* LiveKit URL */}
        <div className="flex flex-col space-y-1">
          <span className="text-gray-400">LiveKit URL:</span>
          <span className="font-mono text-[10px] break-all text-gray-300">
            {appConfig.livekitUrl || 'Not configured'}
          </span>
        </div>

        {/* Masked LiveKit API Key */}
        <div className="flex flex-col space-y-1 border-t border-gray-700/50 pt-2">
          <span className="text-gray-400">LiveKit API Key:</span>
          <span className="font-mono text-[10px] text-gray-300">
            {appConfig.maskedLivekitApiKey || 'Not configured'}
          </span>
        </div>

        {/* Agent Name */}
        <div className="flex flex-col space-y-1 border-t border-gray-700/50 pt-2">
          <span className="text-gray-400">Agent Name:</span>
          <span className="font-mono text-[10px] text-gray-300">
            {appConfig.agentName || 'Not configured'}
          </span>
        </div>
      </div>
    </div>
  );
};
