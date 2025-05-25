import { ICreateNcwConnectionRequest } from '@fireblocks/embedded-wallet-sdk';
import { RespondToConnectionRequest, SessionDTO } from '@fireblocks/ts-sdk';
import { action, makeObservable, observable } from 'mobx';
import {
  getWeb3Connections,
  createWeb3Connection,
  submitWeb3Connection,
  removeWeb3Connection,
} from '../api-embedded-wallet';
import { RootStore } from './Root.store';

/**
 * Web3Store manages Web3 connections for the user.
 * It provides methods for fetching, creating, submitting, and removing Web3 connections.
 */
export class Web3Store {
  @observable public connections: SessionDTO[];
  @observable public isLoading: boolean;
  @observable public isRefreshing: boolean;
  @observable public error: string;

  private _rootStore: RootStore;

  /**
   * Initializes the Web3Store with default values and a reference to the root store
   * @param rootStore Reference to the root store
   */
  constructor(rootStore: RootStore) {
    this.connections = [];
    this.isLoading = true;
    this.isRefreshing = false;
    this.error = '';

    this._rootStore = rootStore;

    makeObservable(this);
  }

  @action
  public setError(error: string): void {
    this.error = error;
  }

  @action
  public async init(): Promise<void> {
    await this.getConnections(true);
  }

  /**
   * Fetches all Web3 connections for the user
   * @param initMode If true, sets isLoading, otherwise sets isRefreshing
   */
  public async getConnections(initMode?: boolean): Promise<void> {
    try {
      initMode ? this.setIsLoading(true) : this.setIsRefreshing(true);

      const deviceId = this._rootStore.deviceStore.deviceId;
      const accessToken = this._rootStore.userStore.accessToken;

      if (deviceId && accessToken) {
        const connections = await getWeb3Connections(deviceId, accessToken, undefined, this._rootStore);
        this.setConnections(connections);
      }
    } catch (error: any) {
      console.error('[Web3Store] Error in getConnections:', error);
      this.setError(error.message || 'Failed to get Web3 connections');
    } finally {
      initMode ? this.setIsLoading(false) : this.setIsRefreshing(false);
    }
  }

  /**
   * Creates a new Web3 connection
   * @param payload The connection request payload
   * @returns The created connection response
   */
  public async createConnection(payload: ICreateNcwConnectionRequest) {
    try {
      const deviceId = this._rootStore.deviceStore.deviceId;
      const accessToken = this._rootStore.userStore.accessToken;

      if (!deviceId || !accessToken) {
        throw new Error('Device ID or access token is missing');
      }

      const response = await createWeb3Connection(deviceId, accessToken, payload, this._rootStore);

      // Refresh connections after creating a new one
      await this.getConnections(false);

      return response;
    } catch (error: any) {
      console.error('[Web3Store] Error in createConnection:', error);
      this.setError(error.message || 'Failed to create Web3 connection');
      throw error; // Re-throw the error so the caller can handle it
    }
  }

  /**
   * Submits a response to a Web3 connection request
   * @param id The ID of the connection request
   * @param payload The response payload
   */
  public async submitConnection(id: string, payload: RespondToConnectionRequest): Promise<void> {
    try {
      const deviceId = this._rootStore.deviceStore.deviceId;
      const accessToken = this._rootStore.userStore.accessToken;

      if (!deviceId || !accessToken) {
        throw new Error('Device ID or access token is missing');
      }

      await submitWeb3Connection(deviceId, accessToken, id, payload, this._rootStore);

      // Refresh connections after submitting a response
      await this.getConnections(false);
    } catch (error: any) {
      console.error('[Web3Store] Error in submitConnection:', error);
      this.setError(error.message || 'Failed to submit Web3 connection response');
      throw error; // Re-throw the error so the caller can handle it
    }
  }

  /**
   * Removes a Web3 connection
   * @param id The ID of the connection to remove
   */
  public async removeConnection(id: string): Promise<void> {
    try {
      const deviceId = this._rootStore.deviceStore.deviceId;
      const accessToken = this._rootStore.userStore.accessToken;

      if (!deviceId || !accessToken) {
        throw new Error('Device ID or access token is missing');
      }

      await removeWeb3Connection(deviceId, accessToken, id, this._rootStore);

      // Refresh connections after removing one
      await this.getConnections(false);
    } catch (error: any) {
      console.error('[Web3Store] Error in removeConnection:', error);
      this.setError(error.message || 'Failed to remove Web3 connection');
      throw error; // Re-throw the error so the caller can handle it
    }
  }

  @action
  public setConnections(connections: SessionDTO[]): void {
    // DEBUG_TRACE console.log('[Web3Store] Setting connections:', connections);
    this.connections = [];
    this.connections = connections;
    // DEBUG_TRACE console.log('[Web3Store] Connections set, this.connections:', this.connections);
  }

  @action
  public setIsLoading(isLoading: boolean): void {
    this.isLoading = isLoading;
  }

  @action
  public setIsRefreshing(isRefreshing: boolean): void {
    this.isRefreshing = isRefreshing;
  }

  /**
   * Gets a connection by ID
   * @param id The ID of the connection to get
   * @returns The connection with the specified ID, or undefined if not found
   */
  public getConnectionById(id: string): SessionDTO | undefined {
    return this.connections.find((connection) => connection.id === id);
  }
}
