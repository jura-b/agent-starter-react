'use client';

import React, { useState } from 'react';
import type { LocalParticipant, RemoteParticipant } from 'livekit-client';
import type { AppConfig, LiveKitEnvironment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AgentActionPanel } from './agent-action-panel';
import { ConfigPanel } from './config-panel';
import { ParticipantsList } from './participants-list';
import { PhoneNumpad } from './phone-numpad';
import { RoomInfo } from './room-info';
import { RoomStartTime } from './room-start-time';

interface SidebarProps {
  appConfig: AppConfig;
  connectionData?: {
    roomName: string;
    fromPhoneNumber: string;
    destinationPhoneNumber: string;
    participantName: string;
    participantType: 'user' | 'human_agent';
    environment: LiveKitEnvironment;
  };
  localParticipant: LocalParticipant | undefined;
  remoteParticipants: RemoteParticipant[] | undefined;
  onCollapseChange?: (collapsed: boolean) => void;
  className?: string;
}

export function Sidebar({
  appConfig,
  connectionData,
  localParticipant,
  remoteParticipants,
  onCollapseChange,
  className,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapseChange?.(newState);
  };

  return (
    <>
      {/* Sidebar Container */}
      <div
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-80 border-r border-gray-700 bg-gray-900 transition-transform duration-300',
          isCollapsed && '-translate-x-full',
          className
        )}
      >
        {/* Toggle Button - Inside Sidebar */}
        <button
          onClick={handleToggle}
          className="absolute top-1 right-2 cursor-pointer rounded-full p-4 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
          aria-label={isCollapsed ? 'Show sidebar' : 'Hide sidebar'}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            )}
          </svg>
        </button>

        {/* Scrollable Content */}
        <div className="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 h-full overflow-y-auto">
          {/* Header */}
          <div className="border-b border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-100">Control Panel</h2>
          </div>

          {/* Room Start Time */}
          <RoomStartTime />
          <hr className="border-gray-700" />

          {/* Panels Container */}
          <div className="space-y-6 p-4">
            {/* Room Participants Panel */}
            <ParticipantsList />
            <hr className="border-gray-700" />
            {/* Room Info Panel */}
            <RoomInfo connectionData={connectionData} />
            <hr className="border-gray-700" />
            {/* Agent Actions Panel */}
            <AgentActionPanel
              localParticipant={localParticipant}
              remoteParticipants={remoteParticipants}
            />
            <hr className="border-gray-700" />
            {/* Phone Numpad Panel */}
            <PhoneNumpad localParticipant={localParticipant} />
            <hr className="border-gray-700" />
            {/* Configuration Panel */}
            <ConfigPanel environment={connectionData?.environment || 'DEV'} />
            <br />
            <br />
          </div>
        </div>
      </div>

      {/* Toggle Button - When Sidebar is Hidden */}
      {isCollapsed && (
        <button
          onClick={handleToggle}
          className="fixed top-4 left-0 z-50 cursor-pointer rounded-r-lg border border-l-0 border-gray-700 bg-gray-900/90 p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
          aria-label="Show sidebar"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}
    </>
  );
}
