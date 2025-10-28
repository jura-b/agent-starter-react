'use client';

import React, { useState } from 'react';
import { useParticipants } from '@livekit/components-react';
import { cn } from '@/lib/utils';

export const ParticipantsList = () => {
  const participants = useParticipants();
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null);

  // Sort participants: agents first, then others, all alphabetically by name
  const sortedParticipants = [...participants].sort((a, b) => {
    // Agents come first
    if (a.isAgent && !b.isAgent) return -1;
    if (!a.isAgent && b.isAgent) return 1;

    // Then sort alphabetically by name
    if (a.name && b.name) {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return (
    <div className="p-0">
      <h3 className="mb-3 text-sm font-semibold text-gray-200">
        Room Participants ({participants.length})
      </h3>
      <div className="space-y-2">
        {sortedParticipants.map((participant) => {
          const isExpanded = expandedParticipant === participant.sid;
          const zaiRole = participant.isAgent ? 'agent' : participant.attributes['zai.role'];
          const roleIcon = () => {
            if (participant.isAgent) {
              return '🤖';
            }
            if (zaiRole === 'user') {
              return '😀';
            } else if (zaiRole === 'human_agent') {
              return '🕵🏻‍♂️';
            }
            return '⁇';
          };

          return (
            <div
              key={participant.sid}
              className={`rounded-md border border-gray-700/50 ${participant.isLocal ? 'bg-green-800/50' : 'bg-gray-800/50'}`}
            >
              <button
                onClick={() => setExpandedParticipant(isExpanded ? null : participant.sid)}
                className="w-full cursor-pointer p-2 text-left transition-colors hover:bg-gray-700/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex w-full items-center space-x-1 text-sm text-gray-300">
                    <div
                      className={cn(
                        'h-2 w-2 flex-shrink-0 rounded-full',
                        participant.isSpeaking
                          ? 'animate-[pulse_0.5s_ease-in-out_infinite] bg-green-500'
                          : 'bg-gray-500'
                      )}
                    />
                    <span className="flex-shrink-0">{roleIcon()}</span>
                    <span className="max-w-[150px] truncate">{participant.name}</span>
                    <span className="flex-shrink-0 text-xs text-gray-600">({zaiRole})</span>
                    {participant.isLocal && (
                      <span className="flex flex-auto flex-shrink-0 justify-end px-1 text-xs text-gray-400">
                        (You)
                      </span>
                    )}
                  </div>
                  <svg
                    className={cn(
                      'h-4 w-4 text-gray-400 transition-transform',
                      isExpanded && 'rotate-180 transform'
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="space-y-1 border-t border-gray-700/50 p-3 text-xs text-gray-400">
                  <div>
                    <span className="font-semibold">Identity:</span> {participant.identity}
                  </div>
                  <div>
                    <span className="font-semibold">SID:</span> {participant.sid}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span>{' '}
                    {participant.connectionQuality || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-semibold">Joined:</span>{' '}
                    {participant.joinedAt
                      ? new Date(participant.joinedAt).toLocaleString(undefined, {
                        timeStyle: 'short',
                      })
                      : 'Unknown'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
