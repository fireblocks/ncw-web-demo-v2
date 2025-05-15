import React from 'react';
import { useTranslation } from 'react-i18next';
import IconCloud from '@icons/cloud.svg';
import { ActionPlate } from '../ActionPlate';
import { RootStyled, SkipButtonWrapperStyled, ButtonDarkStyledSpecial } from './styles';

interface BackupPhaseUIProps {
  isBackupInProgress: boolean;
  createBackup: () => void;
  continueWithoutBackup: () => void;
}

export const BackupPhaseUI: React.FC<BackupPhaseUIProps> = ({
  isBackupInProgress,
  createBackup,
  continueWithoutBackup,
}) => {
  const { t } = useTranslation();

  return (
    <RootStyled>
      <ActionPlate
        iconSrc={IconCloud}
        caption={t('Create key backup on your Google drive')}
        onClick={createBackup}
        isLoading={isBackupInProgress}
      />
      <SkipButtonWrapperStyled>
        <ButtonDarkStyledSpecial size="large" variant={'outlined'} onClick={continueWithoutBackup}>
          {t('Skip for now')}
        </ButtonDarkStyledSpecial>
      </SkipButtonWrapperStyled>
    </RootStyled>
  );
};
