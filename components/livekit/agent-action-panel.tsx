'use client';

import React, { useState } from 'react';
import type { LocalParticipant } from 'livekit-client';
import type { SendTextOptions } from 'livekit-client';
import { cn } from '@/lib/utils';

interface AgentActionPanelProps {
  localParticipant: LocalParticipant | undefined;
  className?: string;
}

export function AgentActionPanel({ localParticipant, className }: AgentActionPanelProps) {
  const [selectedAction, setSelectedAction] = useState<'HELLO' | 'HUMAN_AGENT_HANDOFF'>('HELLO');
  const [isLoading, setIsLoading] = useState(false);

  async function sendAction(action: 'HELLO' | 'HUMAN_AGENT_HANDOFF') {
    if (!localParticipant) {
      console.warn('No local participant available');
      return;
    }

    setIsLoading(true);

    try {
      // Create the payload with action and empty params
      const payload = {
        action: action,
        params: {},
      };

      // Convert payload to string
      const message = JSON.stringify(payload);

      // Use LiveKit's sendText method with hardcoded topic
      const options: SendTextOptions = {
        topic: 'agent.rpc',
      };

      // The sendText method returns a Promise<TextStreamInfo>
      const streamInfo = await localParticipant.sendText(message, options);
      console.log(`Action ${action} sent with stream ID:`, streamInfo.id);
    } catch (error) {
      console.error('Failed to send action:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleActionSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendAction(selectedAction);
  }

  return (
    <div className={cn('p-0', className)}>
      <h3 className="mb-3 text-sm font-semibold text-gray-200">Agent Actions</h3>
      <form onSubmit={handleActionSubmit} className="space-y-3">
        <div>
          <label htmlFor="agent-action" className="mb-1 block text-xs text-gray-400">
            Select Action
          </label>
          <select
            id="agent-action"
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value as 'HELLO' | 'HUMAN_AGENT_HANDOFF')}
            className="w-full cursor-pointer rounded-md border border-gray-700 bg-gray-800/50 px-2 py-1.5 text-xs text-gray-300 transition-colors focus:border-gray-600 focus:ring-1 focus:ring-gray-600 focus:outline-none"
            disabled={isLoading}
          >
            <option value="HELLO">Say Hello</option>
            <option value="HUMAN_AGENT_HANDOFF">Handoff to Human Agent</option>
            <option value="SESSION_HOLD">Session Hold</option>
            <option value="SESSION_RESUME">Session Resume</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isLoading || !localParticipant}
          className="w-full cursor-pointer rounded-md bg-gray-700/50 px-3 py-1.5 text-xs font-medium text-gray-200 transition-colors hover:bg-gray-700 focus:ring-1 focus:ring-gray-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send Action'}
        </button>
      </form>
    </div>
  );
}
