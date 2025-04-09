import { action, computed, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';
import { EmbeddedWallet } from '@fireblocks/embedded-wallet-sdk';
import { ENV_CONFIG } from '../env_config';
import { TEnv } from '@fireblocks/ncw-js-sdk';
import { consoleLog } from '../utils/logger';

// Interface definitions to match SDK's API
interface IMPCKey {
  status: string;
  algorithm: string;
}

// Define interfaces for SDK responses
interface DeviceInfo {
  status: string;
  [key: string]: any;
}

export class EmbeddedWalletSDKStore {
  @observable public sdkInstance: EmbeddedWallet | null = null;
  @observable public isInitialized: boolean = false;
  @observable public error: string = '';
  @observable public keysStatus: Record<string, IMPCKey> | null = null;
  @observable public isMPCReady: boolean = false;
  @observable public isMPCGenerating: boolean = false;

  private _rootStore: RootStore;
  private _txsUnsubscriber: (() => void) | null = null;
  private _pollingActive: boolean = false;

  constructor(rootStore: RootStore) {
    this._rootStore = rootStore;
    makeObservable(this);
  }

  @action
  public async init() {
    consoleLog('[EmbeddedWalletSDK] Initializing SDK...');
    this.isMPCGenerating = true;
    
    try {
      if (!this._rootStore.userStore.accessToken) {
        throw new Error('Access token is required');
      }

      consoleLog('[EmbeddedWalletSDK] Creating new SDK instance');
      const sdk = new EmbeddedWallet({
        env: ENV_CONFIG.NCW_SDK_ENV as TEnv,
        authTokenRetriever: {
          getAuthToken: async () => this._rootStore.userStore.accessToken
        },
        authClientId: 'ncw-web-demo-v2'
      });

      consoleLog('[EmbeddedWalletSDK] SDK instance created successfully');
      this.setSDKInstance(sdk);
      this.isInitialized = true;
      
      // Check if MPC keys are already generated
      try {
        consoleLog('[EmbeddedWalletSDK] Checking device status');
        if (this.sdkInstance) {
          // Cast to any to bypass type checking since we don't have exact SDK interface
          const device = await (this.sdkInstance as any).getDevice();
          consoleLog('[EmbeddedWalletSDK] Device info:', device);
          
          // Device status will indicate if keys are ready
          this.isMPCReady = device && device.status === 'READY';
          consoleLog('[EmbeddedWalletSDK] MPC ready status:', this.isMPCReady);
        }
      } catch (error) {
        consoleLog('[EmbeddedWalletSDK] Error checking device status, may need to generate keys:', error);
        this.isMPCReady = false;
      }
      
      this.isMPCGenerating = false;
      
      // Setup transaction polling if the device is ready
      if (this.isMPCReady) {
        this.startPollingTransactions();
      }
      
      return sdk;
    } catch (error: any) {
      consoleLog('[EmbeddedWalletSDK] Error initializing SDK:', error);
      this.error = error.message;
      this.isMPCGenerating = false;
      throw error;
    }
  }

  @action
  public async generateMPCKeys(): Promise<void> {
    if (!this.sdkInstance) {
      consoleLog('[EmbeddedWalletSDK] SDK not initialized for generateMPCKeys');
      throw new Error('SDK not initialized');
    }
    
    consoleLog('[EmbeddedWalletSDK] Starting MPC key generation');
    this.isMPCReady = false;
    this.isMPCGenerating = true;
    
    try {
      // Cast to any to bypass type checking since we don't have exact SDK interface
      // This should be the correct method based on usage in Auth.store.ts
      await (this.sdkInstance as any).setupDevice();
      
      consoleLog('[EmbeddedWalletSDK] MPC keys generated successfully');
      this.isMPCReady = true;
      
      // Start polling transactions now that keys are ready
      this.startPollingTransactions();
    } catch (error: any) {
      consoleLog('[EmbeddedWalletSDK] Error generating MPC keys:', error);
      throw new Error(error.message);
    } finally {
      this.isMPCGenerating = false;
    }
  }

  @action
  public async checkMPCKeys() {
    if (!this.sdkInstance) {
      consoleLog('[EmbeddedWalletSDK] SDK not initialized for checkMPCKeys');
      return;
    }
    
    consoleLog('[EmbeddedWalletSDK] Checking MPC keys status');
    try {
      // Cast to any to bypass type checking
      const device = await (this.sdkInstance as any).getDevice();
      consoleLog('[EmbeddedWalletSDK] Device info:', device);
      
      // Set MPC ready status based on device info
      this.isMPCReady = device && device.status === 'READY';
      consoleLog('[EmbeddedWalletSDK] MPC ready:', this.isMPCReady);
    } catch (error) {
      consoleLog('[EmbeddedWalletSDK] Error checking MPC keys:', error);
      this.isMPCReady = false;
    }
  }

  @action
  private setSDKInstance(instance: EmbeddedWallet | null) {
    this.sdkInstance = instance;
  }

  @action
  private setKeysStatus(status: Record<string, IMPCKey> | null) {
    this.keysStatus = status;
  }

  public async getAccounts() {
    if (!this.sdkInstance) {
      consoleLog('[EmbeddedWalletSDK] SDK not initialized for getAccounts');
      throw new Error('SDK not initialized');
    }
    
    consoleLog('[EmbeddedWalletSDK] Getting accounts');
    try {
      // Cast to any to bypass type checking
      const accounts = await (this.sdkInstance as any).getAccounts();
      consoleLog('[EmbeddedWalletSDK] Retrieved accounts:', accounts);
      return accounts.data;
    } catch (error) {
      consoleLog('[EmbeddedWalletSDK] Error getting accounts:', error);
      throw error;
    }
  }

  public async getAllAssets() {
    if (!this.sdkInstance) {
      consoleLog('[EmbeddedWalletSDK] SDK not initialized for getAllAssets');
      throw new Error('SDK not initialized');
    }
    
    consoleLog('[EmbeddedWalletSDK] Getting all assets');
    try {
      // Cast to any to bypass type checking
      const assets = await (this.sdkInstance as any).getAssets(100);
      consoleLog('[EmbeddedWalletSDK] Retrieved assets:', assets);
      return assets.data;
    } catch (error) {
      consoleLog('[EmbeddedWalletSDK] Error getting assets:', error);
      throw error;
    }
  }

  public async getAsset(assetId: string) {
    if (!this.sdkInstance) {
      consoleLog('[EmbeddedWalletSDK] SDK not initialized for getAsset');
      throw new Error('SDK not initialized');
    }
    
    consoleLog(`[EmbeddedWalletSDK] Getting asset: ${assetId}`);
    try {
      // Cast to any to bypass type checking
      const asset = await (this.sdkInstance as any).getAsset(parseInt(assetId));
      consoleLog('[EmbeddedWalletSDK] Retrieved asset:', asset);
      return asset;
    } catch (error) {
      consoleLog('[EmbeddedWalletSDK] Error getting asset:', error);
      throw error;
    }
  }

  public async getBalance(assetId: string) {
    if (!this.sdkInstance) {
      consoleLog('[EmbeddedWalletSDK] SDK not initialized for getBalance');
      throw new Error('SDK not initialized');
    }
    
    consoleLog(`[EmbeddedWalletSDK] Getting balance for asset: ${assetId}`);
    try {
      // Cast to any to bypass type checking
      const balance = await (this.sdkInstance as any).getBalance(parseInt(assetId));
      consoleLog('[EmbeddedWalletSDK] Retrieved balance:', balance);
      return balance;
    } catch (error) {
      consoleLog('[EmbeddedWalletSDK] Error getting balance:', error);
      throw error;
    }
  }

  public async getAddress(assetId: string) {
    if (!this.sdkInstance) {
      consoleLog('[EmbeddedWalletSDK] SDK not initialized for getAddress');
      throw new Error('SDK not initialized');
    }
    
    consoleLog(`[EmbeddedWalletSDK] Getting address for asset: ${assetId}`);
    try {
      // Cast to any to bypass type checking
      const addresses = await (this.sdkInstance as any).getAddresses({ assetId: parseInt(assetId) });
      if (addresses.data.length === 0) {
        consoleLog('[EmbeddedWalletSDK] No addresses found');
        throw new Error('No addresses found');
      }
      
      consoleLog('[EmbeddedWalletSDK] Retrieved address:', addresses.data[0]);
      return addresses.data[0];
    } catch (error) {
      consoleLog('[EmbeddedWalletSDK] Error getting address:', error);
      throw error;
    }
  }

  public async createTransaction(txData: any) {
    if (!this.sdkInstance) {
      consoleLog('[EmbeddedWalletSDK] SDK not initialized for createTransaction');
      throw new Error('SDK not initialized');
    }
    
    consoleLog('[EmbeddedWalletSDK] Creating transaction:', txData);
    try {
      // Cast to any to bypass type checking
      const transaction = await (this.sdkInstance as any).createTransaction({
        source: {
          assetId: txData.assetId,
          accountId: parseInt(txData.accountId)
        },
        destination: {
          address: txData.destAddress
        },
        amount: txData.amount,
        note: txData.note
      });
      
      consoleLog('[EmbeddedWalletSDK] Transaction created:', transaction);
      return transaction;
    } catch (error) {
      consoleLog('[EmbeddedWalletSDK] Error creating transaction:', error);
      throw error;
    }
  }

  public async approveTransaction(txId: string) {
    if (!this.sdkInstance) {
      consoleLog('[EmbeddedWalletSDK] SDK not initialized for approveTransaction');
      throw new Error('SDK not initialized');
    }
    
    consoleLog(`[EmbeddedWalletSDK] Approving transaction: ${txId}`);
    try {
      // Cast to any to bypass type checking
      await (this.sdkInstance as any).signTransaction(txId);
      consoleLog('[EmbeddedWalletSDK] Transaction approval initiated');
    } catch (error) {
      consoleLog('[EmbeddedWalletSDK] Error approving transaction:', error);
      throw error;
    }
  }

  public async cancelTransaction(txId: string) {
    if (!this.sdkInstance) {
      consoleLog('[EmbeddedWalletSDK] SDK not initialized for cancelTransaction');
      throw new Error('SDK not initialized');
    }
    
    consoleLog(`[EmbeddedWalletSDK] Cancelling transaction: ${txId}`);
    try {
      // Cast to any to bypass type checking
      await (this.sdkInstance as any).cancelTransaction(txId);
      consoleLog('[EmbeddedWalletSDK] Transaction cancelled');
    } catch (error) {
      consoleLog('[EmbeddedWalletSDK] Error cancelling transaction:', error);
      throw error;
    }
  }

  public async getTransactions(startDate: number) {
    if (!this.sdkInstance) {
      consoleLog('[EmbeddedWalletSDK] SDK not initialized for getTransactions');
      return [];
    }
    
    consoleLog(`[EmbeddedWalletSDK] Getting transactions since: ${new Date(startDate).toISOString()}`);
    try {
      // Cast to any to bypass type checking
      const transactions = await (this.sdkInstance as any).getTransactions({
        startDate: startDate,
        incoming: true,
        outgoing: true
      });
      
      consoleLog(`[EmbeddedWalletSDK] Retrieved ${transactions.data.length} transactions`);
      return transactions.data;
    } catch (error) {
      consoleLog('[EmbeddedWalletSDK] Error getting transactions:', error);
      return [];
    }
  }

  private startPollingTransactions() {
    if (this._pollingActive || !this.sdkInstance) {
      return;
    }
    
    this._pollingActive = true;
    consoleLog('[EmbeddedWalletSDK] Starting transaction polling');
    
    let lastPollTime = Date.now() - 24 * 60 * 60 * 1000; // Start with last 24 hours
    
    const poll = async () => {
      if (!this._pollingActive || !this.sdkInstance) {
        consoleLog('[EmbeddedWalletSDK] Polling stopped');
        return;
      }
      
      try {
        const transactions = await this.getTransactions(lastPollTime);
        
        // Update lastPollTime to the most recent tx time if any
        if (transactions.length > 0) {
          const latestTxTime = Math.max(...transactions.map(tx => tx.lastUpdated || 0));
          if (latestTxTime > lastPollTime) {
            lastPollTime = latestTxTime;
          }
          
          // Notify transaction store about updates
          transactions.forEach(tx => {
            this._rootStore.transactionsStore.addOrEditTransaction({
              id: tx.id,
              status: tx.status,
              createdAt: tx.createdAt,
              lastUpdated: tx.lastUpdated,
              details: tx
            });
          });
        }
      } catch (error) {
        consoleLog('[EmbeddedWalletSDK] Error during transaction polling:', error);
      }
      
      // Poll again after delay
      setTimeout(poll, 5000);
    };
    
    // Start polling
    poll();
  }

  private stopPollingTransactions() {
    consoleLog('[EmbeddedWalletSDK] Stopping transaction polling');
    this._pollingActive = false;
  }

  @action
  public async dispose() {
    consoleLog('[EmbeddedWalletSDK] Disposing SDK');
    this.stopPollingTransactions();
    
    if (this._txsUnsubscriber) {
      this._txsUnsubscriber();
      this._txsUnsubscriber = null;
    }
    
    this.sdkInstance = null;
    this.isInitialized = false;
    this.isMPCReady = false;
  }

  @computed
  public get isReady(): boolean {
    return this.isInitialized && this.isMPCReady;
  }
} 