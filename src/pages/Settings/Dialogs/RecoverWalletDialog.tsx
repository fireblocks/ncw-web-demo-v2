import React, { useState } from 'react';
import { Dialog, Progress, Typography, styled } from '@foundation';
import IconCloseIcon from '@icons/close-icon.svg';
import IconVSign from '@icons/v-sign.svg';
import { Button } from '@mui/material';
import { useAuthStore, useBackupStore } from '@store';
import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

const RootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(7, 5),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}));

const TextContainerStyled = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(6), // 48px
  textAlign: 'left',
}));

const IconContainerStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  marginBottom: theme.spacing(3.75), // 30px
}));

const CenteredTextContainerStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  marginBottom: theme.spacing(3), // 24px for error state
}));

const RecoverButtonStyled = styled(Button)(({ theme }) => ({
  backgroundColor: '#0075F2',
  color: 'white',
  '&:hover': {
    backgroundColor: '#0062CC',
  },
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  fontSize: theme.typography.body2.fontSize,
  lineHeight: theme.typography.body2.lineHeight,
  letterSpacing: theme.typography.body2.letterSpacing,
  textTransform: 'capitalize',
}));

const CancelButtonStyled = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  fontSize: theme.typography.body2.fontSize,
  lineHeight: theme.typography.body2.lineHeight,
  letterSpacing: theme.typography.body2.letterSpacing,
  textTransform: 'capitalize',
}));

const ButtonContainerStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  width: '100%',
  gap: theme.spacing(2),
}));

type RecoveryPhase = 'initial' | 'loading' | 'success' | 'error';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecoverWalletDialog: React.FC<IProps> = observer(function RecoverWalletDialog({ isOpen, onClose }) {
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const backupStore = useBackupStore();
  const { enqueueSnackbar } = useSnackbar();
  const [recoveryPhase, setRecoveryPhase] = useState<RecoveryPhase>('initial');

  const handleRecoverWallet = () => {
    setRecoveryPhase('loading');
    authStore
      .recoverMPCKeys('GoogleDrive', true)
      .then(() => {
        setRecoveryPhase('success');
        enqueueSnackbar(t('LOGIN.RECOVERY_FROM_BACKUP'), { variant: 'success' });
      })
      .catch(() => {
        setRecoveryPhase('error');
        enqueueSnackbar(t('LOGIN.RECOVERY_FROM_BACKUP_ERROR'), { variant: 'error' });
      });
  };

  const handleTryAgain = () => {
    setRecoveryPhase('initial');
  };

  const renderDialogContent = () => {
    switch (recoveryPhase) {
      case 'loading':
        return (
          <RootStyled>
            <IconContainerStyled>
              <Progress size="medium" />
            </IconContainerStyled>
          </RootStyled>
        );
      case 'success':
        return (
          <RootStyled>
            <IconContainerStyled>
              <img src={IconVSign} alt="success" width="48px" height="48px" />
            </IconContainerStyled>
            <CenteredTextContainerStyled>
              <Typography variant="body1" color="text.primary" align="center">
                Your wallet was recovered from Google Drive
              </Typography>
            </CenteredTextContainerStyled>
          </RootStyled>
        );
      case 'error':
        return (
          <RootStyled>
            <IconContainerStyled>
              <img src={IconCloseIcon} alt="error" width="48px" height="48px" />
            </IconContainerStyled>
            <CenteredTextContainerStyled>
              <Typography variant="body1" color="text.primary" align="center">
                We couldn't recover your wallet
              </Typography>
            </CenteredTextContainerStyled>
            <ButtonContainerStyled>
              <RecoverButtonStyled onClick={handleTryAgain}>Try again</RecoverButtonStyled>
            </ButtonContainerStyled>
          </RootStyled>
        );
      default:
        return null;
    }
  };

  const handleClose = () => {
    setRecoveryPhase('initial');
    onClose();
  };

  return (
    <Dialog title="Recover wallet" isOpen={isOpen} onClose={handleClose} size="medium">
      {recoveryPhase === 'initial' ? (
        <RootStyled>
          <TextContainerStyled>
            <Typography variant="body1" color="text.primary">
              Restore a wallet backed up on your Google Drive.
            </Typography>
          </TextContainerStyled>
          <ButtonContainerStyled>
            <CancelButtonStyled onClick={handleClose}>Cancel</CancelButtonStyled>
            <RecoverButtonStyled onClick={handleRecoverWallet}>Recover wallet</RecoverButtonStyled>
          </ButtonContainerStyled>
        </RootStyled>
      ) : (
        renderDialogContent() || <></>
      )}
    </Dialog>
  );
});
