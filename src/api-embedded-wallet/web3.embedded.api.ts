import { ICreateNcwConnectionRequest, IWeb3ConnectionsApiGetRequest } from '@fireblocks/embedded-wallet-sdk';
import { RespondToConnectionRequest, SessionDTO } from '@fireblocks/ts-sdk';
import { RootStore } from '@store';

/**
 * Retrieves all Web3 connections for the user.
 * @param deviceId - The ID of the device
 * @param token - Authentication token
 * @param payload - Optional parameters for filtering connections
 * @param rootStore - The root store instance containing the Fireblocks SDK
 * @returns Promise resolving to an array of SessionDTO objects
 */
export const getWeb3Connections = async (
  deviceId: string,
  token: string,
  payload?: IWeb3ConnectionsApiGetRequest,
  rootStore: RootStore | null = null,
): Promise<SessionDTO[]> => {
  try {
    // DEBUG_TRACE console.log('[EmbeddedWallet] Getting Web3 connections:', deviceId, token, payload);
    // DEBUG_TRACE console.log('[EmbeddedWallet] Getting Web3 connections, SDK instance:',
    //   rootStore?.fireblocksSDKStore.fireblocksEW ? 'exists' : 'missing',
    // );

    if (!rootStore?.fireblocksSDKStore.fireblocksEW) {
      // DEBUG_TRACE console.error('[EmbeddedWallet] Embedded wallet SDK is not initialized');
      return [];
    }

    const connections = await rootStore.fireblocksSDKStore.fireblocksEW.getWeb3Connections(payload);
    // DEBUG_TRACE console.log('[EmbeddedWallet] getWeb3Connections response:', connections);
    // DEBUG_TRACE console.log('[EmbeddedWallet] getWeb3Connections data:', connections.data);
    return connections.data || [];
  } catch (error) {
    // DEBUG_TRACE console.error('[EmbeddedWallet] Error in getWeb3Connections:', error);
    return [];
  }
};

/**
 * Creates a new Web3 connection.
 * @param deviceId - The ID of the device
 * @param token - Authentication token
 * @param payload - The connection request payload
 * @param rootStore - The root store instance containing the Fireblocks SDK
 * @returns Promise resolving to the created connection response
 */
export const createWeb3Connection = async (
  deviceId: string,
  token: string,
  payload: ICreateNcwConnectionRequest,
  rootStore: RootStore | null = null,
) => {
  try {
    // DEBUG_TRACE console.log('[EmbeddedWallet] Creating Web3 connection:', deviceId, token, payload);
    // DEBUG_TRACE console.log('[EmbeddedWallet] Creating Web3 connection, SDK instance:',
    //   rootStore?.fireblocksSDKStore.fireblocksEW ? 'exists' : 'missing',
    // );

    if (!rootStore?.fireblocksSDKStore.fireblocksEW) {
      // DEBUG_TRACE console.error('[EmbeddedWallet] Embedded wallet SDK is not initialized');
      throw new Error('Embedded wallet SDK is not initialized');
    }

    // DEBUG_TRACE console.log('[EmbeddedWallet] Creating Web3 connection with payload:', payload);
    const response = await rootStore.fireblocksSDKStore.fireblocksEW.createWeb3Connection(payload);
    // DEBUG_TRACE console.log('[EmbeddedWallet] Web3 connection created successfully:', response);
    return response;
  } catch (error) {
    // DEBUG_TRACE console.error('[EmbeddedWallet] Error in createWeb3Connection:', error);
    throw error;
  }
};

/**
 * Submits a response to a Web3 connection request.
 * @param deviceId - The ID of the device
 * @param token - Authentication token
 * @param id - The ID of the connection request
 * @param payload - The response payload
 * @param rootStore - The root store instance containing the Fireblocks SDK
 * @returns Promise resolving when the response is submitted
 */
export const submitWeb3Connection = async (
  deviceId: string,
  token: string,
  id: string,
  payload: RespondToConnectionRequest,
  rootStore: RootStore | null = null,
): Promise<void> => {
  try {
    // DEBUG_TRACE console.log('[EmbeddedWallet] Submitting Web3 connection response:', deviceId, token, id, payload);
    // DEBUG_TRACE console.log('[EmbeddedWallet] Submitting Web3 connection response, SDK instance:',
    //   rootStore?.fireblocksSDKStore.fireblocksEW ? 'exists' : 'missing',
    // );

    if (!rootStore?.fireblocksSDKStore.fireblocksEW) {
      // DEBUG_TRACE console.error('[EmbeddedWallet] Embedded wallet SDK is not initialized');
      throw new Error('Embedded wallet SDK is not initialized');
    }

    // DEBUG_TRACE console.log(`[EmbeddedWallet] Submitting response for Web3 connection ${id} with payload:`, payload);
    await rootStore.fireblocksSDKStore.fireblocksEW.submitWeb3Connection(id, payload);
    // DEBUG_TRACE console.log(`[EmbeddedWallet] Web3 connection ${id} response submitted successfully`);
  } catch (error) {
    // DEBUG_TRACE console.error('[EmbeddedWallet] Error in submitWeb3Connection:', error);
    throw error;
  }
};

/**
 * Removes a Web3 connection.
 * @param deviceId - The ID of the device
 * @param token - Authentication token
 * @param id - The ID of the connection to remove
 * @param rootStore - The root store instance containing the Fireblocks SDK
 * @returns Promise resolving when the connection is removed
 */
export const removeWeb3Connection = async (
  deviceId: string,
  token: string,
  id: string,
  rootStore: RootStore | null = null,
): Promise<void> => {
  try {
    // DEBUG_TRACE console.log('[EmbeddedWallet] Removing Web3 connection:', deviceId, token, id);
    // DEBUG_TRACE console.log(
    //   '[EmbeddedWallet] Removing Web3 connection, SDK instance:',
    //   rootStore?.fireblocksSDKStore.fireblocksEW ? 'exists' : 'missing',
    // );

    if (!rootStore?.fireblocksSDKStore.fireblocksEW) {
      // DEBUG_TRACE console.error('[EmbeddedWallet] Embedded wallet SDK is not initialized');
      throw new Error('Embedded wallet SDK is not initialized');
    }

    // DEBUG_TRACE console.log(`[EmbeddedWallet] Removing Web3 connection ${id}`);
    await rootStore.fireblocksSDKStore.fireblocksEW.removeWeb3Connection(id);
    // DEBUG_TRACE console.log(`[EmbeddedWallet] Web3 connection ${id} removed successfully`);
  } catch (error) {
    // DEBUG_TRACE console.error('[EmbeddedWallet] Error in removeWeb3Connection:', error);
    throw error;
  }
};
