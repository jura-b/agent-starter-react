'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EnvironmentBadge } from '@/components/environment-badge';
import { AdvanceForm } from '@/components/forms/advance-form';
import { InboundCallForm } from '@/components/forms/inbound-call-form';
import { OutboundCallForm } from '@/components/forms/outbound-call-form';
import { ConfigPanelStandalone } from '@/components/livekit/config-panel-standalone';
import type { LiveKitEnvironment } from '@/lib/types';
import { cn } from '@/lib/utils';

// Environment-specific accent colors
const ENV_ACCENT_COLORS: Record<LiveKitEnvironment, { light: string; dark: string }> = {
  DEV: { light: '#1fd5f9', dark: '#1fd5f9' }, // Blue/Aqua for DEV
  PRD: { light: '#f97316', dark: '#fb923c' }, // Orange for PRD
  DEV_BP: { light: '#1fd5f9', dark: '#1fd5f9' }, // Same as DEV
  PRD_BP: { light: '#f97316', dark: '#fb923c' }, // Same as PRD
  LOCAL: { light: '#22c55e', dark: '#4ade80' }, // Green tone
};

const VALID_ENVIRONMENTS: LiveKitEnvironment[] = ['PRD', 'DEV', 'DEV_BP', 'PRD_BP', 'LOCAL'];

interface WelcomeProps {
  disabled: boolean;
  startButtonText: string;
  onStartCall: (data: {
    roomName: string;
    fromPhoneNumber: string;
    destinationPhoneNumber: string;
    participantName: string;
    participantType: 'user' | 'human_agent';
    environment: LiveKitEnvironment;
    participantAttributes?: Record<string, string>;
  }) => void;
}

