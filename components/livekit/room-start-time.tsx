'use client';

import React, { useEffect, useState } from 'react';
import { useParticipants } from '@livekit/components-react';
import { SlidingNumber } from '@/components/ui/shadcn-io/sliding-number';
import { formatDateTime } from '@/lib/utils';

export const RoomStartTime = () => {
  const participants = useParticipants();
  const [elapsedTime, setElapsedTime] = useState<string>('--:--:--');
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Find the agent participant and get their joinedAt time
  useEffect(() => {
    const agentParticipant = participants.find((p) => p.isAgent);
    if (agentParticipant && agentParticipant.joinedAt) {
      const joinedTime = new Date(agentParticipant.joinedAt);
      setStartTime(joinedTime);
    }
  }, [participants]);

  // Update elapsed time every second
  useEffect(() => {
    if (!startTime) return;

    const updateElapsedTime = () => {
      const now = new Date();
      const diff = now.getTime() - startTime.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      setElapsedTime(formattedTime);
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="p-4">
      <div className="text-center">
        <div className="mb-2 flex items-center justify-center">
          {elapsedTime === '--:--:--' ? (
            <div className="flex items-center font-mono text-2xl leading-none font-semibold text-gray-300">
              <span className="rounded-md border border-gray-700/50 bg-gray-500 p-2">--</span>
              <span className="mx-1">:</span>
              <span className="rounded-md border border-gray-700/50 bg-gray-500 p-2">--</span>
              <span className="mx-1">:</span>
              <span className="rounded-md border border-gray-700/50 bg-gray-500 p-2">--</span>
            </div>
          ) : (
            <div className="flex items-center font-mono text-2xl leading-none font-semibold text-gray-300">
              {/* Hours */}
              <SlidingNumber
                number={parseInt(elapsedTime.split(':')[0] || '0')}
                className="rounded-md border border-gray-700/50 bg-gray-700 p-2"
                transition={{ stiffness: 200, damping: 20 }}
                padStart={true}
              />
              <span className="mx-1">:</span>
              {/* Minutes */}
              <SlidingNumber
                number={parseInt(elapsedTime.split(':')[1] || '0')}
                className="rounded-md border border-gray-700/50 bg-gray-600 p-2"
                transition={{ stiffness: 200, damping: 20 }}
                padStart={true}
              />
              <span className="mx-1">:</span>
              {/* Seconds */}
              <SlidingNumber
                number={parseInt(elapsedTime.split(':')[2] || '0')}
                className="rounded-md border border-gray-700/50 bg-gray-500 p-2"
                transition={{ stiffness: 200, damping: 20 }}
                padStart={true}
              />
            </div>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-400">
          {startTime ? `Started at ${formatDateTime(startTime)}` : 'Waiting for agent...'}
        </div>
      </div>
    </div>
  );
};
