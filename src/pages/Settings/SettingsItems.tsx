import React from 'react';
import { styled } from '@foundation';
import IconInfo from '@icons/info.svg';
import IconKey from '@icons/key.svg';
import IconLogs from '@icons/share_logs.svg';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { ActionPlate } from './ActionPlate';
import { AdvancedInfoDialog } from './Dialogs/AdvancedInfoDialog';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gridTemplateRows: '360px 360px 360px',
  columnGap: '2px',
  rowGap: '2px',
  marginTop: theme.spacing(8),
}));

export const SettingsItems: React.FC = observer(function SettingsItems() {
  const { t } = useTranslation();
  const [isAdvancedInfoDialogOpen, setIsAdvancedInfoDialogOpen] = React.useState(false);

  return (
    <RootStyled>
      {/* <ActionPlate
        iconSrc={IconCloud}
        caption={t('SETTINGS.ITEMS.CREATE_A_KEY_BACKUP.TITLE')}
        description={t('SETTINGS.ITEMS.CREATE_A_KEY_BACKUP.DESCRIPTION')}
        onClick={() => {}}
      />

      <ActionPlate
        iconSrc={IconRecover}
        caption={t('SETTINGS.ITEMS.RECOVER_WALLET.TITLE')}
        description={t('SETTINGS.ITEMS.RECOVER_WALLET.DESCRIPTION')}
        onClick={() => {}}
      /> */}

      <ActionPlate
        iconSrc={IconKey}
        caption={t('SETTINGS.ITEMS.EXPORT_PRIVATE_KEY.TITLE')}
        description={t('SETTINGS.ITEMS.EXPORT_PRIVATE_KEY.DESCRIPTION')}
        onClick={() => {}}
      />

      {/* <ActionPlate
        iconSrc={IconNewDevice}
        caption={t('SETTINGS.ITEMS.ADD_NEW_DEVICE.TITLE')}
        description={t('SETTINGS.ITEMS.ADD_NEW_DEVICE.DESCRIPTION')}
        onClick={() => {}}
      /> */}

      <ActionPlate
        iconSrc={IconLogs}
        caption={t('SETTINGS.ITEMS.SHARE_LOGS.TITLE')}
        description={t('SETTINGS.ITEMS.SHARE_LOGS.DESCRIPTION')}
        onClick={() => {}}
      />

      <ActionPlate
        iconSrc={IconInfo}
        caption={t('SETTINGS.ITEMS.ADVANCED_INFO.TITLE')}
        description={t('SETTINGS.ITEMS.ADVANCED_INFO.DESCRIPTION')}
        onClick={() => {
          setIsAdvancedInfoDialogOpen(true);
        }}
      />

      <AdvancedInfoDialog
        isOpen={isAdvancedInfoDialogOpen}
        onClose={() => {
          setIsAdvancedInfoDialogOpen(false);
        }}
      />
    </RootStyled>
  );
});
