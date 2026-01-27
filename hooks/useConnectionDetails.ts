import { useCallback, useEffect, useState } from 'react';
import { decodeJwt } from 'jose';
import { ConnectionDetails } from '@/app/api/connection-details/route';
import { AppConfig, LiveKitEnvironment } from '@/lib/types';

const ONE_MINUTE_IN_MILLISECONDS = 60 * 1000;

export default function useConnectionDetails(appConfig: AppConfig) {
  // Generate room connection details, including:
  //   - A random Room name
  //   - A random Participant name
  //   - An Access Token to permit the participant to join the room
  //   - The URL of the LiveKit server to connect to
  //
  // In real-world application, you would likely allow the user to specify their
  // own participant name, and possibly to choose from existing rooms to join.

  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);

  const fetchConnectionDetails = useCallback(
    async (connectionData?: {
      roomName: string;
      fromPhoneNumber: string;
      destinationPhoneNumber: string;
      participantName?: string;
      participantType?: 'user' | 'human_agent';
      environment?: LiveKitEnvironment;
      participantAttributes?: Record<string, string>;
    }) => {
      setConnectionDetails(null);

      let data: ConnectionDetails;

      try {
        if (connectionData?.participantAttributes) {
          // Use advance-connection-details endpoint
          const url = new URL('/api/advance-connection-details', window.location.origin);
          const res = await fetch(url.toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Sandbox-Id': appConfig.sandboxId ?? '',
            },
            body: JSON.stringify({
              room_name: connectionData.roomName,
              environment: connectionData.environment || 'DEV',
              participant_name: connectionData.participantName,
              participant_attributes: connectionData.participantAttributes,
            }),
          });
          data = await res.json();
        } else {
          // Use existing connection-details endpoint
          const url = new URL(
            process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? '/api/connection-details',
            window.location.origin
          );
          const res = await fetch(url.toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Sandbox-Id': appConfig.sandboxId ?? '',
            },
            body: JSON.stringify({
              room_name: connectionData?.roomName,
              from_phone_number: connectionData?.fromPhoneNumber,
              destination_phone_number: connectionData?.destinationPhoneNumber,
              participant_name: connectionData?.participantName,
              participant_type: connectionData?.participantType,
              environment: connectionData?.environment || 'DEV',
            }),
          });
          data = await res.json();
        }
      } catch (error) {
        console.error('Error fetching connection details:', error);
        throw new Error('Error fetching connection details!');
      }

      setConnectionDetails(data);
      return data;
    },
    [appConfig]
  );

  const isConnectionDetailsExpired = useCallback(() => {
    const token = connectionDetails?.participantToken;
    if (!token) {
      return true;
    }

    const jwtPayload = decodeJwt(token);
    if (!jwtPayload.exp) {
      return true;
    }
    const expiresAt = new Date(jwtPayload.exp * 1000 - ONE_MINUTE_IN_MILLISECONDS);

    const now = new Date();
    return expiresAt <= now;
  }, [connectionDetails?.participantToken]);

  const existingOrRefreshConnectionDetails = useCallback(
    async (connectionData?: {
      roomName: string;
      fromPhoneNumber: string;
      destinationPhoneNumber: string;
      participantName?: string;
      environment?: LiveKitEnvironment;
      participantAttributes?: Record<string, string>;
    }) => {
      if (isConnectionDetailsExpired() || !connectionDetails) {
        return fetchConnectionDetails(connectionData);
      } else {
        return connectionDetails;
      }
    },
    [connectionDetails, fetchConnectionDetails, isConnectionDetailsExpired]
  );

  return {
    connectionDetails,
    refreshConnectionDetails: fetchConnectionDetails,
    existingOrRefreshConnectionDetails,
  };
}
