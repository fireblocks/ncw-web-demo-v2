import {
  IBackupInfo,
  IPassphrase,
  IPassphraseInfo,
  TPassphraseLocation,
  TPassphrases,
  createPassphraseInfo,
  getLatestBackup,
  getPassphraseInfos,
} from '@api';
import { IUser } from '@auth';
import { cloudkitBackup, cloudkitRecover, googleDriveBackup, googleDriveRecover, randomPassPhrase } from '@services';
import { action, makeObservable, observable } from 'mobx';
import CloudKit from 'tsl-apple-cloudkit';
import { RootStore } from './Root.store';

/**
 * BackupStore manages the backup and recovery operations for wallet keys.
 * It handles interactions with cloud storage providers like Google Drive and iCloud
 * for storing and retrieving passphrases used for key backup and recovery.
 */
export class BackupStore {
  /** Collection of passphrase information indexed by passphraseId */
  @observable public passPhrases: TPassphrases | null;

  /** Information about the most recent backup */
  @observable public latestBackup: IBackupInfo | null;

  /** Reference to the CloudKit instance for iCloud operations */
  @observable public cloudkit: CloudKit.CloudKit | null;

  /** Flag indicating whether the user is signed in with Apple ID */
  @observable public appleSignedIn: boolean | null;

  /** Flag indicating whether a backup operation has completed */
  @observable public isBackupCompleted: boolean;

  /** Flag indicating whether a backup operation is in progress */
  @observable public isBackupInProgress: boolean;

  /** Flag indicating whether a recovery operation has completed */
  @observable public isRecoverCompleted: boolean;

  /** Flag indicating whether a recovery operation is in progress */
  @observable public isRecoverInProgress: boolean;

  /** User information for Google Drive operations */
  @observable public googleDriveUser: IUser | null;

  /** Error message from the most recent operation */
  @observable public error: string | null;

  /** Reference to the root store for accessing other stores */
  private _rootStore: RootStore;

  /**
   * Initializes the BackupStore with default values and references to the root store
   * @param rootStore Reference to the root store for accessing other stores
   */
  constructor(rootStore: RootStore) {
    this.passPhrases = null;
    this.latestBackup = null;
    this.cloudkit = null;
    this.appleSignedIn = false;
    this.error = null;
    this.isBackupCompleted = false;
    this.isRecoverCompleted = false;
    this.isBackupInProgress = false;
    this.isRecoverInProgress = false;
    this.googleDriveUser = null;

    this._rootStore = rootStore;

    makeObservable(this);
  }

  /**
   * Initializes the store by fetching passphrase information and the latest backup
   * This should be called when the store is first used
   */
  public async init() {
    try {
      // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
      const response = await getPassphraseInfos(this._rootStore.userStore.accessToken, this._rootStore);
      this.setPassPhrases(response.passphrases);
      const latestBackup = await this.getMyLatestBackup();
      this.setLatestBackup(latestBackup);
    } catch (e: any) {
      this.setError(e.message);
    }
  }

  public clearProgress() {
    this.setError('');
    this.setIsBackupCompleted(false);
    this.setIsRecoverCompleted(false);
    this.setIsBackupInProgress(false);
  }

  @action
  setGoogleDriveUser(user: IUser) {
    this.googleDriveUser = user;
  }

  @action
  setLatestBackup(backup: IBackupInfo | null) {
    this.latestBackup = backup;
  }

  @action
  setIsBackupCompleted(isCompleted: boolean) {
    this.isBackupCompleted = isCompleted;
  }

  @action
  setIsRecoverCompleted(isCompleted: boolean) {
    this.isRecoverCompleted = isCompleted;
  }

  @action
  setIsRecoverInProgress(isInProgress: boolean) {
    this.isRecoverInProgress = isInProgress;
  }

  @action
  setIsBackupInProgress(isInProgress: boolean) {
    this.isBackupInProgress = isInProgress;
  }

  @action
  setCloudKit(cloudkit: CloudKit.CloudKit | null) {
    this.cloudkit = cloudkit;
  }

  @action
  setAppleSignedIn(signedIn: boolean | null) {
    this.appleSignedIn = signedIn;
  }

  @action
  public setPassPhrases(passPhrases: IPassphraseInfo[]) {
    const reduced = passPhrases.reduce<TPassphrases>((p, v) => {
      p[v.passphraseId] = v;
      return p;
    }, {});

    this.passPhrases = reduced;
  }

  @action
  public addPassPhrases(passphraseId: string, location: TPassphraseLocation): void {
    this.passPhrases = { ...this.passPhrases, [passphraseId]: { passphraseId, location } };
  }

  @action
  public async createPassphraseInfo(passphraseId: string, location: TPassphraseLocation): Promise<void> {
    try {
      await createPassphraseInfo(passphraseId, location, this._rootStore.userStore.accessToken);
      this.addPassPhrases(passphraseId, location);
    } catch (e: any) {
      this.setError(e.message);
    }
  }

  @action
  public setError(error: string) {
    this.error = error;
  }

  public backupKeys(passphrase: string, passphraseId: string) {
    this._rootStore.fireblocksSDKStore.sdkInstance?.backupKeys(passphrase, passphraseId).catch((e) => {
      this.setError(e.message);
    });
  }

  public async backupGoogleDrive(passphrase: string, passphraseId: string) {
    try {
      const token = await this._rootStore.userStore.getGoogleDriveCredentials();
      await googleDriveBackup(token, passphrase, passphraseId);
    } catch (e: any) {}
  }

