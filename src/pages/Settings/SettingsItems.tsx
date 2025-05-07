import React from 'react';
import { styled } from '@foundation';
import IconGoogle from '@icons/google.svg';
import IconInfo from '@icons/info.svg';
import IconKey from '@icons/key.svg';
import IconWallet from '@icons/new-wallet.svg';
import IconLogs from '@icons/share_logs.svg';
import IconRecoverWallet from '@icons/setting-recover-wallet.svg';
import { useAssetsStore, useAuthStore, useBackupStore, useFireblocksSDKStore } from '@store';
import { decode } from 'js-base64';
import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { ActionPlate } from './ActionPlate';
import { AddNewDeviceDialog } from './Dialogs/AddNewDeviceDialog/AddNewDeviceDialog';
import { AdvancedInfoDialog } from './Dialogs/AdvancedInfoDialog';
import { BackupDialog } from './Dialogs/BackupDialog';
import { ExportPrivateKeysDialog } from './Dialogs/ExportKeys/ExportPrivateKeysDialog';
import { LogsDialog } from './Dialogs/LogsDialog';
import { RecoverWalletDialog } from './Dialogs/RecoverWalletDialog';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  columnGap: '2px',
  rowGap: '2px',
  marginTop: theme.spacing(4),
}));

export type TRequestDecodedData = { email: string; requestId: string; platform: string };

export const SettingsItems: React.FC = observer(function SettingsItems() {
  const { t } = useTranslation();
  const backupStore = useBackupStore();
  const fireblocksSDKStore = useFireblocksSDKStore();
  const assetsStore = useAssetsStore();
  const fireblockStore = useFireblocksSDKStore();
  const { enqueueSnackbar } = useSnackbar();

  const [isAdvancedInfoDialogOpen, setIsAdvancedInfoDialogOpen] = React.useState(false);
  const [isLogsDialogOpen, setIsLogsDialogOpen] = React.useState(false);
  const [isBackupDialogOpen, setIsBackupDialogOpen] = React.useState(false);
  const [isExportPrivateKeysDialogOpen, setIsExportPrivateKeysDialogOpen] = React.useState(false);
  // const [disableApproveJoinBtn, setDisableApproveJoinBtn] = React.useState(false);
  const [isAddNewDeviceDialogOpen, setIsAddNewDeviceDialogOpen] = React.useState(false);
  const [isRecoverWalletDialogOpen, setIsRecoverWalletDialogOpen] = React.useState(false);

  /**
   * Approves join wallet request.
   * @param requestData - encoded request data from the other device we want to approve
   */
  const approveJoinWallet = async (): Promise<void> => {
    setIsAddNewDeviceDialogOpen(true);
  };

  return (
    <RootStyled>
      <ActionPlate
        iconSrc={IconGoogle}
        caption={t(
          backupStore.latestBackup
            ? 'SETTINGS.ITEMS.CREATE_A_KEY_BACKUP.TITLE_BACKUP'
            : 'SETTINGS.ITEMS.CREATE_A_KEY_BACKUP.TITLE_NO_BACKUP',
        )}
        description={t('SETTINGS.ITEMS.CREATE_A_KEY_BACKUP.DESCRIPTION')}
        onClick={() => {
          setIsBackupDialogOpen(true);
        }}
      />

      <ActionPlate
        iconSrc={IconRecoverWallet}
        isLoading={backupStore.isRecoverInProgress}
        caption={t('SETTINGS.ITEMS.RECOVER_WALLET.TITLE')}
        description={t('SETTINGS.ITEMS.RECOVER_WALLET.DESCRIPTION')}
        onClick={() => {
          setIsRecoverWalletDialogOpen(true);
        }}
      />

      {assetsStore.myBaseAssets.length > 0 && (
        <ActionPlate
          iconSrc={IconKey}
          isLoading={fireblocksSDKStore.isKeysExportInProcess}
          caption={t('SETTINGS.ITEMS.EXPORT_PRIVATE_KEY.TITLE')}
          description={t('SETTINGS.ITEMS.EXPORT_PRIVATE_KEY.DESCRIPTION')}
          onClick={() => {
            fireblocksSDKStore
              .takeover()
              .then(() => {
                setIsExportPrivateKeysDialogOpen(true);
              })
              .catch(() => {
                enqueueSnackbar(t('SETTINGS.DIALOGS.EXPORT_PRIVATE_KEYS.ERROR_MESSAGE'), { variant: 'error' });
              });
          }}
        />
      )}

      {/* <ActionPlate
        iconSrc={IconNewDevice}
        caption={t('SETTINGS.ITEMS.ADD_NEW_DEVICE.TITLE')}
        description={t('SETTINGS.ITEMS.ADD_NEW_DEVICE.DESCRIPTION')}
        onClick={() => {}}
      /> */}

      <ActionPlate
        iconSrc={IconLogs}
        caption={t('SETTINGS.ITEMS.SHARE_LOGS.TITLE')}
        description={t('SETTINGS.ITEMS.SHARE_LOGS.DESCRIPTION')}
        onClick={() => {
          setIsLogsDialogOpen(true);
        }}
      />

      <ActionPlate
        iconSrc={IconInfo}
        caption={t('SETTINGS.ITEMS.ADVANCED_INFO.TITLE')}
        description={t('SETTINGS.ITEMS.ADVANCED_INFO.DESCRIPTION')}
        onClick={() => {
          setIsAdvancedInfoDialogOpen(true);
        }}
      />

      <ActionPlate
        iconSrc={IconWallet}
        caption={t('SETTINGS.ITEMS.APPROVE_JOIN_DEVICE.TITLE')}
        description={t('SETTINGS.ITEMS.APPROVE_JOIN_DEVICE.DESCRIPTION')}
        onClick={() => {
          void approveJoinWallet();
        }}
      />

      <AdvancedInfoDialog
        isOpen={isAdvancedInfoDialogOpen}
        onClose={() => {
          setIsAdvancedInfoDialogOpen(false);
        }}
      />

      <LogsDialog
        isOpen={isLogsDialogOpen}
        onClose={() => {
          setIsLogsDialogOpen(false);
        }}
      />

      <BackupDialog
        isOpen={isBackupDialogOpen}
        onClose={() => {
          setIsBackupDialogOpen(false);
        }}
      />

      <ExportPrivateKeysDialog
        isOpen={isExportPrivateKeysDialogOpen}
        onClose={() => {
          setIsExportPrivateKeysDialogOpen(false);
        }}
      />

      <AddNewDeviceDialog
        isOpen={isAddNewDeviceDialogOpen}
        onClose={() => {
          setIsAddNewDeviceDialogOpen(false);
        }}
      />

      <RecoverWalletDialog
        isOpen={isRecoverWalletDialogOpen}
        onClose={() => {
          setIsRecoverWalletDialogOpen(false);
        }}
      />
    </RootStyled>
  );
});
