import React from 'react';
import { CircularProgress, styled } from '@foundation';
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

export const Actions: React.FC = observer(function Actions() {
  const userStore = useUserStore();
  const fireblocksSDKStore = useFireblocksSDKStore();
  const { t } = useTranslation();

  const working = userStore.loggedUser && fireblocksSDKStore.isMPCGenerating;

  const needToGenerateKeys =
    userStore.loggedUser &&
    fireblocksSDKStore.sdkInstance &&
    !fireblocksSDKStore.isMPCGenerating &&
    !fireblocksSDKStore.isMPCReady;

  if (working) {
    return (
      <RootStyled>
        <div>
          <CircularProgress
            sx={{
              color: (theme) => theme.palette.text.primary,
            }}
            size={40}
            thickness={5}
          />
        </div>
      </RootStyled>
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
