import React from 'react';
import { Dialog, Progress, Typography, styled } from '@foundation';
import IconBackup from '@icons/backup_large.svg';
import IconGoogle from '@icons/google.svg';
import IconKey from '@icons/key.svg';
import { useBackupStore } from '@store';
import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

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

export const BackupDialog: React.FC<IProps> = observer(function BackupDialog({ isOpen, onClose }) {
  const { t } = useTranslation();
  const backupStore = useBackupStore();
  const { enqueueSnackbar } = useSnackbar();

  const onDriveClick = () => {
    backupStore
      .saveKeysBackup('GoogleDrive')
      .then(() => {
        enqueueSnackbar(t('SETTINGS.DIALOGS.BACKUP.SUCCESS_MESSAGE'), { variant: 'success' });
        onClose();
      })
      .catch((e: any) => {
        console.error('Backup Error: ', e);
        enqueueSnackbar(t('SETTINGS.DIALOGS.BACKUP.ERROR_MESSAGE'), { variant: 'error' });
      });
  };

  return (
    <Dialog
      title={
        backupStore.latestBackup
          ? t('SETTINGS.DIALOGS.BACKUP.UPDATE_KEY_BACKUP')
          : t('SETTINGS.DIALOGS.BACKUP.CREATE_KEY_BACKUP')
      }
      description={t('SETTINGS.DIALOGS.BACKUP.DESCRIPTION')}
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
      doAction={onDriveClick}
      actionCaption={
        backupStore.latestBackup
          ? t('SETTINGS.DIALOGS.BACKUP.UPDATE_KEY_BACKUP')
          : t('SETTINGS.DIALOGS.BACKUP.CREATE_KEY_BACKUP')
      }
      cancelCaption={t('SETTINGS.DIALOGS.BACKUP.CANCEL')}
    >
      <RootStyled>
        <IconWrapperStyled>
          {backupStore.isBackupInProgress ? (
            <Progress size="medium" />
          ) : (
            <img src={backupStore.latestBackup ? IconKey : IconBackup} alt="backup" width="44px" height="44px" />
          )}
        </IconWrapperStyled>
        {backupStore.latestBackup ? (
          <ParametersStyled>
            <ParameterStyled>
              <Typography variant="h6" color="text.secondary">
                {t('SETTINGS.DIALOGS.BACKUP.CREATED_AT')}
              </Typography>
              <Typography variant="h6" color="text.primary">
                {new Date(backupStore.latestBackup.createdAt).toLocaleString()}
              </Typography>
            </ParameterStyled>

            <ParameterStyled>
              <Typography variant="h6" color="text.secondary">
                {t('SETTINGS.DIALOGS.BACKUP.LOCATION')}
              </Typography>
              <Typography variant="h6" color="text.primary">
                <AlignerStyled>
                  <img src={IconGoogle} alt="google" /> {backupStore.latestBackup.location}
                </AlignerStyled>
              </Typography>
            </ParameterStyled>

            <ParameterStyled>
              <Typography variant="h6" color="text.secondary">
                {t('SETTINGS.DIALOGS.BACKUP.PASSPHRASE_ID')}
              </Typography>
              <Typography variant="h6" color="text.primary">
                {backupStore.latestBackup.passphraseId}
              </Typography>
            </ParameterStyled>
          </ParametersStyled>
        ) : (
          <div>
            <Typography variant="h4" color="text.primary">
              {t('SETTINGS.DIALOGS.BACKUP.CREATE_YOUR_FIRST_BACKUP_WITH')}
            </Typography>
            <DriveStyled>
              <img src={IconGoogle} alt="google" />
              <Typography variant="h4" color="text.primary">
                Google Drive
              </Typography>
            </DriveStyled>
          </div>
        )}
      </RootStyled>
    </Dialog>
  );
});
