import React from 'react';
import { Dialog, Typography, styled } from '@foundation';
import IconCloseIcon from '@icons/close-icon.svg';
import { Button } from '@mui/material';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

const RootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(7, 5),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}));

const IconContainerStyled = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  marginBottom: '15px',
}));

const CenteredTextContainerStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  marginBottom: theme.spacing(3), // 24px for error state
}));

const TryAgainButtonStyled = styled(Button)(({ theme }) => ({
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

const ButtonContainerStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  gap: theme.spacing(2),
}));

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onTryAgain: () => void;
}

export const ExportPrivateKeyErrorDialog: React.FC<IProps> = observer(function ExportPrivateKeyErrorDialog({
  isOpen,
  onClose,
  onTryAgain,
}) {
  const { t } = useTranslation();

  return (
    <Dialog title="Export private key" isOpen={isOpen} onClose={onClose} size="medium">
      <RootStyled>
        <IconContainerStyled>
          <img src={IconCloseIcon} alt="error" width="48px" height="48px" />
        </IconContainerStyled>
        <CenteredTextContainerStyled>
          <Typography variant="body1" color="text.primary" align="center" sx={{ fontSize: '18px' }}>
            We couldn't create a key backup
          </Typography>
        </CenteredTextContainerStyled>
        <ButtonContainerStyled>
          <TryAgainButtonStyled onClick={onTryAgain}>Try again</TryAgainButtonStyled>
        </ButtonContainerStyled>
      </RootStyled>
    </Dialog>
  );
});
