'use client';

import React, { useState } from 'react';
import { ConnectionState } from 'livekit-client';
import { toast } from 'sonner';
import { useConnectionState, useParticipants, useRoomContext } from '@livekit/components-react';
import { ShareNetworkIcon } from '@phosphor-icons/react';
import {
  type UrlParameters,
  buildShareableUrl,
  extractUrlParametersFromRoomName,
} from '@/lib/utils';
import { cn } from '@/lib/utils';

interface RoomInfoProps {
  connectionData?: {
    roomName: string;
    fromPhoneNumber: string;
    destinationPhoneNumber: string;
    participantName: string;
    participantType: 'user' | 'human_agent';
  };
}

export const RoomInfo = ({ connectionData }: RoomInfoProps) => {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const participants = useParticipants();

  // Handle copying URL to clipboard
  const handleCopyUrl = async () => {
    if (!connectionData) return;

    try {
      const urlParams = extractUrlParametersFromRoomName(
        connectionData.roomName,
        connectionData.participantType
      );

      const url = buildShareableUrl(urlParams);

      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!', {
        description: 'Share this URL to let others join with the same settings',
      });
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('Failed to copy link');
    }
  };

  const getConnectionColor = () => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return 'bg-green-500';
      case ConnectionState.Connecting:
        return 'bg-yellow-500';
      case ConnectionState.Reconnecting:
        return 'bg-orange-500';
      case ConnectionState.Disconnected:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getConnectionText = () => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return 'Connected';
      case ConnectionState.Connecting:
        return 'Connecting...';
      case ConnectionState.Reconnecting:
        return 'Reconnecting...';
      case ConnectionState.Disconnected:
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  const agentCount = participants.filter((p) => p.isAgent).length;
  const userCount = participants.filter((p) => !p.isAgent).length;

  return (
    <div className="p-0">
      <h3 className="mb-3 text-sm font-semibold text-gray-200">Room Info</h3>

      <div className="space-y-2 text-xs">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Status:</span>
          <div className="flex items-center space-x-2">
            <span className="text-gray-300">{getConnectionText()}</span>
            <div className={cn('h-2 w-2 rounded-full', getConnectionColor())} />
          </div>
        </div>

        {/* Room Name */}
        <div className="flex items-start justify-between space-x-2">
          <span className="whitespace-nowrap text-gray-400">Room:</span>
          <span className="text-right break-all text-gray-300">{room.name || 'Unknown'}</span>
        </div>

        {/* activeRecording */}
        <div className="flex items-start justify-between space-x-2">
          <span className="items-center whitespace-nowrap text-gray-400">Recording Status:</span>
          <div className="flex items-center space-x-2 text-right break-all text-gray-300">
            {room.isRecording ? (
              <>
                <div className="flex items-center">Recording</div>
                <div className="flex h-2 w-2 animate-pulse items-center rounded-full bg-red-500" />
              </>
            ) : (
              <>
                <div className="flex items-center">Not Recording</div>
                <div className="flex h-2 w-2 items-center rounded-full bg-gray-500" />
              </>
            )}
          </div>
        </div>

        {/* Share URL Button */}
        {connectionData && (
          <button
            onClick={handleCopyUrl}
            className="mt-4 flex w-auto cursor-pointer items-end justify-between space-x-4 justify-self-end rounded-lg bg-gray-700/50 px-4 py-2 text-white transition-colors hover:bg-gray-700"
            title="Copy shareable link"
          >
            <span className="text-xs font-medium">Share URL</span>
            <ShareNetworkIcon size={14} weight="regular" className="text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};
