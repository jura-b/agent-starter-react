'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { DiceFiveIcon, DiceTwoIcon, KeyReturnIcon, ShareNetworkIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import type { LiveKitEnvironment } from '@/lib/types';
import { type SimulatedCallUrlParameters, buildSimulatedCallUrl } from '@/lib/utils';

interface InboundCallFormProps {
  startButtonText: string;
  onStartCall: (data: {
    roomName: string;
    fromPhoneNumber: string;
    destinationPhoneNumber: string;
    participantName: string;
    participantType: 'user' | 'human_agent';
  }) => void;
  selectedEnvironment: LiveKitEnvironment;
  activeTab: 'inbound' | 'outbound';
}

export const InboundCallForm = ({
  startButtonText,
  onStartCall,
  selectedEnvironment,
  activeTab,
}: InboundCallFormProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [fromPhoneNumber, setFromPhoneNumber] = useState('+66');
  const [destinationPhoneNumber, setDestinationPhoneNumber] = useState('+66');
  const [suffix, setSuffix] = useState('');
  const [participantType, setParticipantType] = useState<'user' | 'human_agent'>('user');
  const [useStaticRoomName, setUseStaticRoomName] = useState(false);
  const [staticRoomName, setStaticRoomName] = useState('');

  // Load form values from URL parameters on component mount
  useEffect(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const suffixParam = searchParams.get('suffix');
    const type = searchParams.get('type');
    const roomParam = searchParams.get('room');

    if (roomParam) {
      setUseStaticRoomName(true);
      setStaticRoomName(roomParam);
    } else {
      if (from) setFromPhoneNumber(from);
      if (to) setDestinationPhoneNumber(to);
      if (suffixParam) setSuffix(suffixParam);
    }
    if (type === 'human_agent') setParticipantType('human_agent');
  }, [searchParams]);

  // Generate shareable URL with current form values
  const generateShareableUrl = () => {
    const urlParams: SimulatedCallUrlParameters = useStaticRoomName
      ? {
          from: '',
          to: '',
          type: participantType,
          room: staticRoomName.trim(),
          env: selectedEnvironment,
          tab: activeTab,
        }
      : {
          from: fromPhoneNumber.trim(),
          to: destinationPhoneNumber.trim(),
          type: participantType,
          suffix: suffix.trim() || undefined,
          env: selectedEnvironment,
          tab: activeTab,
        };

    return buildSimulatedCallUrl(urlParams);
  };

  // Handle copying URL to clipboard
  const handleCopyUrl = async () => {
    const url = generateShareableUrl();

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!', {
        description: 'Share this URL to let others join with the same settings',
      });
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('Failed to copy link');
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleStartCall();
  };

  // Generate random suffix
  const generateRandomSuffix = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Handle random suffix and start
  const handleRandomSuffixAndStart = () => {
    const randomSuffix = generateRandomSuffix();
    setSuffix(randomSuffix);

    // Validate required fields first
    const roomName = getRoomName(randomSuffix);

    if (!roomName || roomName === 'webin') {
      alert('Room name is required. Please enter phone numbers.');
      return;
    }

    if (!fromPhoneNumber.trim() || fromPhoneNumber.trim() === '+66') {
      alert('From phone number is required. Please enter a complete phone number.');
      return;
    }

    if (!destinationPhoneNumber.trim() || destinationPhoneNumber.trim() === '+66') {
      alert('Destination phone number is required. Please enter a complete phone number.');
      return;
    }

    // Start call with random suffix
    onStartCall({
      roomName,
      fromPhoneNumber: fromPhoneNumber.trim(),
      destinationPhoneNumber: destinationPhoneNumber.trim(),
      participantName: '',
      participantType,
    });
  };

  // Update URL when form values change (but not on initial mount)
  useEffect(() => {
    // Skip on initial mount to avoid overriding URL parameters
    const hasUserInteracted = useStaticRoomName
      ? staticRoomName !== ''
      : fromPhoneNumber !== '+66' ||
        destinationPhoneNumber !== '+66' ||
        suffix !== '' ||
        participantType !== 'user';

    if (hasUserInteracted) {
      const urlParams: SimulatedCallUrlParameters = useStaticRoomName
        ? {
            from: '',
            to: '',
            type: participantType,
            room: staticRoomName.trim(),
            env: selectedEnvironment,
            tab: activeTab,
          }
        : {
            from: fromPhoneNumber.trim(),
            to: destinationPhoneNumber.trim(),
            type: participantType,
            suffix: suffix.trim() || undefined,
            env: selectedEnvironment,
            tab: activeTab,
          };

      const newUrl = buildSimulatedCallUrl(urlParams);
      router.replace(newUrl, { scroll: false });
    }
  }, [
    fromPhoneNumber,
    destinationPhoneNumber,
    suffix,
    participantType,
    selectedEnvironment,
    useStaticRoomName,
    staticRoomName,
    activeTab,
    router,
  ]);

  // Construct room name for preview
  const getRoomName = (overwrittenSuffix?: string) => {
    // If using static room name, return it directly
    if (useStaticRoomName) {
      return staticRoomName.trim();
    }

    const roomParts = ['webin'];
    if (fromPhoneNumber.trim()) {
      roomParts.push(fromPhoneNumber.trim());
    }
    if (destinationPhoneNumber.trim()) {
      roomParts.push(destinationPhoneNumber.trim());
    }

    if (overwrittenSuffix) {
      roomParts.push(overwrittenSuffix);
    } else if (suffix.trim()) {
      roomParts.push(suffix.trim());
    }

    return roomParts.join('_');
  };

  const handleStartCall = () => {
    // Validate all required fields
    const roomName = getRoomName();

    if (useStaticRoomName) {
      // Validate static room name
      if (!roomName) {
        alert('Room name is required.');
        return;
      }

      onStartCall({
        roomName,
        fromPhoneNumber: '',
        destinationPhoneNumber: '',
        participantName: '',
        participantType,
      });
    } else {
      // Validate dynamic room name fields
      if (!roomName || roomName === 'webin') {
        alert('Room name is required. Please enter phone numbers.');
        return;
      }

      if (!fromPhoneNumber.trim() || fromPhoneNumber.trim() === '+66') {
        alert('From phone number is required. Please enter a complete phone number.');
        return;
      }

      if (!destinationPhoneNumber.trim() || destinationPhoneNumber.trim() === '+66') {
        alert('Destination phone number is required. Please enter a complete phone number.');
        return;
      }

      onStartCall({
        roomName,
        fromPhoneNumber: fromPhoneNumber.trim(),
        destinationPhoneNumber: destinationPhoneNumber.trim(),
        participantName: '',
        participantType,
      });
    }
  };

  return (
    <div className="w-full max-w-120 space-y-4 px-8">
      <h3 className="text-fg1 mb-4 text-center text-lg font-medium">SIP Inbound Call</h3>

      <form onSubmit={handleSubmit} className="w-full space-y-3">
        {/* Static Room Name Toggle */}
        <div className="flex items-center justify-start pl-4">
          <label className="flex cursor-pointer items-center space-x-2">
            <input
              type="checkbox"
              checked={useStaticRoomName}
              onChange={(e) => setUseStaticRoomName(e.target.checked)}
              className="accent-primary h-4 w-4 rounded"
            />
            <span className="text-fg1 text-sm font-medium">Use Room Name</span>
          </label>
        </div>

        {useStaticRoomName ? (
          /* Static Room Name Input */
          <div>
            <label className="text-fg1 mb-1 block pl-4 text-left text-sm font-medium">
              Room Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={staticRoomName}
              onChange={(e) => setStaticRoomName(e.target.value)}
              placeholder="Enter room name"
              className="border-primary/50 focus:ring-primary bg-primary/10 w-full rounded-full border bg-gray-200 px-4 py-2 text-white focus:border-transparent focus:ring-2 focus:outline-none"
              required
            />
          </div>
        ) : (
          /* Dynamic Room Name Inputs */
          <>
            <div>
              <label className="text-fg1 mb-1 block pl-4 text-left text-sm font-medium">
                From Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fromPhoneNumber}
                onChange={(e) => setFromPhoneNumber(e.target.value)}
                placeholder="Enter from phone number"
                className="border-primary/50 focus:ring-primary bg-primary/10 w-full rounded-full border bg-gray-200 px-4 py-2 text-white focus:border-transparent focus:ring-2 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-fg1 mb-1 block pl-4 text-left text-sm font-medium">
                Destination Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={destinationPhoneNumber}
                onChange={(e) => setDestinationPhoneNumber(e.target.value)}
                placeholder="Enter destination phone number"
                className="border-primary/50 focus:ring-primary bg-primary/10 w-full rounded-full border bg-gray-200 px-4 py-2 text-white focus:border-transparent focus:ring-2 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-fg1 mb-1 block pl-4 text-left text-sm font-medium">
                Suffix <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="text"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                placeholder="Enter suffix"
                className="border-primary/50 focus:ring-primary bg-primary/10 w-full rounded-full border bg-gray-200 px-4 py-2 text-white focus:border-transparent focus:ring-2 focus:outline-none"
              />
            </div>
          </>
        )}

        <div>
          <label className="text-fg1 mb-3 block pl-4 text-left text-sm font-medium">
            Participant Type
          </label>
          <div className="flex flex-row items-center justify-center space-x-3">
            <label className="has-checked:border-primary/50 has-checked:bg-primary/10 has-checked:text-primary hover:bg-primary/20 flex flex-1 cursor-pointer items-center rounded-lg border-2 border-gray-400 p-3 text-gray-400 transition-colors">
              <input
                type="radio"
                name="participantType"
                value="user"
                checked={participantType === 'user'}
                onChange={(e) => setParticipantType(e.target.value as 'user' | 'human_agent')}
                className="accent-primary mr-2 h-3 w-3"
              />
              <span className="text-sm">User</span>
            </label>
            <label className="has-checked:border-primary/50 has-checked:bg-primary/10 has-checked:text-primary hover:bg-primary/20 flex flex-1 cursor-pointer items-center rounded-lg border-2 border-gray-400 p-3 text-gray-400 transition-colors">
              <input
                type="radio"
                name="participantType"
                value="human_agent"
                checked={participantType === 'human_agent'}
                onChange={(e) => setParticipantType(e.target.value as 'user' | 'human_agent')}
                className="accent-primary mr-2 h-3 w-3"
              />
              <span className="text-sm">Human Agent</span>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="mt-6 w-72 transform-gpu font-mono transition-transform hover:scale-110"
        >
          {startButtonText} <KeyReturnIcon size={16} weight="fill" />
        </Button>

        {!useStaticRoomName && (
          <Button
            variant="secondary"
            size="lg"
            onClick={handleRandomSuffixAndStart}
            className="mt-3 w-72 transform-gpu flex-row items-center justify-center font-mono text-xs text-gray-300 transition-transform hover:scale-110 hover:bg-gray-800 hover:text-white"
          >
            <DiceFiveIcon size={16} weight="fill" className="animate-roll2 flex" />
            <span className="flex">Random Suffix and Start</span>
            <DiceTwoIcon size={16} weight="fill" className="animate-roll flex" />
          </Button>
        )}
      </form>

      {/* Share URL Button */}
      {(useStaticRoomName ? staticRoomName : fromPhoneNumber || destinationPhoneNumber) && (
        <button
          onClick={handleCopyUrl}
          className="mt-8 w-full transform-gpu cursor-pointer rounded-lg border border-gray-600 bg-gray-800/50 p-3 text-white transition-colors transition-transform hover:scale-110 hover:bg-gray-700/50 focus:ring focus:ring-blue-800/50 focus:outline-none"
          title="Share URL"
        >
          <div className="flex flex-col items-center justify-between">
            <div className="flex flex-row items-center justify-between space-x-2 text-gray-400">
              <div className="flex font-medium">Share URL</div>
              <div className="flex">
                <ShareNetworkIcon size={16} weight="regular" />
              </div>
            </div>
            <div className="flex w-full">
              <hr className="my-2 w-full border border-gray-800" />
            </div>

            <div className="flex">
              <p className="mt-1 font-mono text-sm font-semibold break-all text-gray-200">
                {getRoomName()}
              </p>
            </div>
          </div>
        </button>
      )}
    </div>
  );
};
