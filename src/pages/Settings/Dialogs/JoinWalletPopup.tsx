import React, { useEffect, useState } from 'react';
import { CopyText, Dialog, Typography, styled, LoadingPage } from '@foundation';
import { useAuthStore, useUserStore } from '@store';
import { encode } from 'js-base64';
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
  gridTemplateColumns: '100px 350px',
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

const CountdownContainerStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  justifyContent: 'center',
  border: '1px solid #ccc',
  padding: '3px',
  borderRadius: '5px',
  textAlign: 'center',
}));

const CountdownTimeStyled = styled('span')(() => ({
  color: 'forestgreen',
}));

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinWalletDialog: React.FC<IProps> = observer(function JoinWalletDialog({ isOpen, onClose }) {
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  const userStore = useUserStore();
  const [requestId, setRequestId] = React.useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes in seconds

  useEffect(() => {
    if (authStore.capturedRequestId && requestId !== authStore.capturedRequestId) {
      const encodedRequestId = encode(
        `{"email":"${userStore?.loggedUser?.email ?? 'not available'}","platform":"desktop","requestId":"${authStore.capturedRequestId}"}`,
      );
      setRequestId(encodedRequestId);
    }
  }, [authStore.capturedRequestId]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen) return;

    // Reset timer when dialog opens
    setTimeRemaining(180);

    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Auto-close the dialog when timer reaches zero
          onClose();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isOpen, onClose]);

  const cancelJoin = () => {
    // todo: cancel join
    authStore.stopJoinWallet();
    enqueueSnackbar(t('LOGIN.CANCEL_JOIN_WALLET'), { variant: 'success' });
    onClose();
  };

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
      onClose={cancelJoin}
      size="medium"
    >
      <RootStyled>
        {requestId?.length ? (
          <>
            <IconWrapperStyled>
              <div style={{ background: 'white', padding: '16px' }}>
                <QRCode value={requestId} style={{ width: '80px', height: '80px' }} />
              </div>
            </IconWrapperStyled>
            <ParametersStyled>
              <ParameterStyled>
                <Typography variant="h6" color="text.secondary" style={{ paddingTop: '3px' }}>
                  {t('SETTINGS.DIALOGS.JOIN_WALLET.REQUEST_ID')}
                </Typography>
                <CopyText size="large" text={requestId} />
              </ParameterStyled>
              <CountdownContainerStyled>
                <p>
                  You have <CountdownTimeStyled>{formatTime(timeRemaining)}</CountdownTimeStyled> minutes to join the
                  wallet.
                </p>
              </CountdownContainerStyled>
            </ParametersStyled>
          </>
        ) : (
          <LoadingPage />
        )}
      </RootStyled>
    </Dialog>
  );
});
