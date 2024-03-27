import React, { useEffect } from 'react';
import type { CloudKit } from 'tsl-apple-cloudkit';
import { ENV_CONFIG } from '../env_config';

export function useCloudkit() {
  const [cloudkit, setCloudkit] = React.useState<CloudKit | null>(null);
  const [appleSignedIn, setAppleSignedIn] = React.useState<boolean | null>(null);

  useEffect(() => {
    let cancel = false;
    const loadApple = () => {
      const ck = window.CloudKit.configure({
        containers: [
          {
            containerIdentifier: ENV_CONFIG.CLOUDKIT_CONTAINER_ID,
            apiTokenAuth: {
              apiToken: ENV_CONFIG.CLOUDKIT_APITOKEN,
              persist: true,
              signInButton: { id: 'sign-in-button', theme: 'black' },
              signOutButton: { id: 'sign-out-button', theme: 'black' },
            },
            environment: ENV_CONFIG.CLOUDKIT_ENV ?? 'development',
          },
        ],
      });

      if (!cancel) {
        setCloudkit(ck);
      }
    };

    loadApple();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    const setupAuth = async (ck: CloudKit) => {
      const appleId = await ck.getDefaultContainer().setUpAuth();
      if (appleId) {
        setAppleSignedIn(true);
      } else {
        setAppleSignedIn(false);
      }
    };

    if (cloudkit) {
      setupAuth(cloudkit);
    }
  }, [cloudkit]);

  useEffect(() => {
    const onUserChange = async (ck: CloudKit) => {
      if (appleSignedIn) {
        await ck.getDefaultContainer().whenUserSignsOut();
        setAppleSignedIn(false);
      } else {
        await ck.getDefaultContainer().whenUserSignsIn();
        setAppleSignedIn(true);
      }
    };

    if (cloudkit) {
      onUserChange(cloudkit);
    }
  }, [appleSignedIn]);

  return { cloudkit, appleSignedIn };
}

export const cloudkitBackup = async (cloudkit: CloudKit, passphrase: string, passphraseId: string) => {
  const db = cloudkit.getDefaultContainer().privateCloudDatabase;
  const recordName = `backup_t_${passphraseId}`;
  const recordType = 'Backup';

  // create
  const result = await db.saveRecords([
    {
      recordName,
      recordType,
      fields: {
        phrase: {
          type: 'STRING',
          value: passphrase,
        },
      },
    },
  ]);

  if (result.hasErrors) {
    console.error('Failed to save records', result.errors);
    throw new Error('Failed to backup');
  }
};

export const cloudkitRecover = async (cloudkit: CloudKit, passphraseId: string) => {
  const db = cloudkit.getDefaultContainer().privateCloudDatabase;
  const recordName = `backup_t_${passphraseId}`;
  const recordType = 'Backup';

  const results = await db.fetchRecords([
    {
      recordName,
      recordType,
    },
  ]);

  if (results.hasErrors) {
    console.error('Failed to fetch records', results.errors);
    throw new Error('Failed to recover');
  }

  if (results.records.length === 1) {
    if (Array.isArray(results.records[0].fields)) {
      throw new Error('Unexpected schema');
    }
    if (results.records[0].fields['phrase'].type !== 'STRING') {
      throw new Error('Unexpected schema');
    }
    return results.records[0].fields['phrase'].value as string;
  }

  throw new Error('not found');
};
