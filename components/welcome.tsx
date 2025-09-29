import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WelcomeProps {
  disabled: boolean;
  startButtonText: string;
  onStartCall: (roomName?: string) => void;
}

export const Welcome = ({
  disabled,
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeProps) => {
  const [fromPhoneNumber, setFromPhoneNumber] = useState('+66');
  const [destinationPhoneNumber, setDestinationPhoneNumber] = useState('+66');
  const [suffix, setSuffix] = useState('');

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
    if (!fromPhoneNumber.trim()) {
      alert('From phone number is required');
      return;
    }
    if (!destinationPhoneNumber.trim()) {
      alert('Destination phone number is required');
      return;
    }

    const roomName = getRoomName();
    onStartCall(roomName);
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
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-fg0 mb-4 size-16"
      >
        <path
          d="M15 24V40C15 40.7957 14.6839 41.5587 14.1213 42.1213C13.5587 42.6839 12.7956 43 12 43C11.2044 43 10.4413 42.6839 9.87868 42.1213C9.31607 41.5587 9 40.7957 9 40V24C9 23.2044 9.31607 22.4413 9.87868 21.8787C10.4413 21.3161 11.2044 21 12 21C12.7956 21 13.5587 21.3161 14.1213 21.8787C14.6839 22.4413 15 23.2044 15 24ZM22 5C21.2044 5 20.4413 5.31607 19.8787 5.87868C19.3161 6.44129 19 7.20435 19 8V56C19 56.7957 19.3161 57.5587 19.8787 58.1213C20.4413 58.6839 21.2044 59 22 59C22.7956 59 23.5587 58.6839 24.1213 58.1213C24.6839 57.5587 25 56.7957 25 56V8C25 7.20435 24.6839 6.44129 24.1213 5.87868C23.5587 5.31607 22.7956 5 22 5ZM32 13C31.2044 13 30.4413 13.3161 29.8787 13.8787C29.3161 14.4413 29 15.2044 29 16V48C29 48.7957 29.3161 49.5587 29.8787 50.1213C30.4413 50.6839 31.2044 51 32 51C32.7956 51 33.5587 50.6839 34.1213 50.1213C34.6839 49.5587 35 48.7957 35 48V16C35 15.2044 34.6839 14.4413 34.1213 13.8787C33.5587 13.3161 32.7956 13 32 13ZM42 21C41.2043 21 40.4413 21.3161 39.8787 21.8787C39.3161 22.4413 39 23.2044 39 24V40C39 40.7957 39.3161 41.5587 39.8787 42.1213C40.4413 42.6839 41.2043 43 42 43C42.7957 43 43.5587 42.6839 44.1213 42.1213C44.6839 41.5587 45 40.7957 45 40V24C45 23.2044 44.6839 22.4413 44.1213 21.8787C43.5587 21.3161 42.7957 21 42 21ZM52 17C51.2043 17 50.4413 17.3161 49.8787 17.8787C49.3161 18.4413 49 19.2044 49 20V44C49 44.7957 49.3161 45.5587 49.8787 46.1213C50.4413 46.6839 51.2043 47 52 47C52.7957 47 53.5587 46.6839 54.1213 46.1213C54.6839 45.5587 55 44.7957 55 44V20C55 19.2044 54.6839 18.4413 54.1213 17.8787C53.5587 17.3161 52.7957 17 52 17Z"
          fill="currentColor"
        />
      </svg>

      <p className="text-fg1 max-w-prose pt-1 leading-6 font-medium">
        Chat live with your voice AI agent
      </p>

      <div className="mt-6 space-y-3 w-64">
        <div>
          <label className="block text-sm font-medium text-fg1 mb-1">Prefix</label>
          <input
            type="text"
            value="web"
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-fg1 mb-1">
            From Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fromPhoneNumber}
            onChange={(e) => setFromPhoneNumber(e.target.value)}
            placeholder="Enter from phone number"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-fg1 mb-1">
            Destination Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={destinationPhoneNumber}
            onChange={(e) => setDestinationPhoneNumber(e.target.value)}
            placeholder="Enter destination phone number"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-fg1 mb-1">
            Suffix <span className="text-gray-500">(optional)</span>
          </label>
          <input
            type="text"
            value={suffix}
            onChange={(e) => setSuffix(e.target.value)}
            placeholder="Enter suffix"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
          />
        </div>
      </div>

      {(fromPhoneNumber || destinationPhoneNumber) && (
        <div className="mt-4 w-64 p-3 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-sm text-gray-600">Your LiveKit room name will be:</p>
          <p className="text-sm font-mono font-semibold text-black mt-1 break-all">{getRoomName()}</p>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        onClick={handleStartCall}
        className="mt-6 w-64 font-mono"
      >
        {startButtonText}
      </Button>
      <footer className="fixed bottom-5 left-0 z-20 flex w-full items-center justify-center">
        <p className="text-fg1 max-w-prose pt-1 text-xs leading-5 font-normal text-pretty md:text-sm">
          Need help getting set up? Check out the{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.livekit.io/agents/start/voice-ai/"
            className="underline"
          >
            Voice AI quickstart
          </a>
          .
        </p>
      </footer>
    </section>
  );
};
