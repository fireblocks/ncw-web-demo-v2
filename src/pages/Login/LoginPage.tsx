import { ActionButton, Typography, styled } from '@foundation';
import { useUserStore } from '@store';
import { observer } from 'mobx-react';
import { redirect } from 'react-router-dom';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  paddingTop: theme.spacing(10),
}));

const ActionsStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(4),
  marginTop: theme.spacing(6),
}));

export const LoginPage: React.FC = observer(function LoginPage() {
  const userStore = useUserStore();

  if (userStore.loggedUser) {
    redirect('/assets');
  }

  return (
    <RootStyled>
      <Typography variant="h1" color="text.primary">
        Login to use web demo
      </Typography>
      <ActionsStyled>
        <ActionButton
          onClick={() => {
            userStore.login('APPLE');
          }}
          caption="Login with Apple"
        />
        <ActionButton
          onClick={() => {
            userStore.login('GOOGLE');
          }}
          caption="Login with Google"
        />
      </ActionsStyled>
    </RootStyled>
  );
});
