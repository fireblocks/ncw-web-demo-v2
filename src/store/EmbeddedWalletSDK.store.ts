import { action, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';
import { EmbeddedWallet } from '@fireblocks/embedded-wallet-sdk';
import { ENV_CONFIG } from '../env_config';
import { TEnv } from '@fireblocks/ncw-js-sdk';

export class EmbeddedWalletSDKStore {
  @observable public sdkInstance: EmbeddedWallet | null = null;
  @observable public isInitialized: boolean = false;
  @observable public error: string = '';

  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this._rootStore = rootStore;
    makeObservable(this);
  }

  @action
  public async init() {
    try {
      if (!this._rootStore.userStore.accessToken) {
        throw new Error('Access token is required');
      }

      const sdk = new EmbeddedWallet({
        env: ENV_CONFIG.NCW_SDK_ENV as TEnv,
        authTokenRetriever: {
          getAuthToken: async () => this._rootStore.userStore.accessToken as string
        },
        authClientId: 'ncw-web-demo-v2'
      });

      this.sdkInstance = sdk;
      this.isInitialized = true;
    } catch (error: any) {
      this.error = error.message;
      throw error;
    }
  }

  @action
  public async dispose() {
    this.sdkInstance = null;
    this.isInitialized = false;
  }
} 