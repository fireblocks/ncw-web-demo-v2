import React from 'react';
import { Dialog, Typography, styled } from '@foundation';
import { useUserStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

const RootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(8, 0),
  width: '80%',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RestartWalletDialog: React.FC<IProps> = observer(function RestartWalletDialog({ isOpen, onClose }) {
  const { t } = useTranslation();
  const userStore = useUserStore();

  const handleDialogClose = () => {
    onClose();
  };

  const onRestartClick = () => {
    userStore.restartWallet();
    window.location.reload();
  };

  return (
    <Dialog
      actionCaption={t('USER_MENU.RESTART_WALLET.DIALOG.RESTART')}
      cancelCaption={t('USER_MENU.RESTART_WALLET.DIALOG.CANCEL')}
      doAction={onRestartClick}
      title={t('USER_MENU.RESTART_WALLET.DIALOG.TITLE')}
      isOpen={isOpen}
      onClose={handleDialogClose}
      size="small"
    >
      <RootStyled>
        <Typography variant="body2">{t('USER_MENU.RESTART_WALLET.DIALOG.TEXT')}</Typography>
      </RootStyled>
    </Dialog>
  );
});
