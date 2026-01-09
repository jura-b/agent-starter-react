'use client';

import React, { useEffect, useState } from 'react';
import type { LiveKitEnvironment } from '@/lib/types';

interface ConfigPanelProps {
  environment: LiveKitEnvironment;
}

interface EnvConfig {
  livekitUrl: string;
  maskedLivekitApiKey: string;
  agentName: string;
}

export const ConfigPanel = ({ environment }: ConfigPanelProps) => {
  const [envConfig, setEnvConfig] = useState<EnvConfig | null>(null);

  useEffect(() => {
    const fetchEnvConfig = async () => {
      try {
        const res = await fetch(`/api/env-config?env=${environment}`);
        const data = await res.json();
        setEnvConfig(data);
      } catch (error) {
        console.error('Failed to fetch env config:', error);
      }
    };
    fetchEnvConfig();
  }, [environment]);

  return (
    <div className="p-0">
      <h3 className="mb-3 text-sm font-semibold text-gray-200">Configuration</h3>

      <div className="space-y-2 text-xs">
        {/* Environment */}
        <div className="flex flex-col space-y-1">
          <span className="text-gray-400">Environment:</span>
          <span className="font-mono text-[10px] font-semibold text-blue-400">
            {environment === 'PRD' ? 'Production' : 'Development'}
          </span>
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
    </div>
  );
};
