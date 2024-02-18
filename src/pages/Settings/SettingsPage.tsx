import { Typography, styled } from '@foundation';
import { useDeviceStore, useUserStore } from '@store';
import { observer } from 'mobx-react';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const LiStyled = styled('li')(({ theme }) => ({
  padding: theme.spacing(1, 0),
}));

export const SettingsPage: React.FC = observer(function SettingsPage() {
  const userStore = useUserStore();
  const deviceStore = useDeviceStore();

  return (
    <RootStyled>
      <Typography variant="h4" color="text.primary">
        Hello im SettingsPage
      </Typography>
      <ul>
        <LiStyled>
          <Typography variant="subtitle1" color="text.primary">
            UserId:
            <br />
            {userStore.userId}
          </Typography>
        </LiStyled>
        <LiStyled>
          <Typography variant="subtitle1" color="text.primary">
            Device:
            <br />
            {deviceStore.deviceId}
          </Typography>
        </LiStyled>
        <LiStyled>
          <Typography variant="subtitle1" color="text.primary">
            Wallet:
            <br />
            {deviceStore.walletId}
          </Typography>
        </LiStyled>
      </ul>
    </RootStyled>
  );
});
