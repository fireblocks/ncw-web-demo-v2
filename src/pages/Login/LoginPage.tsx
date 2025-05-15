import React from 'react';
import { Typography, alpha, styled } from '@foundation';
import IconAssets from '@icons/login_assets.svg';
import IconBG from '@icons/login_bg.svg';
import IconLogo from '@icons/logo.svg';
import { useAuthStore, useFireblocksSDKStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { redirect } from 'react-router-dom';
import { ENV_CONFIG } from '../../env_config.ts';
import { Actions } from './Actions';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '80%',
  margin: '0 auto',
  justifyContent: 'center',
}));

const ContentWrapperStyled = styled('div')(({ theme }) => ({
  backgroundColor: alpha(theme.palette.secondary.light, 0.4),
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
}));

const IllustrationBlockStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  justifyItems: 'center',
  alignItems: 'center',
  width: '50%',
  position: 'relative',
  overflow: 'hidden',
}));

const IllustrationBlockBGStyled = styled('img')(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
}));

const IllustrationContentStyled = styled('div')(() => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  width: '70%',
  textAlign: 'center',
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  margin: '0 auto',
}));

const IllustrationBlockchainsStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const HeaderTextStyled = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.h2.fontSize,
  color: theme.palette.text.primary,
  fontWeight: 300,
  lineHeight: '56px',
  letterSpacing: theme.typography.h2.letterSpacing,
}));

const HeaderDescriptionStyled = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  margin: theme.spacing(6, 'auto', 4, 'auto'),
  width: 330,
}));

const ActionsBlockStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '48%',
  height: 700,
  minHeight: 700,
  boxSizing: 'border-box',
  margin: theme.spacing(3, 3, 3, 0),
  paddingTop: theme.spacing(12),
}));

const ActionsHeadingStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

const LogoWrapperStyled = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const ActionsContentStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  width: 408,
  margin: '0 auto',
}));

export const LoginPage: React.FC = observer(function LoginPage() {
  const { t } = useTranslation();
  const lastVisitedPage = localStorage.getItem('VISITED_PAGE');
  const fireblocksSDKStore = useFireblocksSDKStore();
  const authStore = useAuthStore();

  const getWelcomeText = () => {
    if (authStore.needToGenerateKeys) {
      return t('LOGIN.GET_STARTED');
    }
    return ENV_CONFIG.USE_EMBEDDED_WALLET_SDK === 'true' ? t('LOGIN.WELCOME_EW') : t('LOGIN.WELCOME');
  };

  const getDescriptionText = () => {
    if (authStore.needToGenerateKeys) {
      return t('LOGIN.JOIN_OR_RECOVER_DESCRIPTION');
    }
    return ENV_CONFIG.USE_EMBEDDED_WALLET_SDK === 'true' ? t('LOGIN.DESCRIPTION_EW') : t('LOGIN.DESCRIPTION');
  };

  const updateBackupPupdateBackupPhasehase = (backupPage: boolean) => {
    fireblocksSDKStore.backupPhase(backupPage);
  };

  // Pass this state to Actions component to know if we're in backup phase
  React.useEffect(() => {
    // This effect will run when keysAreReady changes
    // If keys are ready and we're not in backup phase, redirect to assets
    // But only if we're not in the process of generating MPC keys
    if (fireblocksSDKStore.keysAreReady && !fireblocksSDKStore.isBackupPhase && !fireblocksSDKStore.isMPCGenerating) {
      redirect(lastVisitedPage ? lastVisitedPage : 'assets');
    }
  }, [
    fireblocksSDKStore.keysAreReady,
    lastVisitedPage,
    fireblocksSDKStore.isMPCGenerating,
    fireblocksSDKStore.isBackupPhase,
  ]);

  return (
    <RootStyled>
      <ContentWrapperStyled>
        <IllustrationBlockStyled>
          <IllustrationBlockBGStyled src={IconBG} />
          <IllustrationContentStyled>
            <HeaderTextStyled>{t('LOGIN.ILLUSTRATION.HEADER')}</HeaderTextStyled>
            <HeaderDescriptionStyled variant="subtitle1">{t('LOGIN.ILLUSTRATION.DESCRIPTION')}</HeaderDescriptionStyled>
            <IllustrationBlockchainsStyled>
              <img src={IconAssets} />
              <Typography variant="subtitle1" color="text.secondary">
                {t('LOGIN.ILLUSTRATION.BLOCKCHAINS')}
              </Typography>
            </IllustrationBlockchainsStyled>
          </IllustrationContentStyled>
        </IllustrationBlockStyled>
        <ActionsBlockStyled>
          <ActionsContentStyled>
            <ActionsHeadingStyled>
              <LogoWrapperStyled>
                <img src={IconLogo} />
              </LogoWrapperStyled>
              <Typography variant="h3" color="text.primary" sx={{ textTransform: 'uppercase' }}>
                {getWelcomeText()}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                {getDescriptionText()}
              </Typography>
            </ActionsHeadingStyled>
            <Actions setIsInBackupPhase={updateBackupPupdateBackupPhasehase} />
          </ActionsContentStyled>
        </ActionsBlockStyled>
      </ContentWrapperStyled>
    </RootStyled>
  );
});
