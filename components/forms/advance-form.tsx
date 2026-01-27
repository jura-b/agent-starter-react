'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CopySimpleIcon, DiceFiveIcon, DiceTwoIcon, KeyReturnIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import type { LiveKitEnvironment } from '@/lib/types';

interface AdvanceFormProps {
  onStartCall: (data: {
    roomName: string;
    fromPhoneNumber: string;
    destinationPhoneNumber: string;
    participantName: string;
    participantType: 'user' | 'human_agent';
    participantAttributes: Record<string, string>;
  }) => void;
  selectedEnvironment: LiveKitEnvironment;
  activeTab: 'inbound' | 'outbound' | 'advance';
}

const ZAI_FIELDS_COL1 = [
  { key: 'zai.role', label: 'zai.role' },
  { key: 'zai.config_source', label: 'zai.config_source' },
  { key: 'zai.channel_type', label: 'zai.channel_type' },
  { key: 'zai.channel_identifier', label: 'zai.channel_identifier' },
  { key: 'zai.customer_identifier', label: 'zai.customer_identifier' },
  { key: 'zai.chat_ctx_id', label: 'zai.chat_ctx_id' },
] as const;

const ZAI_FIELDS_COL2 = [
  { key: 'zai.outbound_batch_record_id', label: 'zai.outbound_batch_record_id' },
  { key: 'zai.agent_identifier', label: 'zai.agent_identifier' },
  { key: 'zai.agent_id', label: 'zai.agent_id' },
  { key: 'zai.agent_revision_id', label: 'zai.agent_revision_id' },
  { key: 'zai.sip_direction', label: 'zai.sip_direction' },
  { key: 'zai.sip_number', label: 'zai.sip_number' },
] as const;

const SIP_FIELDS = [
  { key: 'sip.trunkPhoneNumber', label: 'sip.trunkPhoneNumber' },
  { key: 'sip.phoneNumber', label: 'sip.phoneNumber' },
  { key: 'sip.callerId', label: 'sip.callerId' },
  { key: 'sip.fromUser', label: 'sip.fromUser' },
] as const;

const ALL_FIELDS = [...ZAI_FIELDS_COL1, ...ZAI_FIELDS_COL2, ...SIP_FIELDS] as const;

const SELECT_OPTIONS: Record<string, string[]> = {
  'zai.role': ['ai_agent', 'human_agent', 'user'],
  'zai.config_source': ['api', 'session_config_api', 'agent_session_config_api', 'file'],
  'zai.channel_type': ['livekit_audio', 'livekit_text'],
  'zai.sip_direction': ['inbound', 'outbound'],
};

