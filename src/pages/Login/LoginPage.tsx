import { Button, Typography, styled } from '@foundation';
import { useDeviceStore, useUserStore } from '@store';
import { observer } from 'mobx-react';
import { redirect } from 'react-router-dom';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const ActionsStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(3),
  marginTop: theme.spacing(3),
}));

export const LoginPage: React.FC = observer(function LoginPage() {
  const userStore = useUserStore();

  if (userStore.loggedUser) {
    redirect('/assets');
  }

  return (
    <RootStyled>
      <Typography variant="h4" color="text.primary">
        Hello im LoginPage
      </Typography>
      <ActionsStyled>
        <Button
          variant="contained"
          onClick={() => {
            userStore.login('GOOGLE');
          }}
        >
          Login with Google
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            userStore.login('APPLE');
          }}
        >
          Login with Apple
        </Button>
      </ActionsStyled>
    </RootStyled>
  );
});
