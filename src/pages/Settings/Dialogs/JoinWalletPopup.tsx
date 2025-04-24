import React from 'react';
import { CopyText, Dialog, Typography, styled } from '@foundation';
import { useAuthStore } from '@store';
import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';

const RootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(7, 5),
  display: 'flex',
  gap: theme.spacing(4),
  alignItems: 'center',
}));

const ParametersStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const ParameterStyled = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '150px 1fr',
}));

const IconWrapperStyled = styled('div')(({ theme }) => ({
  width: 104,
  height: 104,
  backgroundColor: theme.palette.secondary.main,
  borderRadius: 8,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const DriveStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  paddingTop: theme.spacing(0.5),
}));

const AlignerStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
}));

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinWalletDialog: React.FC<IProps> = observer(function JoinWalletDialog({ isOpen, onClose }) {
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();


  // const onDriveClick = () => {
  //   backupStore
  //     .saveKeysBackup('GoogleDrive')
  //     .then(() => {
  //       enqueueSnackbar(t('SETTINGS.DIALOGS.BACKUP.SUCCESS_MESSAGE'), { variant: 'success' });
  //       onClose();
  //     })
  //     .catch(() => {
  //       enqueueSnackbar(t('SETTINGS.DIALOGS.BACKUP.ERROR_MESSAGE'), { variant: 'error' });
  //     });
  // };

  return (
    <Dialog
      title={t('SETTINGS.DIALOGS.JOIN_WALLET.POPUP_TITLE')}
      description={t('SETTINGS.DIALOGS.JOIN_WALLET.POPUP_DESCRIPTION')}
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
    >
      <RootStyled>
        <IconWrapperStyled>
          <div style={{ background: 'white', padding: '16px' }}>
            <QRCode value={authStore.capturedRequestId} style={{ width: '80px', height: '80px' }} />
          </div>
        </IconWrapperStyled>
        <ParametersStyled>
          <ParameterStyled>
            <Typography variant="h6" color="text.secondary">
              {t('SETTINGS.DIALOGS.JOIN_WALLET.REQUEST_ID')}
            </Typography>
            <CopyText size="large" text={authStore.capturedRequestId} />
          </ParameterStyled>
        </ParametersStyled>
      </RootStyled>
    </Dialog>
  );
});
