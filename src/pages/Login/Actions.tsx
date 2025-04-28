import React, { useEffect } from 'react';
import { IKeyDescriptor } from '@fireblocks/ncw-js-sdk';
import { Progress, Typography, styled } from '@foundation';
import IconApple from '@icons/apple.svg';
import IconGoogle from '@icons/google.svg';
import IconKey from '@icons/key.svg';
import IconRecovery from '@icons/recover.svg';
import IconWallet from '@icons/wallet.svg';
import { useAuthStore, useUserStore } from '@store';
import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ENV_CONFIG } from '../../env_config.ts';
import { JoinWalletDialog } from '../Settings/Dialogs/JoinWalletPopup.tsx';
import { ActionPlate } from './ActionPlate';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
  marginTop: theme.spacing(7),
}));

const ProcessingStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  marginTop: theme.spacing(7),
}));

export const Actions: React.FC = observer(function Actions() {
  const [isEmbeddedWallet, setIsEmbeddedWallet] = React.useState(false);
  const userStore = useUserStore();
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [isJoinWalletDialogOpen, setIsJoinWalletDialogOpen] = React.useState(false);

  /**
   * Joins existing wallet.
   *
   * This function initiates the process of joining an existing wallet:
   * 1. Opens a dialog with a QR code and request ID
   * 2. Calls the auth store to get the request ID
   * 3. The user can then use another device to scan the QR code or enter the request ID
   * 4. Once the join process is complete, the dialog will close and the user will be navigated to the assets page
   */
  const joinExistingWallet = async (): Promise<void> => {
    try {
      // First open the dialog to show the loading state
      setIsJoinWalletDialogOpen(true);

      // Call joinExistingWallet to get the request ID
      // This will set authStore.capturedRequestId which the dialog will display
      const response: Set<IKeyDescriptor> = await authStore.joinExistingWallet();

      // The dialog will remain open to allow the user to copy/scan the request ID
      // The dialog has a timer and will automatically close after the time expires

      // Monitor the response to determine when to close the dialog and navigate
      if (response) {
        console.log('joinExistingWallet response', response);

        // Check if we have valid keys in the response
        if (response instanceof Set && response.size > 0) {
          console.log('response is of type Set, size is ', response.size);

          // Check if all items in the response have keyId and are ready
          const allItemsHaveKeyId = Array.from(response).every(
            (item) => item.keyStatus === 'READY' && item.keyId !== '',
          );

          if (allItemsHaveKeyId) {
            console.log('allItemsHaveKeyId is true, navigating to the home page');
            // Close the dialog since we have valid keys
            setIsJoinWalletDialogOpen(false);
            // Show success message
            enqueueSnackbar(t('LOGIN.JOIN_EXISTING_WALLET_SUCCESS'), { variant: 'success' });
            // Navigate to the assets page
            navigate('/assets');
          }
        }
      }
    } catch (error) {
      console.log('joinExistingWallet error', error);
      // Close the dialog on error
      setIsJoinWalletDialogOpen(false);
      enqueueSnackbar(t('LOGIN.JOIN_EXISTING_WALLET_ERROR'), { variant: 'error' });
    }
  };

  const generateMPCKeys = () => {
    authStore.generateMPCKeys().catch(() => {
      enqueueSnackbar(t('LOGIN.GENERATE_MPC_KEYS_ERROR'), { variant: 'error' });
    });
  };

  const recoverMPCKeys = () => {
    authStore.recoverMPCKeys('GoogleDrive').catch(() => {
      enqueueSnackbar(t('LOGIN.RECOVERY_FROM_BACKUP_ERROR'), { variant: 'error' });
    });
  };

  useEffect(() => {
    if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK === 'true') {
      setIsEmbeddedWallet(true);
    }
  }, []);

  if (authStore.preparingWorkspace) {
    return (
      <ProcessingStyled>
        <Progress size="medium" />
        <Typography variant="body1" color="text.primary">
          {t('LOGIN.CHECKING_WORKSPACE')}
        </Typography>
      </ProcessingStyled>
    );
  }

  if (authStore.needToGenerateKeys) {
    return (
      <>
        <RootStyled>
          {userStore.hasBackup && (
            <ActionPlate iconSrc={IconRecovery} caption={t('LOGIN.RECOVERY_FROM_BACKUP')} onClick={recoverMPCKeys} />
          )}
          {((isEmbeddedWallet && !userStore.hasBackup) || !isEmbeddedWallet) && (
            // in an embedded wallet mode we can't generate keys if backup exists already OR not embedded wallet mode
            <ActionPlate iconSrc={IconKey} caption={t('LOGIN.GENERATE_MPC_KEYS')} onClick={generateMPCKeys} />
          )}
          {isEmbeddedWallet && userStore.hasBackup && (
            // if we already have a backup we can't generate keys, so we need to allow 'join to existing wallet'
            <ActionPlate iconSrc={IconWallet} caption={t('LOGIN.JOIN_EXISTING_WALLET')} onClick={joinExistingWallet} />
          )}
        </RootStyled>
        <JoinWalletDialog
          isOpen={isJoinWalletDialogOpen}
          onClose={() => {
            setIsJoinWalletDialogOpen(false);
          }}
        />
      </>
    );
  }

  return (
    <RootStyled>
      <ActionPlate
        iconSrc={IconApple}
        caption={t('LOGIN.SIGN_IN_WITH_APPLE')}
        onClick={() => {
          userStore.login('APPLE');
        }}
      />
      <ActionPlate
        iconSrc={IconGoogle}
        caption={t('LOGIN.SIGN_IN_WITH_GOOGLE')}
        onClick={() => {
          userStore.login('GOOGLE');
        }}
      />
    </RootStyled>
  );
});
