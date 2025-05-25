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
    if (!rootStore?.fireblocksSDKStore.fireblocksEW) {
      return [];
    }

    const connections = await rootStore.fireblocksSDKStore.fireblocksEW.getWeb3Connections(payload);
    return connections.data || [];
  } catch (error) {
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
    if (!rootStore?.fireblocksSDKStore.fireblocksEW) {
      throw new Error('Embedded wallet SDK is not initialized');
    }

    const response = await rootStore.fireblocksSDKStore.fireblocksEW.createWeb3Connection(payload);
    return response;
  } catch (error) {
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
    if (!rootStore?.fireblocksSDKStore.fireblocksEW) {
      throw new Error('Embedded wallet SDK is not initialized');
    }

    await rootStore.fireblocksSDKStore.fireblocksEW.submitWeb3Connection(id, payload);
  } catch (error) {
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
    if (!rootStore?.fireblocksSDKStore.fireblocksEW) {
      throw new Error('Embedded wallet SDK is not initialized');
    }

    await rootStore.fireblocksSDKStore.fireblocksEW.removeWeb3Connection(id);
  } catch (error) {
    throw error;
  }
};
