export type TPassphraseLocation = 'GoogleDrive' | 'iCloud';

export interface IBackupInfo {
  passphraseId: string;
  location: TPassphraseLocation;
  createdAt: number;
}
