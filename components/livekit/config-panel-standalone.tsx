'use client';

import React, { useState } from 'react';
import type { AppConfig } from '@/lib/types';

interface ConfigPanelStandaloneProps {
  appConfig: AppConfig;
}

export const ConfigPanelStandalone = ({ appConfig }: ConfigPanelStandaloneProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="fixed top-4 right-4 z-10 min-w-[280px] rounded-lg border border-gray-700 bg-gray-900/90 text-left backdrop-blur-sm">
      {/* Header - Always visible */}
      <div
        className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-800/50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-sm font-semibold text-gray-200">Configuration</h3>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Collapsible content */}
      {!isCollapsed && (
        <div className="space-y-2 px-4 pb-4 text-xs">
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
      )}
    </div>
  );
};
