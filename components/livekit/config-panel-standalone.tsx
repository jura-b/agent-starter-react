'use client';

import React, { useEffect, useState } from 'react';
import type { LiveKitEnvironment } from '@/lib/types';

interface ConfigPanelStandaloneProps {
  selectedEnvironment: LiveKitEnvironment;
  onEnvironmentChange: (env: LiveKitEnvironment) => void;
}

interface EnvConfig {
  livekitUrl: string;
  maskedLivekitApiKey: string;
  agentName: string;
}

export const ConfigPanelStandalone = ({
  selectedEnvironment,
  onEnvironmentChange,
}: ConfigPanelStandaloneProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [envConfig, setEnvConfig] = useState<EnvConfig | null>(null);

  useEffect(() => {
    const fetchEnvConfig = async () => {
      try {
        const res = await fetch(`/api/env-config?env=${selectedEnvironment}`);
        const data = await res.json();
        setEnvConfig(data);
      } catch (error) {
        console.error('Failed to fetch env config:', error);
      }
    };
    fetchEnvConfig();
  }, [selectedEnvironment]);

  return (
    <div className="fixed top-4 left-4 z-10 min-w-[280px] rounded-lg border border-gray-700 bg-gray-900/90 text-left backdrop-blur-sm">
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
          {/* Environment Selector */}
          <div className="flex flex-col space-y-1">
            <span className="text-gray-400">Environment:</span>
            <select
              value={selectedEnvironment}
              onChange={(e) => onEnvironmentChange(e.target.value as LiveKitEnvironment)}
              onClick={(e) => e.stopPropagation()}
              className="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="DEV">Development</option>
              <option value="PRD">Production</option>
              <option value="DEV_BP">Development BP</option>
              <option value="PRD_BP">Production BP</option>
              <option value="LOCAL">Local</option>
            </select>
          </div>

          {/* LiveKit URL */}
          <div className="flex flex-col space-y-1 border-t border-gray-700/50 pt-2">
            <span className="text-gray-400">LiveKit URL:</span>
            <span className="font-mono text-[10px] break-all text-gray-300">
              {envConfig?.livekitUrl || 'Loading...'}
            </span>
          </div>

          {/* Masked LiveKit API Key */}
          <div className="flex flex-col space-y-1 border-t border-gray-700/50 pt-2">
            <span className="text-gray-400">LiveKit API Key:</span>
            <span className="font-mono text-[10px] text-gray-300">
              {envConfig?.maskedLivekitApiKey || 'Loading...'}
            </span>
          </div>

          {/* Agent Name */}
          <div className="flex flex-col space-y-1 border-t border-gray-700/50 pt-2">
            <span className="text-gray-400">Agent Name:</span>
            <span className="font-mono text-[10px] text-gray-300">
              {envConfig?.agentName || 'Loading...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
