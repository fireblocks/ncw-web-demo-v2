import { Typography, styled } from '@foundation';
import { useDeviceStore, useUserStore } from '@store';
import { observer } from 'mobx-react';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
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
        <li>
          <Typography variant="subtitle1" color="text.primary">
            UserId: {userStore.userId}
          </Typography>
        </li>
        <li>
          <Typography variant="subtitle1" color="text.primary">
            Device: {deviceStore.deviceId}
          </Typography>
        </li>
      </ul>
    </RootStyled>
  );
});
