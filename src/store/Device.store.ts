import { assignDeviceToNewWallet, generateNewDeviceId, getDeviceIdFromLocalStorage } from '@api';
import { action, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';

/**
 * DeviceStore manages device-related operations and state.
 * It handles device ID generation, storage, and assignment to wallets.
 * It also maintains the current device ID and wallet ID.
 */
export class DeviceStore {
  @observable public deviceId: string;
  @observable public walletId: string;

  private _rootStore: RootStore;

  /**
   * Initializes the DeviceStore with default values and a reference to the root store
   * @param rootStore Reference to the root store
   */
  constructor(rootStore: RootStore) {
    this.deviceId = '';
    this.walletId = '';

    this._rootStore = rootStore;

    makeObservable(this);
  }

  /**
   * Initializes the device store by retrieving the device ID from local storage
   */
  @action
  public init(): void {
    console.log('Device Store: device store init');
    this.deviceId = getDeviceIdFromLocalStorage(this._rootStore.userStore.userId) || '';
  }

  /**
   * Updates the device ID
   * @param deviceId The new device ID to set
   */
  @action
  public setDeviceId(deviceId: string): void {
    console.log('Device Store: setDeviceId: ', deviceId);
    this.deviceId = deviceId;
  }

  /**
   * Updates the wallet ID
   * @param walletId The new wallet ID to set
   */
  @action
  public setWalletId(walletId: string): void {
    console.log('Device Store: setWalletId: ', walletId);
    this.walletId = walletId;
  }

  /**
   * Generates a new device ID based on the user ID
   * and updates the deviceId property
   */
  @action
  public generateNewDeviceId(): void {
    console.log('Device Store: generateNewDeviceId');
    this.deviceId = generateNewDeviceId(this._rootStore.userStore.userId);
  }

  /**
   * Assigns the current device to a new wallet
   * Makes an API call to create a new wallet and associate the device with it
   * Updates the walletId property with the new wallet ID
   * @throws Error if the API call fails
   */
  public async assignDeviceToNewWallet(): Promise<void> {
    const deviceId = this.deviceId;
    const accessToken = this._rootStore.userStore.accessToken;
    console.log('Device Store: assignDeviceToNewWallet: ', this.deviceId, accessToken);

    if (deviceId && accessToken) {
      try {
        const newWalletId = await assignDeviceToNewWallet(deviceId, accessToken, this._rootStore);
        this.setWalletId(newWalletId);
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  }
}
