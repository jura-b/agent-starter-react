'use client';

import React, { useEffect, useRef, useState } from 'react';
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

// DTMF frequency pairs (low frequency, high frequency) for each button
const DTMF_FREQUENCIES: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '0': [941, 1336],
  '*': [941, 1209],
  '#': [941, 1477],
};

export function PhoneNumpad({ localParticipant, className }: PhoneNumpadProps) {
  const [sending, setSending] = useState(false);
  const [lastPressed, setLastPressed] = useState<string | null>(null);
  const [displayNumber, setDisplayNumber] = useState<string>('');
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on component mount
    audioContextRef.current = new window.AudioContext();

    return () => {
      // Clean up AudioContext on unmount
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playDtmfTone = (digit: string, duration: number = 500) => {
    if (!audioContextRef.current) return;

    const frequencies = DTMF_FREQUENCIES[digit];
    if (!frequencies) return;

    const context = audioContextRef.current;
    const [lowFreq, highFreq] = frequencies;

    // Create oscillators for both frequencies
    const oscillator1 = context.createOscillator();
    const oscillator2 = context.createOscillator();

    // Create gain node for volume control
    const gainNode = context.createGain();

    // Set frequencies
    oscillator1.frequency.setValueAtTime(lowFreq, context.currentTime);
    oscillator2.frequency.setValueAtTime(highFreq, context.currentTime);

    // Connect oscillators to gain node and then to output
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(context.destination);

    // Set volume
    gainNode.gain.setValueAtTime(0.3, context.currentTime);

    // Fade out to prevent clicking
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration / 1000);

    // Start and stop oscillators
    oscillator1.start(context.currentTime);
    oscillator2.start(context.currentTime);
    oscillator1.stop(context.currentTime + duration / 1000);
    oscillator2.stop(context.currentTime + duration / 1000);
  };

  const handleDtmfPress = async (button: NumpadButton) => {
    // Play tone immediately for feedback
    playDtmfTone(button.digit);

    if (!localParticipant) {
      console.warn('Cannot send DTMF: localParticipant is not available');
      // Still update UI even if not connected
      setLastPressed(button.digit);
      setDisplayNumber((prev) => prev + button.digit);
      setTimeout(() => setLastPressed(null), 250);
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
