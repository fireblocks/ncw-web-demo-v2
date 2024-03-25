import { IPassphraseInfo, TPassphraseLocation, TPassphrases, createPassphraseInfo, getPassphraseInfos } from '@api';
import { action, makeObservable } from 'mobx';
import CloudKit from 'tsl-apple-cloudkit';
import { DISCOVERY_DOC } from '../auth/providers';
import { RootStore } from './Root.store';

export class BackupStore {
  public passPhrases: TPassphrases | null;
  public cloudkit: CloudKit.CloudKit | null;
  public appleSignedIn: boolean;

  public error: string | null;

  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.passPhrases = null;
    this.cloudkit = null;
    this.appleSignedIn = false;
    this.error = null;
    this._rootStore = rootStore;

    makeObservable(this);
  }

  public init() {
    getPassphraseInfos(this._rootStore.userStore.accessToken)
      .then((response) => {
        this.setPassPhrases(response.passphrases);
      })
      .catch((e) => {
        this.setError(e.message);
      });
  }

  @action
  setCloudKit(cloudkit: CloudKit.CloudKit) {
    this.cloudkit = cloudkit;
  }

  @action
  setAppleSignedIn(signedIn: boolean) {
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
  public addPassPhrases(passphraseId: string, location: TPassphraseLocation) {
    this.passPhrases = { ...this.passPhrases, [passphraseId]: { passphraseId, location } };
  }

  @action
  public createPassphraseInfo(passphraseId: string, location: TPassphraseLocation) {
    createPassphraseInfo(passphraseId, location, this._rootStore.userStore.accessToken)
      .then(() => {
        this.addPassPhrases(passphraseId, location);
      })
      .catch((e) => {
        this.setError(e.message);
      });
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

  public backupGoogleDrive(passphrase: string, passphraseId: string) {
    this._rootStore.userStore
      .getGoogleDriveCredentials()
      .then((token) => this._gDriveBackup(token, passphrase, passphraseId))
      .catch((e) => {
        this.setError(e.message);
      });
  }

  public recoverGoogleDrive(passphraseId: string) {
    this._rootStore.userStore
      .getGoogleDriveCredentials()
      .then((token) => this._gDriveRecover(token, passphraseId))
      .catch((e) => {
        this.setError(e.message);
      });
  }

  private _gDriveRecover(token: string, passphraseId: string) {
    return new Promise<string>((resolve, reject) => {
      gapi.load('client', {
        callback: () => {
          const filename = `passphrase_${passphraseId}.txt`;
          gapi.client
            .init({
              discoveryDocs: [DISCOVERY_DOC],
            })
            .then(() => {
              gapi.client.drive.files
                .list({
                  spaces: 'appDataFolder',
                  oauth_token: token,
                  q: `name='${filename}'`,
                })
                .then((list) => {
                  const file = list.result.files?.find((f) => f.name === filename);
                  if (file?.id) {
                    fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    })
                      .then((res) => {
                        res
                          .text()
                          .then((t) => {
                            resolve(t);
                          })
                          .catch((e) => {
                            this.setError(e.message);
                            reject(new Error('Failed to download from Google Drive'));
                          });

                        return;
                      })
                      .catch((e) => {
                        this.setError(e.message);
                        reject(new Error('Failed to download from Google Drive'));
                      });
                  } else {
                    throw new Error('not found');
                  }
                })
                .catch((e) => {
                  this.setError(e.message);
                  reject(new Error('Failed to recover from Google Drive'));
                });
            })
            .catch((e) => {
              this.setError(e.message);
              reject(new Error('Failed to initialize Google Drive'));
            });
        },
        onerror: reject,
        ontimeout: reject,
        timeout: 5_000,
      });
    });
  }

  private _gDriveBackup(token: string, passphrase: string, passphraseId: string) {
    return new Promise<void>((resolve, reject) => {
      gapi.load('client', {
        callback: () => {
          gapi.client
            .init({
              discoveryDocs: [DISCOVERY_DOC],
            })
            .then(() => {
              const filename = `passphrase_${passphraseId}.txt`;

              const file = new Blob([passphrase], { type: 'text/plain' });

              const metadata: gapi.client.drive.File = {
                name: filename,
                mimeType: 'text/plain',
                parents: ['appDataFolder'],
              };

              gapi.client.drive.files
                .create({
                  oauth_token: token,
                  uploadType: 'media',
                  resource: metadata,
                  fields: 'id',
                })
                .then((create) => {
                  if (create?.result?.id) {
                    fetch(`https://www.googleapis.com/upload/drive/v3/files/${create.result.id}?uploadType=media`, {
                      method: 'PATCH',
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': metadata.mimeType!,
                        'Content-Length': file.size.toString(),
                      },
                      body: passphrase,
                    })
                      .then(() => {
                        resolve();
                      })
                      .catch((e) => {
                        this.setError(e.message);
                        reject(new Error('Failed to upload to Google Drive'));
                      });
                  }
                })
                .catch((e) => {
                  this.setError(e.message);
                  reject(new Error('Failed to backup to Google Drive'));
                });
            })
            .catch((e) => {
              this.setError(e.message);
              reject(new Error('Failed to initialize Google Drive'));
            });
        },
        onerror: reject,
        ontimeout: reject,
        timeout: 5_000,
      });
    });
  }
}
