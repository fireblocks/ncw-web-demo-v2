import { Typography, styled } from '@foundation';
import { useAccountsStore, useDeviceStore, useUserStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { SettingsItems } from './SettingsItems';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

export const SettingsPage: React.FC = observer(function SettingsPage() {
  const { t } = useTranslation();
  const userStore = useUserStore();
  const deviceStore = useDeviceStore();
  const accountsStore = useAccountsStore();

  return (
    <RootStyled>
      <Typography variant="h3" color="text.primary">
        {t('PAGE_NAME.SETTINGS')}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {t('SETTINGS.DESCRIPTION')}
      </Typography>
      <br />
      <Typography variant="body1" color="text.secondary">
        User name: {userStore.loggedUser?.displayName}
        <br />
        User id: {userStore.userId}
        <br />
        Device id: {deviceStore.deviceId}
        <br />
        Account id: {accountsStore.accounts.length > 0 && accountsStore.accounts[0].data.accountId}
      </Typography>

      <SettingsItems />
    </RootStyled>
  );
});
