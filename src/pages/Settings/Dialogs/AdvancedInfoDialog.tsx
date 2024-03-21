import React from 'react';
import { CopyText, Dialog, Typography, styled } from '@foundation';
import { useDeviceStore, useFireblocksSDKStore, useUserStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

const DataBlockStyled = styled('div')(({ theme }) => ({
  borderTop: `2px solid ${theme.palette.secondary.main}`,
  padding: theme.spacing(3, 4),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvancedInfoDialog: React.FC<IProps> = observer(function AdvancedInfoDialog({ isOpen, onClose }) {
  const { t } = useTranslation();

  const userStore = useUserStore();
  const deviceStore = useDeviceStore();
  const fireblocksSDKStore = useFireblocksSDKStore();

  return (
    <Dialog
      title={t('SETTINGS.DIALOGS.ADVANCED_INFO.TITLE')}
      description={t('SETTINGS.DIALOGS.ADVANCED_INFO.DESCRIPTION')}
      isOpen={isOpen}
      onClose={onClose}
      size="small"
    >
      <DataBlockStyled>
        <Typography variant="h6" color="text.secondary">
          {t('SETTINGS.DIALOGS.ADVANCED_INFO.USER_NAME')}
        </Typography>
        <CopyText size="large" text={userStore.loggedUser?.displayName || ''} />
      </DataBlockStyled>

      <DataBlockStyled>
        <Typography variant="h6" color="text.secondary">
          {t('SETTINGS.DIALOGS.ADVANCED_INFO.USER_ID')}
        </Typography>
        <CopyText size="large" text={userStore.userId} />
      </DataBlockStyled>

      <DataBlockStyled>
        <Typography variant="h6" color="text.secondary">
          {t('SETTINGS.DIALOGS.ADVANCED_INFO.DEVICE_ID')}
        </Typography>
        <CopyText size="large" text={deviceStore.deviceId} />
      </DataBlockStyled>

      <DataBlockStyled>
        <Typography variant="h6" color="text.secondary">
          {t('SETTINGS.DIALOGS.ADVANCED_INFO.WALLET_ID')}
        </Typography>
        <CopyText size="large" text={deviceStore.walletId} />
      </DataBlockStyled>

      <>
        {fireblocksSDKStore.keysStatus?.MPC_CMP_ECDSA_SECP256K1?.keyId && (
          <DataBlockStyled>
            <Typography variant="h6" color="text.secondary">
              Key (MPC_CMP_ECDSA_SECP256K1)
            </Typography>
            <CopyText size="large" text={fireblocksSDKStore.keysStatus.MPC_CMP_ECDSA_SECP256K1.keyId} />
          </DataBlockStyled>
        )}

        {fireblocksSDKStore.keysStatus?.MPC_EDDSA_ED25519?.keyId && (
          <DataBlockStyled>
            <Typography variant="h6" color="text.secondary">
              Key (MPC_EDDSA_ED25519)
            </Typography>
            <CopyText size="large" text={fireblocksSDKStore.keysStatus.MPC_EDDSA_ED25519.keyId} />
          </DataBlockStyled>
        )}
      </>
    </Dialog>
  );
});
