import React from 'react';
import { Progress, Typography, styled } from '@foundation';
import IconApple from '@icons/apple.svg';
import IconGoogle from '@icons/google.svg';
import IconKey from '@icons/key.svg';
import IconRecovery from '@icons/recover.svg';
import { useAuthStore, useUserStore } from '@store';
import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
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
  const userStore = useUserStore();
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();

  const generateMPCKeys = () => {
    if (authStore.status === 'GENERATING') {
      return;
    }
    
    authStore.generateMPCKeys().catch(() => {
      enqueueSnackbar(t('LOGIN.GENERATE_MPC_KEYS_ERROR'), { variant: 'error' });
    });
  };

  const recoverMPCKeys = () => {
    authStore.recoverMPCKeys('GoogleDrive').catch(() => {
      enqueueSnackbar(t('LOGIN.RECOVERY_FROM_BACKUP_ERROR'), { variant: 'error' });
    });
  };

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
        <ActionPlate iconSrc={IconKey} caption={t('LOGIN.GENERATE_MPC_KEYS')} onClick={generateMPCKeys} />
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
