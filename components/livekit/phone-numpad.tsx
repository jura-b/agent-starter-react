'use client';

import React, { useState } from 'react';
import type { LocalParticipant } from 'livekit-client';
import { cn } from '@/lib/utils';

interface PhoneNumpadProps {
  localParticipant: LocalParticipant | undefined;
  className?: string;
}

interface NumpadButton {
  digit: string;
  code: number;
  letters?: string;
}

const numpadLayout: NumpadButton[][] = [
  [
    { digit: '1', code: 1 },
    { digit: '2', code: 2, letters: 'ABC' },
    { digit: '3', code: 3, letters: 'DEF' },
  ],
  [
    { digit: '4', code: 4, letters: 'GHI' },
    { digit: '5', code: 5, letters: 'JKL' },
    { digit: '6', code: 6, letters: 'MNO' },
  ],
  [
    { digit: '7', code: 7, letters: 'PQRS' },
    { digit: '8', code: 8, letters: 'TUV' },
    { digit: '9', code: 9, letters: 'WXYZ' },
  ],
  [
    { digit: '*', code: 10 },
    { digit: '0', code: 0, letters: '+' },
    { digit: '#', code: 11 },
  ],
];

export function PhoneNumpad({ localParticipant, className }: PhoneNumpadProps) {
  const [sending, setSending] = useState(false);
  const [lastPressed, setLastPressed] = useState<string | null>(null);
  const [displayNumber, setDisplayNumber] = useState<string>('');

  const handleDtmfPress = async (button: NumpadButton) => {
    if (!localParticipant) {
      console.warn('Cannot send DTMF: localParticipant is not available');
      return;
    }

    setSending(true);
    setLastPressed(button.digit);
    setDisplayNumber((prev) => prev + button.digit);

    try {
      await localParticipant.publishDtmf(button.code, button.digit);
      console.log(`DTMF sent: ${button.digit} (code: ${button.code})`);
    } catch (error) {
      console.error('Error sending DTMF:', error);
    } finally {
      setSending(false);
      console.log('!!:', button.digit);
      // Clear the last pressed after a short delay
      setTimeout(() => setLastPressed(null), 250);
    }
  };

  const handleClear = () => {
    setDisplayNumber('');
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-300">Phone Numpad</h3>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {numpadLayout.map((row) =>
          row.map((button) => (
            <button
              key={button.digit}
              onClick={() => handleDtmfPress(button)}
              disabled={!localParticipant || sending}
              className={cn(
                'relative flex h-14 cursor-pointer flex-col items-center justify-center rounded-full border border-gray-700 bg-gray-800 text-white transition-all',
                'hover:border-gray-600 hover:bg-gray-700',
                'active:scale-95 active:bg-gray-600',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-gray-800',
                lastPressed === button.digit && 'border-teal-300 bg-teal-600 hover:bg-teal-600'
              )}
              aria-label={`DTMF ${button.digit}`}
            >
              <span className="text-xl font-semibold">{button.digit}</span>
              {button.letters && (
                <span className="mt-0.5 text-[10px] text-gray-400">{button.letters}</span>
              )}
            </button>
          ))
        )}
      </div>

      {/* Display Box */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex h-10 min-w-0 flex-1 items-center overflow-hidden border-b border-gray-700 bg-transparent px-3">
          <span
            className="w-full truncate font-mono text-sm text-white"
            style={{ direction: 'rtl', textAlign: 'left' }}
          >
            {displayNumber}
          </span>
        </div>
        {
          <button
            onClick={handleClear}
            className="h-10 flex-shrink-0 cursor-pointer rounded-full border border-gray-700 bg-transparent px-3 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
            aria-label="Clear"
          >
            🆇
          </button>
        }
      </div>
    </div>
  );
}
