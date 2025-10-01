'use client';

import React, { useState } from 'react';
import type { AppConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ConfigPanelProps {
  appConfig: AppConfig;
}

export const ConfigPanel = ({ appConfig }: ConfigPanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 z-100 min-w-[280px] rounded-lg border border-gray-700 bg-gray-900/90 text-left backdrop-blur-sm transition-transform duration-300',
        isCollapsed ? '-translate-x-[calc(100%-2.5rem)]' : 'translate-x-0'
      )}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-2 right-2 z-10 rounded p-1 text-gray-400 transition-colors hover:bg-gray-700/50 hover:text-gray-200"
      >
        <svg
          className={cn('h-4 w-4 transition-transform', isCollapsed && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div
        className={cn(
          'p-4 transition-opacity duration-300',
          isCollapsed && 'pointer-events-none opacity-0'
        )}
      >
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
    </div>
  );
};
