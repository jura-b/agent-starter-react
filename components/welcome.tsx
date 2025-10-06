import { useState } from 'react';
import { ConfigPanelStandalone } from '@/components/livekit/config-panel-standalone';
import { Button } from '@/components/ui/button';
import type { AppConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

interface WelcomeProps {
  disabled: boolean;
  startButtonText: string;
  onStartCall: (data: {
    roomName: string;
    fromPhoneNumber: string;
    destinationPhoneNumber: string;
    participantName: string;
  }) => void;
  appConfig: AppConfig;
}

export const Welcome = ({
  disabled,
  startButtonText,
  onStartCall,
  appConfig,
  ref,
}: React.ComponentProps<'div'> & WelcomeProps) => {
  const [fromPhoneNumber, setFromPhoneNumber] = useState('Eddie');
  const [destinationPhoneNumber, setDestinationPhoneNumber] = useState('+9999');
  const [suffix, setSuffix] = useState('');
  const [participantType, setParticipantType] = useState<'user' | 'human_agent'>('user');

  // Construct room name for preview
  const getRoomName = () => {
    const roomParts = ['web'];
    if (fromPhoneNumber.trim()) {
      roomParts.push(fromPhoneNumber.trim());
    }
    if (destinationPhoneNumber.trim()) {
      roomParts.push(destinationPhoneNumber.trim());
    }
    if (suffix.trim()) {
      roomParts.push(suffix.trim());
    }
    return roomParts.join('_');
  };

  const handleStartCall = () => {
    // Validate all required fields
    const roomName = getRoomName();

    if (!roomName || roomName === 'web') {
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
      participantName: participantType,
    });
  };

  return (
    <section
      ref={ref}
      inert={disabled}
      className={cn(
        'bg-background fixed inset-0 mx-auto flex h-svh flex-col items-center justify-center text-center',
        disabled ? 'z-10' : 'z-20'
      )}
    >
      {/* Config panel hidden for text-chat only demo */}
      {/* <ConfigPanelStandalone appConfig={appConfig} /> */}

      <img
        src="https://cdn.dribbble.com/userupload/42409823/file/original-568544560f6ca1076a16e3428302e329.gif"
        alt="Live AI"
        className="h-40 w-auto"
      />
      <p className="text-fg1 max-w-prose pt-1 leading-6 font-medium">
        Live AI - Chat Support Agent
      </p>

      <div className="mt-6 hidden w-64 space-y-3">
        <div>
          <label className="text-fg1 mb-1 block pl-4 text-left text-sm font-medium">Prefix</label>
          <input
            type="text"
            value="webdemo"
            disabled
            className="w-full cursor-not-allowed rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-gray-600"
          />
        </div>

        <div>
          <label className="text-fg1 mb-1 block pl-4 text-left text-sm font-medium">
            From Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            disabled
            value="Eddie"
            onChange={(e) => setFromPhoneNumber(e.target.value)}
            placeholder="Enter from phone number"
            className="w-full rounded-full border border-gray-300 bg-gray-200 px-4 py-2 text-black focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-fg1 mb-1 block pl-4 text-left text-sm font-medium">
            Destination Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            disabled
            type="text"
            value="+9999"
            onChange={(e) => setDestinationPhoneNumber(e.target.value)}
            placeholder="Enter destination phone number"
            className="w-full rounded-full border border-gray-300 bg-gray-200 px-4 py-2 text-black focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-fg1 mb-1 block pl-4 text-left text-sm font-medium">
            Suffix <span className="text-gray-500">(optional)</span>
          </label>
          <input
            disabled
            type="text"
            value={suffix}
            onChange={(e) => setSuffix(e.target.value)}
            placeholder="Enter suffix"
            className="w-full rounded-full border border-gray-300 bg-gray-200 px-4 py-2 text-black focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-fg1 mb-3 block pl-4 text-left text-sm font-medium">
            Participant Type
          </label>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center space-x-3 rounded-md px-4 transition-colors hover:bg-gray-800">
              <input
                type="radio"
                name="participantType"
                value="user"
                checked={participantType === 'user'}
                onChange={(e) => setParticipantType(e.target.value as 'user' | 'human_agent')}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-200">User</span>
            </label>
            <label className="flex cursor-pointer items-center space-x-3 rounded-md px-4 transition-colors hover:bg-gray-800">
              <input
                type="radio"
                name="participantType"
                value="human_agent"
                checked={participantType === 'human_agent'}
                onChange={(e) => setParticipantType(e.target.value as 'user' | 'human_agent')}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-200">Human Agent</span>
            </label>
          </div>
        </div>
      </div>

      {/* {(fromPhoneNumber || destinationPhoneNumber) && (
        <div className="mt-12 w-64 rounded-full border border-gray-600 p-3 text-white">
          <p className="text-sm text-gray-400">LiveKit Room Name</p>
          <hr className="my-2 border-gray-600" />
          <p className="mt-1 font-mono text-sm font-semibold break-all text-gray-200">
            {getRoomName()}
          </p>
        </div>
      )} */}

      <Button variant="primary" size="lg" onClick={handleStartCall} className="mt-6 w-64 font-mono">
        {startButtonText}
      </Button>
      <footer className="fixed bottom-5 left-0 z-20 flex w-full items-center justify-center"></footer>
    </section>
  );
};
