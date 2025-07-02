import React, { useEffect, useState } from 'react';
import { IKeyDescriptor } from '@fireblocks/ncw-js-sdk';
import { useAuthStore, useBackupStore, useUserStore } from '@store';
import { encode } from 'js-base64';
import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ENV_CONFIG } from '../../env_config.ts';
import { BackupPhaseUI, JoinWalletUI, LoginOptionsUI, ProcessingUI, WalletGenerationOptionsUI } from './components';

interface IProps {
  setIsInBackupPhase: (isInBackupPhase: boolean) => void;
}

export const Actions: React.FC<IProps> = observer(function Actions({ setIsInBackupPhase }) {
  const [isEmbeddedWallet, setIsEmbeddedWallet] = useState(false);
  const [isBackupPhase, setIsBackupPhase] = useState(false);
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  const [isJoiningWallet, setIsJoiningWallet] = useState(false);
  const [encodedRequestId, setEncodedRequestId] = useState<string | null>(null);
  const userStore = useUserStore();
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const backupStore = useBackupStore();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  /**
   * Joins existing wallet.
   *
   * This function initiates the process of joining an existing wallet:
   * 1. Shows the join wallet UI with steps and QR code
   * 2. Calls the auth store to get the request ID
   * 3. The user can then use another device to scan the QR code or enter the request ID
   * 4. Once the join process is complete, the user will be navigated to the assets page
   */
  const joinExistingWallet = async (): Promise<void> => {
    try {
      // Show the join wallet UI
      setIsJoiningWallet(true);

      // Call joinExistingWallet to get the request ID
      // This will set authStore.capturedRequestId which we'll use to generate the QR code
      const response: Set<IKeyDescriptor> = await authStore.joinExistingWallet();

      // Monitor the response to determine when to navigate
      if (response) {
        // Check if we have valid keys in the response
        if (response instanceof Set && response.size > 0) {
          // Check if all items in the response have keyId and are ready
          const allItemsHaveKeyId = Array.from(response).every(
            (item) => item.keyStatus === 'READY' && item.keyId !== '',
          );

          if (allItemsHaveKeyId) {
            // Hide the join wallet UI
            setIsJoiningWallet(false);
            // Show success message
            enqueueSnackbar(t('LOGIN.JOIN_EXISTING_WALLET_SUCCESS'), { variant: 'success' });
            // Navigate to the assets page
            navigate('/assets');
          }
        }
      }
    } catch (error) {
      // Hide the join wallet UI on error
      // in case of a max device, you need to remove some devices, it's a limit not related to the front-end side
      console.error('Error joining existing wallet: ', error);
      setIsJoiningWallet(false);
      enqueueSnackbar(t('LOGIN.JOIN_EXISTING_WALLET_ERROR'), { variant: 'error' });
    }
  };

  // Update encodedRequestId when authStore.capturedRequestId changes
  useEffect(() => {
    if (authStore.capturedRequestId && isJoiningWallet) {
      const encoded = encode(
        `{"email":"${userStore?.loggedUser?.email ?? 'not available'}","platform":"Web","requestId":"${authStore.capturedRequestId}"}`,
      );
      setEncodedRequestId(encoded);
    }
  }, [authStore.capturedRequestId, isJoiningWallet, userStore?.loggedUser?.email]);

  const generateMPCKeys = () => {
    setIsInBackupPhase(true); // Set parent component state
    authStore
      .generateMPCKeys()
      .then(() => {
        setIsBackupPhase(true);
      })
      .catch(() => {
        enqueueSnackbar(t('LOGIN.GENERATE_MPC_KEYS_ERROR'), { variant: 'error' });
      });
  };

  const recoverMPCKeys = () => {
    authStore.recoverMPCKeys('GoogleDrive').catch(() => {
      enqueueSnackbar(t('LOGIN.RECOVERY_FROM_BACKUP_ERROR'), { variant: 'error' });
    });
  };

  const createBackup = () => {
    setIsBackupInProgress(true);
    backupStore
      .saveKeysBackup('GoogleDrive')
      .then(() => {
        setIsBackupInProgress(false);
        setIsInBackupPhase(false); // Set parent component state to false when exiting backup phase
        enqueueSnackbar(t('SETTINGS.DIALOGS.BACKUP.SUCCESS_MESSAGE'), { variant: 'success' });
        authStore.setStatus('READY');
        navigate('/assets');
      })
      .catch((e: any) => {
        console.error('Backup Error: ', e);
        setIsBackupInProgress(false);
        enqueueSnackbar(t('SETTINGS.DIALOGS.BACKUP.ERROR_MESSAGE'), { variant: 'error' });
      });
  };

  const continueWithoutBackup = () => {
    setIsInBackupPhase(false); // Set parent component state to false when exiting backup phase
    authStore.setStatus('READY');
    navigate('/assets');
  };

  useEffect(() => {
    if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
      setIsEmbeddedWallet(true);
    }
  }, []);

  if (authStore.preparingWorkspace && !isBackupPhase) {
    return <ProcessingUI />;
  }

  if (isBackupPhase) {
    return (
      <BackupPhaseUI
        isBackupInProgress={isBackupInProgress}
        createBackup={createBackup}
        continueWithoutBackup={continueWithoutBackup}
      />
    );
  }

  // Render the join wallet UI with steps, QR code, and ID text
  const renderJoinWalletUI = () => <JoinWalletUI encodedRequestId={encodedRequestId} />;

  if (authStore.needToGenerateKeys) {
    if (isJoiningWallet) {
      return renderJoinWalletUI();
    }

    return (
      <WalletGenerationOptionsUI
        isEmbeddedWallet={isEmbeddedWallet}
        hasBackup={userStore.hasBackup}
        joinExistingWallet={() => {
          void joinExistingWallet();
        }}
        recoverMPCKeys={recoverMPCKeys}
        generateMPCKeys={generateMPCKeys}
      />
    );
  }

  return (
    <LoginOptionsUI
      onAppleLogin={() => {
        userStore.login('APPLE');
      }}
      onGoogleLogin={() => {
        userStore.login('GOOGLE');
      }}
    />
  );
});
