import React, { useEffect } from 'react';
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
import { ENV_CONFIG } from '../../env_config.ts';
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

  /**
   * Joins existing wallet.
   */
  const joinExistingWallet = () => {
    authStore.joinExistingWallet().catch(() => {
      enqueueSnackbar(t('LOGIN.JOIN_EXISTING_WALLET_ERROR'), { variant: 'error' });
    });
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
      <RootStyled>
        {userStore.hasBackup && (
          <ActionPlate iconSrc={IconRecovery} caption={t('LOGIN.RECOVERY_FROM_BACKUP')} onClick={recoverMPCKeys} />
        )}
        {isEmbeddedWallet && !userStore.hasBackup && (
          // in an embedded wallet mode we can't generate keys if backup exists already'
          <ActionPlate iconSrc={IconKey} caption={t('LOGIN.GENERATE_MPC_KEYS')} onClick={generateMPCKeys} />
        )}
        {isEmbeddedWallet && userStore.hasBackup && (
          // if we already have a backup we can't generate keys, so we need to allow 'join to existing wallet'
          <ActionPlate iconSrc={IconWallet} caption={t('LOGIN.JOIN_EXISTING_WALLET')} onClick={joinExistingWallet} />
        )}
        {!isEmbeddedWallet && (
          <ActionPlate iconSrc={IconKey} caption={t('LOGIN.GENERATE_MPC_KEYS')} onClick={generateMPCKeys} />
        )}
      </RootStyled>
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
