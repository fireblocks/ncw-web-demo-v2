import { Typography, styled } from '@foundation';
import IconApple from '@icons/apple.svg';
import IconGoogle from '@icons/google.svg';
import IconLogo from '@icons/logo.svg';
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
        <IllustrationBlockStyled></IllustrationBlockStyled>
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
