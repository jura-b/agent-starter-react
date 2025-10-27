'use client';

import React, { useState } from 'react';
import { ConnectionState } from 'livekit-client';
import { useConnectionState, useParticipants, useRoomContext } from '@livekit/components-react';
import { cn, formatDateTime } from '@/lib/utils';

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
              {room.state === 'connected' ? formatDateTime(new Date()) : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