  public async getMyLatestBackup(walletId: string = ''): Promise<IBackupInfo | null> {
    try {
      const walletIdItem = walletId ? walletId : this._rootStore.deviceStore.walletId;
      const latestBackup = await getLatestBackup(
        walletIdItem ?? '',
        this._rootStore.userStore.accessToken,
        // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
        this._rootStore,
      );
      return latestBackup;
    } catch (e: any) {
      this.setError(e.message);
      return null;
    }
  }

  public async recoverGoogleDrive(passphraseId: string): Promise<string> {
    try {
      const token = await this._rootStore.userStore.getGoogleDriveCredentials();
      return googleDriveRecover(token, passphraseId);
    } catch (e: any) {
      this.setError(e.message);
    }
    return '';
  }

  public async passphraseRecover(location: TPassphraseLocation): Promise<IPassphrase> {
    if (this.passPhrases === null) {
      throw new Error();
    }

    // try to reuse previous
    for (const info of Object.values(this.passPhrases)) {
      if (info.location === location) {
        switch (location) {
          case 'GoogleDrive': {
            const passphrase = await this.recoverGoogleDrive(info.passphraseId);
            return { passphraseId: info.passphraseId, passphrase };
          }
          case 'iCloud': {
            if (!this.cloudkit || !this.appleSignedIn) {
              throw new Error('Sign in with Apple ID required');
            }

            const passphrase = await cloudkitRecover(this.cloudkit, info.passphraseId);
            return { passphraseId: info.passphraseId, passphrase };
          }
          default:
            throw new Error(`Unsupported backup location ${location as string}`);
        }
      }
    }

    throw new Error(`Not found backup location ${location as string}`);
  }

  public async passphrasePersist(location: TPassphraseLocation): Promise<IPassphrase> {
    if (this.passPhrases === null) {
      await this.init();

      // If passphrases are still null after initialization, then throw an error
      if (this.passPhrases === null) {
        throw new Error('Failed to load passphrases');
      }
    }

    try {
      const recover = await this.passphraseRecover(location);
      if (recover) {
        return recover;
      }
    } catch (e: any) {
      this.setError(e.message);
    }

    // creating new
    const passphrase = randomPassPhrase();
    const passphraseId = crypto.randomUUID();

    switch (location) {
      case 'GoogleDrive': {
        await this.backupGoogleDrive(passphrase, passphraseId);
        await this.createPassphraseInfo(passphraseId, location);
        return { passphraseId, passphrase };
      }
      case 'iCloud': {
        if (!this.cloudkit || !this.appleSignedIn) {
          throw new Error('Apple Sign in required');
        }
        await cloudkitBackup(this.cloudkit, passphrase, passphraseId);
        await this.createPassphraseInfo(passphraseId, location);
        return { passphraseId, passphrase };
      }
      default:
        throw new Error(`Unsupported backup location ${location as string}`);
    }
  }

  public async recoverPassphraseId(passphraseId: string): Promise<string> {
    // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
    const { passphrases } = await getPassphraseInfos(this._rootStore.userStore.accessToken, this._rootStore);

    if (passphrases === null) {
      throw new Error();
    }

    this.setPassPhrases(passphrases);

    // try to reuse previous
    for (const info of Object.values(passphrases)) {
      if (info.passphraseId === passphraseId) {
        switch (info.location) {
          case 'GoogleDrive': {
            return this.recoverGoogleDrive(info.passphraseId);
          }
          case 'iCloud': {
            if (!this.cloudkit || !this.appleSignedIn) {
              throw new Error('Sign in with Apple ID required');
            }

            return cloudkitRecover(this.cloudkit, info.passphraseId);
          }
          default:
            throw new Error(`Unsupported backup location ${info.location as string}`);
        }
      }
    }

    throw new Error('Not found backup location');
  }

  /**
   * Performs a backup of the wallet keys to the specified location
   * @param location The cloud storage location to save the backup (GoogleDrive or iCloud)
   */
  public async saveKeysBackup(location: TPassphraseLocation) {
    this.clearProgress();
    this.setIsBackupInProgress(true);
    try {
      // Ensure passphrases are loaded before proceeding
      await this.init();
      const { passphrase, passphraseId } = await this.passphrasePersist(location);
      await this._rootStore.fireblocksSDKStore.sdkInstance?.backupKeys(passphrase, passphraseId);
      const latestBackup = await this.getMyLatestBackup();
      this.setLatestBackup(latestBackup);
      this.setIsBackupCompleted(true);
      this.setIsBackupInProgress(false);
    } catch (e: any) {
      throw new Error(e.message);
    } finally {
      this.setIsBackupInProgress(false);
    }
  }

  /**
   * Recovers wallet keys from a backup stored at the specified location
   * @param location The cloud storage location to recover the backup from (GoogleDrive or iCloud)
   */
  public async recoverKeyBackup(location: TPassphraseLocation) {
    this.clearProgress();
    this.setIsRecoverInProgress(true);
    try {
      // Ensure passphrases are loaded before proceeding
      await this.init();
      const { passphraseId } = await this.passphrasePersist(location);
      if (this._rootStore.fireblocksSDKStore.sdkInstance) {
        await this._rootStore.fireblocksSDKStore.sdkInstance.recoverKeys(() => this.recoverPassphraseId(passphraseId));
        const keysStatus = await this._rootStore.fireblocksSDKStore.sdkInstance.getKeysStatus();
        if (Object.keys(keysStatus).length > 0) {
          this._rootStore.fireblocksSDKStore.setKeysStatus(keysStatus);
          this._rootStore.fireblocksSDKStore.setSDKStatus('sdk_available');
          this._rootStore.fireblocksSDKStore.setIsMPCReady(true);
        }
        this.setIsRecoverCompleted(true);
        this.setIsRecoverInProgress(false);
      }
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      this.setIsRecoverInProgress(false);
    }
  }
}
