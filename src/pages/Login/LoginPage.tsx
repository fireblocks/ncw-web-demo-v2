import { Typography, styled } from '@foundation';
import IconApple from '@icons/apple.svg';
import IconGoogle from '@icons/google.svg';
import IconLogo from '@icons/logo.svg';
import IconBG from '@icons/login_background.svg';
import IconAssets from '@icons/login_assets.svg';
import { useUserStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { redirect } from 'react-router-dom';
import { ActionPlate } from './ActionPlate';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  paddingTop: theme.spacing(10),
  width: '90%',
  margin: '0 auto',
}));

const ContentWrapperStyled = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(6),
  backgroundColor: '#19191A',
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
  background: `url(${IconBG}) top left no-repeat`,
}));

const IllustrationContentStyled = styled('div')(() => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  width: '70%',
  textAlign: 'center',
}));

const IllustrationBlockchainsStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const HeaderTextStyled = styled(Typography)(({ theme }) => ({
  fontSize: 44,
  color: theme.palette.text.primary,
  fontWeight: 300,
  lineHeight: '57px',
  letterSpacing: 2.5,
}));

const HeaderDescriptionStyled = styled(Typography)(({ theme }) => ({
  fontSize: 16,
  color: theme.palette.text.secondary,
  fontWeight: 400,
  lineHeight: '24px',
  margin: theme.spacing(6, 'auto', 4, 'auto'),
  width: 330,
}));

const ActionsBlockStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundColor: '#1C1C1D',
  width: '48%',
  height: 784,
  minHeight: 784,
  boxSizing: 'border-box',
  margin: theme.spacing(3, 3, 3, 0),
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

const ActionsStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
  marginTop: theme.spacing(7),
}));

export const LoginPage: React.FC = observer(function LoginPage() {
  const userStore = useUserStore();
  const { t } = useTranslation();

  if (userStore.loggedUser) {
    redirect('/assets');
  }

  return (
    <RootStyled>
      <ContentWrapperStyled>
        <IllustrationBlockStyled>
          <IllustrationContentStyled>
            <HeaderTextStyled>{t('LOGIN.ILLUSTRATION.HEADER')}</HeaderTextStyled>
            <HeaderDescriptionStyled>{t('LOGIN.ILLUSTRATION.DESCRIPTION')}</HeaderDescriptionStyled>
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
              <Typography variant="h5" color="text.primary">
                {t('LOGIN.WELCOME')}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {t('LOGIN.DESCRIPTION')}
              </Typography>
            </ActionsHeadingStyled>
            <ActionsStyled>
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
            </ActionsStyled>
          </ActionsContentStyled>
        </ActionsBlockStyled>
      </ContentWrapperStyled>
    </RootStyled>
  );
});
