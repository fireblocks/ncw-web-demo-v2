import React from 'react';
import { Dialog, styled } from '@foundation';
import IconApple from '@icons/apple.svg';
import IconGoogle from '@icons/google.svg';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { ActionPlate } from '../ActionPlate';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '2px',
  backgroundColor: theme.palette.secondary.main,
  alignItems: 'center',
}));

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupDialog: React.FC<IProps> = observer(function BackupDialog({ isOpen, onClose }) {
  const { t } = useTranslation();

  return (
    <Dialog
      title={t('SETTINGS.DIALOGS.BACKUP.TITLE')}
      description={t('SETTINGS.DIALOGS.BACKUP.DESCRIPTION')}
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
    >
      <RootStyled>
        <ActionPlate iconSrc={IconGoogle} caption={t('SETTINGS.DIALOGS.BACKUP.DRIVE')} onClick={() => {}} />
        <ActionPlate iconSrc={IconApple} caption={t('SETTINGS.DIALOGS.BACKUP.ICLOUD')} onClick={() => {}} />
      </RootStyled>
    </Dialog>
  );
});
