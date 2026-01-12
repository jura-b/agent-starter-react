'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { KeyReturnIcon, ShareNetworkIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import type { LiveKitEnvironment } from '@/lib/types';
import { type SipCallUrlParameters, buildSipCallUrl } from '@/lib/utils';

interface TrunkOption {
  id: string;
  name: string;
}

interface OutboundCallFormProps {
  onStartCall: (data: {
    roomName: string;
    fromPhoneNumber: string;
    destinationPhoneNumber: string;
    participantName: string;
    participantType: 'user' | 'human_agent';
  }) => void;
  selectedEnvironment: LiveKitEnvironment;
}

export const OutboundCallForm = ({ onStartCall, selectedEnvironment }: OutboundCallFormProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // SIP form state variables
  const [sipNumber, setSipNumber] = useState('');
  const [sipTrunkId, setSipTrunkId] = useState('');
  const [sipCallTo, setSipCallTo] = useState('');
  const [shouldJoinAsHumanAgent, setShouldJoinAsHumanAgent] = useState(true);
  const [isSipCallLoading, setIsSipCallLoading] = useState(false);
  const [trunkList, setTrunkList] = useState<TrunkOption[]>([]);

  // Fetch trunk list when environment changes
  useEffect(() => {
    const fetchTrunkList = async () => {
      try {
        const response = await fetch(`/api/trunk-list?env=${selectedEnvironment}`);
        const data: TrunkOption[] = await response.json();
        setTrunkList(data);
        // Set default to first trunk if available
        if (data.length > 0) {
          setSipTrunkId(data[0].id);
        } else {
          setSipTrunkId('');
        }
      } catch (error) {
        console.error('Failed to fetch trunk list:', error);
        setTrunkList([]);
        setSipTrunkId('');
      }
    };
    fetchTrunkList();
  }, [selectedEnvironment]);

  // Load SIP form values from URL parameters on component mount
  useEffect(() => {
    const sipFrom = searchParams.get('sip_from');
    const sipTo = searchParams.get('sip_to');
    const sipTrunk = searchParams.get('sip_trunk');

    if (sipFrom) setSipNumber(sipFrom);
    if (sipTo) setSipCallTo(sipTo);
    if (sipTrunk) setSipTrunkId(sipTrunk);
  }, [searchParams]);

  // Handle SIP form submission
  const handleSipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSipCallAndJoin();
  };

  // Construct SIP room name similar to left form
  const getSipRoomName = () => {
    const roomParts = ['webout'];
    if (sipNumber.trim()) {
      roomParts.push(sipNumber.trim());
    }
    if (sipCallTo.trim()) {
      roomParts.push(sipCallTo.trim());
    }
    return roomParts.join('_');
  };

  // Handle SIP call creation and room join
  const handleSipCallAndJoin = async () => {
    setIsSipCallLoading(true);

    try {
      // Validate required SIP fields
      if (!sipNumber.trim() || !sipTrunkId.trim() || !sipCallTo.trim()) {
        throw new Error('Please fill in all required SIP fields');
      }

      // Generate room name
      const generatedRoomName = getSipRoomName();

      // Create SIP participant with form values (this will also dispatch agent)
      const sipResponse = await fetch('/api/sip-participant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sip_number: sipNumber.trim(),
          sip_trunk_id: sipTrunkId.trim(),
          sip_call_to: sipCallTo.trim(),
          room_name: generatedRoomName,
          wait_until_answered: true,
          environment: selectedEnvironment,
        }),
      });

      if (!sipResponse.ok) {
        const errorData = await sipResponse.text();
        throw new Error(`Room setup failed: ${errorData}`);
      }

      const sipData = await sipResponse.json();
      console.log('Room setup completed:', sipData);

      // Show success message
      toast.success('Room setup complete!', {
        description: 'SIP call created and agent dispatched. Joining as human-agent...',
      });

      // Wait a moment for the SIP call and agent to be ready
      setTimeout(() => {
        // Only join if user selected to join as human agent
        if (shouldJoinAsHumanAgent) {
          onStartCall({
            roomName: generatedRoomName,
            fromPhoneNumber: sipNumber.trim(),
            destinationPhoneNumber: sipCallTo.trim(),
            participantName: 'Human Agent',
            participantType: 'human_agent',
          });
        } else {
          toast.success('SIP call created successfully!', {
            description: 'Agent dispatched to room. Not joining room.',
          });
        }
      }, 2000); // Delay to allow SIP call and agent to initialize
    } catch (error) {
      console.error('Room setup error:', error);
      toast.error('Failed to setup room', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsSipCallLoading(false);
    }
  };

  // Handle copying SIP form URL to clipboard
  const handleCopySipUrl = async () => {
    const urlParams: SipCallUrlParameters = {
      sip_from: sipNumber.trim(),
      sip_to: sipCallTo.trim(),
      sip_trunk: sipTrunkId.trim(),
      env: selectedEnvironment,
    };

    const shareableUrl = buildSipCallUrl(urlParams);

    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast.success('SIP call link copied to clipboard!', {
        description: 'Share this URL to let others join the same SIP call room',
      });
    } catch (error) {
      console.error('Failed to copy SIP URL:', error);
      toast.error('Failed to copy SIP link');
    }
  };

  // Update URL when SIP form values change (but not on initial mount)
  useEffect(() => {
    // Skip on initial mount to avoid overriding URL parameters
    const hasSipUserInteracted =
      sipNumber !== '+66' || sipCallTo !== '' || sipTrunkId !== '';

    if (hasSipUserInteracted) {
      const sipUrlParams: SipCallUrlParameters = {
        sip_from: sipNumber.trim(),
        sip_to: sipCallTo.trim(),
        sip_trunk: sipTrunkId.trim(),
        env: selectedEnvironment,
      };

      const newUrl = buildSipCallUrl(sipUrlParams);
      router.replace(newUrl, { scroll: false });
    }
  }, [sipNumber, sipCallTo, sipTrunkId, selectedEnvironment, router]);

  return (
    <div className="w-full max-w-120 space-y-4 px-8">
      <h3 className="text-fg1 mb-4 text-center text-lg font-medium">SIP Outbound Call</h3>

      <form onSubmit={handleSipSubmit} className="space-y-3">
        <div>
          <label className="text-fg1 mb-1 block pl-4 text-left text-sm font-medium">
            SIP Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={sipNumber}
            onChange={(e) => setSipNumber(e.target.value)}
            placeholder="Enter SIP number"
            className="border-primary/50 focus:ring-primary bg-primary/10 w-full rounded-full border bg-gray-200 px-4 py-2 text-white focus:border-transparent focus:ring-2 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-fg1 mb-1 block pl-4 text-left text-sm font-medium">
            SIP Trunk ID <span className="text-red-500">*</span>
          </label>
          <select
            value={sipTrunkId}
            onChange={(e) => setSipTrunkId(e.target.value)}
            className="border-primary/50 focus:ring-primary bg-primary/10 w-full rounded-full border bg-gray-200 px-4 py-2 text-white focus:border-transparent focus:ring-2 focus:outline-none"
            required
          >
            <option value="" selected>Select SIP Trunk</option>
            {
              trunkList.map((trunk) => (
                <option key={trunk.id} value={trunk.id}>
                  {trunk.name} ({trunk.id})
                </option>
              ))
            }
          </select>
        </div>

        <div>
          <label className="text-fg1 mb-1 block pl-4 text-left text-sm font-medium">
            SIP Call To <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={sipCallTo}
            onChange={(e) => setSipCallTo(e.target.value)}
            placeholder="Enter destination number"
            className="border-primary/50 focus:ring-primary bg-primary/10 w-full rounded-full border bg-gray-200 px-4 py-2 text-white focus:border-transparent focus:ring-2 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-fg1 mb-3 block pl-4 text-left text-sm font-medium">
            After Call Picked Up
          </label>
          <div className="flex flex-row items-center justify-center space-x-3">
            <label className="has-checked:border-primary/50 has-checked:bg-primary/10 has-checked:text-primary hover:bg-primary/20 flex flex-1 cursor-pointer items-center rounded-lg border-2 border-gray-400 p-3 text-gray-400 transition-colors">
              <input
                type="radio"
                name="joinOption"
                value="join"
                checked={shouldJoinAsHumanAgent}
                onChange={() => setShouldJoinAsHumanAgent(true)}
                className="accent-primary mr-2 h-3 w-3"
              />
              <span className="text-sm">Join as Human Agent</span>
            </label>
            <label className="has-checked:border-primary/50 has-checked:bg-primary/10 has-checked:text-primary hover:bg-primary/20 flex flex-1 cursor-pointer items-center rounded-lg border-2 border-gray-400 p-3 text-gray-400 transition-colors">
              <input
                type="radio"
                name="joinOption"
                value="dontJoin"
                checked={!shouldJoinAsHumanAgent}
                onChange={() => setShouldJoinAsHumanAgent(false)}
                className="accent-primary mr-2 h-3 w-3"
              />
              <span className="text-sm">Do Not Join</span>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSipCallLoading}
          variant="primary"
          size="lg"
          className="mt-6 w-72 transform-gpu font-mono transition-transform hover:scale-110"
        >
          {isSipCallLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Setting up room...
            </>
          ) : (
            <>
              Create SIP Call & Join
              <KeyReturnIcon size={16} weight="fill" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-gray-400">Init SIP call, and join as human-agent</p>

      {/* Share URL Button for SIP Form */}
      {(sipNumber.trim() || sipCallTo.trim()) && (
        <button
          onClick={handleCopySipUrl}
          className="mt-8 w-full transform-gpu cursor-pointer rounded-lg border border-gray-600 bg-gray-800/50 p-3 text-white transition-colors transition-transform hover:scale-110 hover:bg-gray-700/50 focus:ring focus:ring-blue-800/50 focus:outline-none"
          title="Share SIP Call URL"
        >
          <div className="flex flex-col items-center justify-between">
            <div className="flex flex-row items-center justify-between space-x-2 text-gray-400">
              <div className="flex font-medium">Share Outbound Call URL</div>
              <div className="flex">
                <ShareNetworkIcon size={16} weight="regular" />
              </div>
            </div>
            <div className="flex w-full">
              <hr className="my-2 w-full border border-gray-800" />
            </div>

            <div className="flex">
              <p className="mt-1 font-mono text-sm font-semibold break-all text-gray-200">
                {getSipRoomName()}
              </p>
            </div>
          </div>
        </button>
      )}
    </div>
  );
};
