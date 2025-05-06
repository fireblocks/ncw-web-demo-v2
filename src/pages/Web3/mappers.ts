import { SessionDTO } from '@fireblocks/ts-sdk';
import { Connection } from './Web3List';

/**
 * Maps a SessionDTO object from the API to a Connection object for the UI
 * @param session The SessionDTO object from the API
 * @returns A Connection object for the UI
 */
export const mapSessionDTOToConnection = (session: SessionDTO): Connection => {
  return {
    id: session.id,
    name: session.sessionMetadata?.appName || session.name || 'Unknown DApp',
    description: session.sessionMetadata?.appDescription || session.description || '',
    website: session.sessionMetadata?.appUrl || session.url || '',
    connectionDate: (() => {
      // Try to create a date from createdAt, fallback to current date if invalid
      if (!session.createdAt) return new Date();
      const date = new Date(session.createdAt);
      return isNaN(date.getTime()) ? new Date() : date;
    })(),
    icon: session.sessionMetadata?.appIcon || session.icon || 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
  };
};

/**
 * Maps an array of SessionDTO objects from the API to an array of Connection objects for the UI
 * @param sessions The array of SessionDTO objects from the API
 * @returns An array of Connection objects for the UI
 */
export const mapSessionDTOsToConnections = (sessions: SessionDTO[]): Connection[] => {
  return sessions.map(mapSessionDTOToConnection);
};
