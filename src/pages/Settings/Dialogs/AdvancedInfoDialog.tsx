import React from 'react';
import { Dialog, Typography } from '@foundation';
import { useAccountsStore, useDeviceStore, useFireblocksSDKStore, useUserStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvancedInfoDialog: React.FC<IProps> = observer(function AdvancedInfoDialog({ isOpen, onClose }) {
  const { t } = useTranslation();

  const userStore = useUserStore();
  const deviceStore = useDeviceStore();
  const accountsStore = useAccountsStore();
  const fireblocksSDKStore = useFireblocksSDKStore();

  const renderMPCKeysSection = () => {
    if (!fireblocksSDKStore.sdkInstance) {
      return null;
    }

    if (fireblocksSDKStore.isMPCGenerating) {
      return 'MPS keys status: Generating';
    }

    if (fireblocksSDKStore.isMPCReady) {
      return 'MPS keys status: Ready';
    }

    return null;
  };

  return (
    <Dialog
      title={t('SETTINGS.DIALOGS.ADVANCED_INFO.TITLE')}
      description={t('SETTINGS.DIALOGS.ADVANCED_INFO.DESCRIPTION')}
      isOpen={isOpen}
      onClose={onClose}
      size="small"
    >
      <Typography variant="body1" color="text.secondary">
        User name: {userStore.loggedUser?.displayName}
        <br />
        User id: {userStore.userId}
        <br />
        Device id: {deviceStore.deviceId}
        <br />
        Wallet id: {deviceStore.walletId}
        <br />
        Account id: {accountsStore.accounts.length > 0 && accountsStore.accounts[0].data.accountId}
        <br />
        {renderMPCKeysSection()}
      </Typography>
    </Dialog>
  );
});