export const Welcome = ({
  disabled,
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedEnvironment, setSelectedEnvironment] = useState<LiveKitEnvironment>('DEV');
  const [activeTab, setActiveTab] = useState<'inbound' | 'outbound' | 'advance'>('inbound');

  // Load environment and tab from URL on mount
  useEffect(() => {
    const envParam = searchParams.get('env');
    if (envParam && VALID_ENVIRONMENTS.includes(envParam as LiveKitEnvironment)) {
      setSelectedEnvironment(envParam as LiveKitEnvironment);
    }
    const tabParam = searchParams.get('tab');
    if (tabParam === 'inbound' || tabParam === 'outbound' || tabParam === 'advance') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Update accent colors based on environment
  useEffect(() => {
    const colors = ENV_ACCENT_COLORS[selectedEnvironment];
    const root = document.documentElement;
    root.style.setProperty('--primary', colors.light);
    root.style.setProperty('--primary-hover', `color-mix(in srgb, ${colors.light} 80%, #000)`);

    // Also set dark mode colors
    const darkStyle = document.getElementById('env-dark-style');
    if (darkStyle) {
      darkStyle.textContent = `.dark { --primary: ${colors.dark}; --primary-hover: color-mix(in srgb, ${colors.dark} 80%, #000); }`;
    } else {
      const style = document.createElement('style');
      style.id = 'env-dark-style';
      style.textContent = `.dark { --primary: ${colors.dark}; --primary-hover: color-mix(in srgb, ${colors.dark} 80%, #000); }`;
      document.head.appendChild(style);
    }
  }, [selectedEnvironment]);

  // Update URL when environment changes
  const handleEnvironmentChange = (env: LiveKitEnvironment) => {
    setSelectedEnvironment(env);
    const params = new URLSearchParams(searchParams.toString());
    params.set('env', env);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Update URL when tab changes
  const handleTabChange = (tab: 'inbound' | 'outbound' | 'advance') => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleStartCall = (data: {
    roomName: string;
    fromPhoneNumber: string;
    destinationPhoneNumber: string;
    participantName: string;
    participantType: 'user' | 'human_agent';
    participantAttributes?: Record<string, string>;
  }) => {
    onStartCall({ ...data, environment: selectedEnvironment });
  };

  return (
    <section
      ref={ref}
      inert={disabled}
      className={cn(
        'bg-background fixed inset-0 mx-auto flex h-svh flex-col items-center justify-center text-center',
        disabled ? 'z-10' : 'z-20'
      )}
    >
      <EnvironmentBadge environment={selectedEnvironment} />
      <ConfigPanelStandalone
        selectedEnvironment={selectedEnvironment}
        onEnvironmentChange={handleEnvironmentChange}
      />
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-fg0 mb-4 size-16"
      >
        <path
          d="M15 24V40C15 40.7957 14.6839 41.5587 14.1213 42.1213C13.5587 42.6839 12.7956 43 12 43C11.2044 43 10.4413 42.6839 9.87868 42.1213C9.31607 41.5587 9 40.7957 9 40V24C9 23.2044 9.31607 22.4413 9.87868 21.8787C10.4413 21.3161 11.2044 21 12 21C12.7956 21 13.5587 21.3161 14.1213 21.8787C14.6839 22.4413 15 23.2044 15 24ZM22 5C21.2044 5 20.4413 5.31607 19.8787 5.87868C19.3161 6.44129 19 7.20435 19 8V56C19 56.7957 19.3161 57.5587 19.8787 58.1213C20.4413 58.6839 21.2044 59 22 59C22.7956 59 23.5587 58.6839 24.1213 58.1213C24.6839 57.5587 25 56.7957 25 56V8C25 7.20435 24.6839 6.44129 24.1213 5.87868C23.5587 5.31607 22.7956 5 22 5ZM32 13C31.2044 13 30.4413 13.3161 29.8787 13.8787C29.3161 14.4413 29 15.2044 29 16V48C29 48.7957 29.3161 49.5587 29.8787 50.1213C30.4413 50.6839 31.2044 51 32 51C32.7956 51 33.5587 50.6839 34.1213 50.1213C34.6839 49.5587 35 48.7957 35 48V16C35 15.2044 34.6839 14.4413 34.1213 13.8787C33.5587 13.3161 32.7956 13 32 13ZM42 21C41.2043 21 40.4413 21.3161 39.8787 21.8787C39.3161 22.4413 39 23.2044 39 24V40C39 40.7957 39.3161 41.5587 39.8787 42.1213C40.4413 42.6839 41.2043 43 42 43C42.7957 43 43.5587 42.6839 44.1213 42.1213C44.6839 41.5587 45 40.7957 45 40V24C45 23.2044 44.6839 22.4413 44.1213 21.8787C43.5587 21.3161 42.7957 21 42 21ZM52 17C51.2043 17 50.4413 17.3161 49.8787 17.8787C49.3161 18.4413 49 19.2044 49 20V44C49 44.7957 49.3161 45.5587 49.8787 46.1213C50.4413 46.6839 51.2043 47 52 47C52.7957 47 53.5587 46.6839 54.1213 46.1213C54.6839 45.5587 55 44.7957 55 44V20C55 19.2044 54.6839 18.4413 54.1213 17.8787C53.5587 17.3161 52.7957 17 52 17Z"
          fill="currentColor"
        />
      </svg>

      <p className="text-fg1 max-w-prose pt-1 leading-6 font-medium">
        Chat live with your voice AI agent
      </p>

      <div className="mt-6 flex w-full max-w-6xl flex-col items-center">
        {/* Pill Tabs */}
        <div className="mb-6 inline-flex rounded-full bg-gray-800 p-1">
          <button
            type="button"
            onClick={() => handleTabChange('inbound')}
            className={cn(
              'cursor-pointer rounded-full px-6 py-2 text-sm font-medium transition-all',
              activeTab === 'inbound'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            )}
          >
            Inbound
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('outbound')}
            className={cn(
              'cursor-pointer rounded-full px-6 py-2 text-sm font-medium transition-all',
              activeTab === 'outbound'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            )}
          >
            Outbound
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('advance')}
            className={cn(
              'cursor-pointer rounded-full px-6 py-2 text-sm font-medium transition-all',
              activeTab === 'advance'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            )}
          >
            Advance
          </button>
        </div>

        {/* Form Content */}
        {activeTab === 'inbound' ? (
          <InboundCallForm
            startButtonText={startButtonText}
            onStartCall={handleStartCall}
            selectedEnvironment={selectedEnvironment}
            activeTab={activeTab}
          />
        ) : activeTab === 'outbound' ? (
          <OutboundCallForm
            onStartCall={handleStartCall}
            selectedEnvironment={selectedEnvironment}
            activeTab={activeTab}
          />
        ) : (
          <AdvanceForm
            onStartCall={handleStartCall}
            selectedEnvironment={selectedEnvironment}
            activeTab={activeTab}
          />
        )}
      </div>

      <footer className="fixed bottom-5 left-0 z-20 flex w-full items-center justify-center"></footer>
    </section>
  );
};
