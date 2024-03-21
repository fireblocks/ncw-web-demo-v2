import React from 'react';
import { Progress, Typography, styled } from '@foundation';
import IconApple from '@icons/apple.svg';
import IconGoogle from '@icons/google.svg';
import IconKey from '@icons/key.svg';
import { useFireblocksSDKStore, useUserStore } from '@store';
import { observer } from 'mobx-react';
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
  const fireblocksSDKStore = useFireblocksSDKStore();
  const { t } = useTranslation();

  const preparingWorkspace =
    !userStore.storeIsReady ||
    (userStore.loggedUser && !fireblocksSDKStore.sdkInstance) ||
    fireblocksSDKStore.isMPCGenerating;

  const needToGenerateKeys =
    userStore.loggedUser &&
    fireblocksSDKStore.sdkInstance &&
    !fireblocksSDKStore.isMPCGenerating &&
    !fireblocksSDKStore.isMPCReady;

  if (preparingWorkspace) {
    return (
      <ProcessingStyled>
        <Progress size="medium" />
        <Typography variant="body1" color="text.primary">
          {t('LOGIN.CHECKING_WORKSPACE')}
        </Typography>
      </ProcessingStyled>
    );
  }

  if (needToGenerateKeys) {
    return (
      <RootStyled>
        <ActionPlate
          iconSrc={IconKey}
          caption={t('LOGIN.GENERATE_MPC_KEYS')}
          onClick={() => {
            fireblocksSDKStore.generateMPCKeys();
          }}
        />
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
