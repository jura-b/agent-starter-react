'use client';

import React from 'react';
import { ConnectionState } from 'livekit-client';
import { useConnectionState, useParticipants, useRoomContext } from '@livekit/components-react';
import { cn } from '@/lib/utils';

export const RoomInfo = () => {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const participants = useParticipants();

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
    <div className="fixed top-4 right-4 z-100 min-w-[200px] rounded-lg border border-gray-700 bg-gray-900/90 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-200">Room Info</h3>

      <div className="space-y-2 text-xs">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Status:</span>
          <div className="flex items-center space-x-2">
            <div className={cn('h-2 w-2 rounded-full', getConnectionColor())} />
            <span className="text-gray-300">{getConnectionText()}</span>
          </div>
        </div>

        {/* Room Name */}
        <div className="flex items-start justify-between space-x-2">
          <span className="whitespace-nowrap text-gray-400">Room:</span>
          <span className="text-right break-all text-gray-300">{room.name || 'Unknown'}</span>
        </div>

        {/* activeRecording */}
        <div className="flex items-start justify-between space-x-2">
          <span className="whitespace-nowrap text-gray-400">Is Recording:</span>
          <span className="text-right font-mono text-[10px] break-all text-gray-300">
            {room.isRecording ? 'Yes' : 'No'}
          </span>
        </div>

        {/* Participants Breakdown */}
        <div className="mt-2 border-t border-gray-700/50 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Users:</span>
            <span className="text-gray-300">{userCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Agents:</span>
            <span className="text-gray-300">{agentCount}</span>
          </div>
          <div className="flex items-center justify-between font-semibold">
            <span className="text-gray-400">Total:</span>
            <span className="text-gray-300">{participants.length}</span>
          </div>
        </div>

        {/* Session Time */}
        <div className="mt-2 border-t border-gray-700/50 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Started:</span>
            <span className="text-gray-300">
              {room.state === 'connected' ? new Date().toLocaleTimeString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