export const AdvanceForm = ({ onStartCall, selectedEnvironment, activeTab }: AdvanceFormProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [attributes, setAttributes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of ALL_FIELDS) {
      initial[field.key] = '';
    }
    return initial;
  });

  // Load form values from URL on mount
  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam) setRoomName(roomParam);

    const loaded: Record<string, string> = {};
    for (const field of ALL_FIELDS) {
      const val = searchParams.get(field.key);
      if (val) loaded[field.key] = val;
    }
    if (Object.keys(loaded).length > 0) {
      setAttributes((prev) => ({ ...prev, ...loaded }));
    }
  }, [searchParams]);

  // Sync form values to URL (but not on initial mount)
  useEffect(() => {
    // Skip on initial mount to avoid overriding URL parameters
    const hasUserInteracted =
      roomName !== '' || Object.values(attributes).some((v) => v.trim() !== '');

    if (hasUserInteracted) {
      const params = new URLSearchParams();
      params.set('tab', activeTab);
      params.set('env', selectedEnvironment);
      if (roomName.trim()) params.set('room', roomName.trim());
      for (const field of ALL_FIELDS) {
        if (attributes[field.key]?.trim()) {
          params.set(field.key, attributes[field.key].trim());
        }
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [roomName, attributes, selectedEnvironment, activeTab, router]);

  const handleAttributeChange = (key: string, value: string) => {
    setAttributes((prev) => ({ ...prev, [key]: value }));
  };

  const renderField = (field: { key: string; label: string }) => {
    const options = SELECT_OPTIONS[field.key];
    return (
      <div key={field.key}>
        <label className="text-fg1 mb-1 block pl-4 text-left text-sm font-medium">
          {field.label} <span className="text-gray-500">(optional)</span>
        </label>
        {options ? (
          <select
            value={attributes[field.key]}
            onChange={(e) => handleAttributeChange(field.key, e.target.value)}
            className="border-primary/50 focus:ring-primary bg-primary/10 w-full appearance-none rounded-full border bg-gray-200 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23999%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[position:right_16px_center] bg-no-repeat py-2 pr-10 pl-4 text-white focus:border-transparent focus:ring-2 focus:outline-none"
          >
            <option value="">— empty —</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={attributes[field.key]}
            onChange={(e) => handleAttributeChange(field.key, e.target.value)}
            placeholder={`Enter ${field.label}`}
            className="border-primary/50 focus:ring-primary bg-primary/10 w-full rounded-full border bg-gray-200 px-4 py-2 text-white focus:border-transparent focus:ring-2 focus:outline-none"
          />
        )}
      </div>
    );
  };

  const generateRandomRoomName = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'adv_';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const startCall = (overrideRoomName?: string) => {
    const name = overrideRoomName || roomName.trim();

    // Build non-empty attributes
    const participantAttributes: Record<string, string> = {};
    for (const [key, value] of Object.entries(attributes)) {
      if (value.trim()) {
        participantAttributes[key] = value.trim();
      }
    }

    const participantType: 'user' | 'human_agent' =
      participantAttributes['zai.role'] === 'human_agent' ? 'human_agent' : 'user';

    onStartCall({
      roomName: name,
      fromPhoneNumber: '',
      destinationPhoneNumber: '',
      participantName: '',
      participantType,
      participantAttributes,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomName.trim()) {
      alert('Room Name is required.');
      return;
    }

    startCall();
  };

  const handleRandomRoomNameAndStart = () => {
    const randomName = generateRandomRoomName();
    setRoomName(randomName);
    startCall(randomName);
  };

  const handleCopyAttributesAsJson = async () => {
    const nonEmpty: Record<string, string> = {};
    for (const [key, value] of Object.entries(attributes)) {
      if (value.trim()) {
        nonEmpty[key] = value.trim();
      }
    }
    const json = JSON.stringify(nonEmpty, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      toast.success('Attributes copied to clipboard!');
    } catch {
      toast.error('Failed to copy attributes');
    }
  };

  return (
    <div className="w-full max-w-360 space-y-4 px-8">
      <h3 className="text-fg1 mb-4 text-center text-lg font-medium">Advance Mode</h3>

      <form onSubmit={handleSubmit} className="space-y-3 space-x-3">
        {/* Room Name */}
        <div>
          <label className="text-fg1 mb-1 block pl-4 text-left text-sm font-medium">
            Room Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name"
            className="border-primary/50 focus:ring-primary bg-primary/10 w-full rounded-full border bg-gray-200 px-4 py-2 text-white focus:border-transparent focus:ring-2 focus:outline-none"
            required
          />
        </div>

        {/* Attribute fields in 3 columns: zai col1 | zai col2 | sip */}
        <div className="grid max-h-[60vh] grid-cols-3 gap-6 overflow-y-auto pr-1">
          {/* Column 1: zai.* */}
          <div className="space-y-3">
            <h4 className="text-fg1 pl-4 text-left text-sm font-semibold">ZAI Attributes</h4>
            {ZAI_FIELDS_COL1.map(renderField)}
          </div>

          {/* Column 2: zai.* (continued) */}
          <div className="space-y-3">
            <h4 className="text-fg1 pl-4 text-left text-sm font-semibold">ZAI Attributes</h4>
            {ZAI_FIELDS_COL2.map(renderField)}
          </div>

          {/* Column 3: sip.* */}
          <div className="space-y-3">
            <h4 className="text-fg1 pl-4 text-left text-sm font-semibold">SIP Attributes</h4>
            {SIP_FIELDS.map(renderField)}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="mt-6 w-72 transform-gpu font-mono transition-transform hover:scale-110"
        >
          Start <KeyReturnIcon size={16} weight="fill" />
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={handleRandomRoomNameAndStart}
          className="mt-3 w-72 transform-gpu flex-row items-center justify-center font-mono text-xs text-gray-300 transition-transform hover:scale-110 hover:bg-gray-800 hover:text-white"
        >
          <DiceFiveIcon size={16} weight="fill" className="animate-roll2 flex" />
          <span className="flex">Random Room Name &amp; Start</span>
          <DiceTwoIcon size={16} weight="fill" className="animate-roll flex" />
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={handleCopyAttributesAsJson}
          className="mt-3 w-72 transform-gpu flex-row items-center justify-center font-mono text-xs text-gray-300 transition-transform hover:scale-110 hover:bg-gray-800 hover:text-white"
        >
          <CopySimpleIcon size={16} weight="fill" className="flex" />
          <span className="flex">Copy Attributes as JSON</span>
        </Button>
      </form>
    </div>
  );
};
