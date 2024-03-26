import React from 'react';
import { Dialog, styled } from '@foundation';
import IconDelete from '@icons/delete_logs.svg';
import IconDownload from '@icons/download_logs.svg';
import { useFireblocksSDKStore } from '@store';
import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
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

export const LogsDialog: React.FC<IProps> = observer(function LogsDialog({ isOpen, onClose }) {
  const { t } = useTranslation();
  const fireblocksSDKStore = useFireblocksSDKStore();
  const { enqueueSnackbar } = useSnackbar();

  const onDownloadLogs = () => {
    fireblocksSDKStore
      .collectLogs()
      .then((logs) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(new Blob([logs], { type: 'text/plain' }));
        downloadLink.download = `${Date.now()}_ncw-sdk-logs.log`;
        downloadLink.click();
        enqueueSnackbar(t('SETTINGS.DIALOGS.LOGS.DOWNLOADED'), { variant: 'success' });
      })
      .catch(() => {});
  };

  const onDeleteLogs = () => {
    fireblocksSDKStore
      .clearLogs()
      .then(() => {
        enqueueSnackbar(t('SETTINGS.DIALOGS.LOGS.DELETED'), { variant: 'success' });
      })
      .catch(() => {});
  };

  return (
    <Dialog
      title={t('SETTINGS.DIALOGS.LOGS.TITLE')}
      description={t('SETTINGS.DIALOGS.LOGS.DESCRIPTION')}
      isOpen={isOpen}
      onClose={onClose}
      size="large"
    >
      <RootStyled>
        <ActionPlate iconSrc={IconDownload} caption={t('SETTINGS.DIALOGS.LOGS.DOWNLOAD')} onClick={onDownloadLogs} />
        <ActionPlate iconSrc={IconDelete} caption={t('SETTINGS.DIALOGS.LOGS.DELETE')} onClick={onDeleteLogs} />
      </RootStyled>
    </Dialog>
  );
});
