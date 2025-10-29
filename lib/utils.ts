import { cache } from 'react';
import { type ClassValue, clsx } from 'clsx';
import { Room } from 'livekit-client';
import { twMerge } from 'tailwind-merge';
import type { ReceivedChatMessage, TextStreamData } from '@livekit/components-react';
import { APP_CONFIG_DEFAULTS } from '@/app-config';
import type { AppConfig, SandboxConfig } from './types';

export const CONFIG_ENDPOINT = process.env.NEXT_PUBLIC_APP_CONFIG_ENDPOINT;
export const SANDBOX_ID = process.env.SANDBOX_ID;

export const THEME_STORAGE_KEY = 'theme-mode';
export const THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)';

// URL building utilities
export interface UrlParameters {
  from: string;
  to: string;
  suffix?: string;
  type: 'user' | 'human_agent';
}

/**
 * Builds a shareable URL with the given parameters
 * @param params - URL parameters to include
 * @param pathname - Optional pathname (defaults to current window location pathname)
 * @param origin - Optional origin (defaults to current window location origin)
 * @returns Complete URL with query parameters
 */
export function buildShareableUrl(
  params: UrlParameters,
  pathname?: string,
  origin?: string
): string {
  const searchParams = new URLSearchParams();

  // Add required parameters
  searchParams.set('from', params.from.trim());
  searchParams.set('to', params.to.trim());
  searchParams.set('type', params.type);

  // Add optional suffix if provided
  if (params.suffix && params.suffix.trim()) {
    searchParams.set('suffix', params.suffix.trim());
  }

  const urlOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  const urlPathname = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');

  return `${urlOrigin}${urlPathname}?${searchParams.toString()}`;
}

/**
 * Extracts URL parameters from a room name
 * @param roomName - Room name in format "web_from_to_suffix" or similar
 * @param participantType - Type of participant
 * @returns UrlParameters object
 */
export function extractUrlParametersFromRoomName(
  roomName: string,
  participantType: 'user' | 'human_agent'
): UrlParameters {
  const roomParts = roomName.split('_');

  // Default values
  const params: UrlParameters = {
    from: '+66',
    to: '+66',
    type: participantType,
  };

  // Extract phone numbers from room name
  if (roomParts.length >= 2) {
    params.from = roomParts[1] || '+66';
  }
  if (roomParts.length >= 3) {
    params.to = roomParts[2] || '+66';
  }
  if (roomParts.length > 3) {
    // Everything after the first 3 parts is the suffix
    params.suffix = roomParts.slice(3).join('_');
  }

  return params;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date: Date | string | number): string {
  const dateObj = new Date(date);

  // Get timezone offset in minutes and convert to hours
  const offsetMinutes = dateObj.getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
  const offsetMins = Math.abs(offsetMinutes % 60);
  const offsetSign = offsetMinutes <= 0 ? '+' : '-';

  // Format timezone as UTC+X or UTC-X
  const timezoneStr = `UTC${offsetSign}${offsetHours}${offsetMins > 0 ? ':' + offsetMins.toString().padStart(2, '0') : ''}`;

  // Format the date and time
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const dayName = days[dateObj.getDay()];
  const day = dateObj.getDate().toString().padStart(2, '0');
  const monthName = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const seconds = dateObj.getSeconds().toString().padStart(2, '0');

  return `${dayName}, ${year} ${monthName} ${day} ${hours}:${minutes}:${seconds} ${timezoneStr}`;
}

export function transcriptionToChatMessage(
  textStream: TextStreamData,
  room: Room
): ReceivedChatMessage {
  return {
    id: textStream.streamInfo.id,
    timestamp: textStream.streamInfo.timestamp,
    message: textStream.text,
    from:
      textStream.participantInfo.identity === room.localParticipant.identity
        ? room.localParticipant
        : Array.from(room.remoteParticipants.values()).find(
            (p) => p.identity === textStream.participantInfo.identity
          ),
  };
}

// https://react.dev/reference/react/cache#caveats
// > React will invalidate the cache for all memoized functions for each server request.
export const getAppConfig = cache(async (headers: Headers): Promise<AppConfig> => {
  if (CONFIG_ENDPOINT) {
    const sandboxId = SANDBOX_ID ?? headers.get('x-sandbox-id') ?? '';

    try {
      if (!sandboxId) {
        throw new Error('Sandbox ID is required');
      }

      const response = await fetch(CONFIG_ENDPOINT, {
        cache: 'no-store',
        headers: { 'X-Sandbox-ID': sandboxId },
      });

      const remoteConfig: SandboxConfig = await response.json();
      const config: AppConfig = { sandboxId, ...APP_CONFIG_DEFAULTS };

      for (const [key, entry] of Object.entries(remoteConfig)) {
        if (entry === null) continue;
        // Only include app config entries that are declared in defaults and, if set,
        // share the same primitive type as the default value.
        if (
          (key in APP_CONFIG_DEFAULTS &&
            APP_CONFIG_DEFAULTS[key as keyof AppConfig] === undefined) ||
          (typeof config[key as keyof AppConfig] === entry.type &&
            typeof config[key as keyof AppConfig] === typeof entry.value)
        ) {
          // @ts-expect-error I'm not sure quite how to appease TypeScript, but we've thoroughly checked types above
          config[key as keyof AppConfig] = entry.value as AppConfig[keyof AppConfig];
        }
      }

      return config;
    } catch (error) {
      console.error('ERROR: getAppConfig() - lib/utils.ts', error);
    }
  }

  return APP_CONFIG_DEFAULTS;
});
