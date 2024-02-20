import { styled } from '@foundation';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { SettingsItem } from './SettingsItem';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gridTemplateRows: '357px 357px 357px',
  columnGap: '2px',
  rowGap: '2px',
  marginTop: theme.spacing(8),
}));

export const SettingsItems: React.FC = observer(function SettingsItems() {
  const { t } = useTranslation();

  return (
    <RootStyled>
      <SettingsItem
        title={t('SETTINGS.ITEMS.CREATE_A_KEY_BACKUP.TITLE')}
        description={t('SETTINGS.ITEMS.CREATE_A_KEY_BACKUP.DESCRIPTION')}
      />
      <SettingsItem
        title={t('SETTINGS.ITEMS.RECOVER_WALLET.TITLE')}
        description={t('SETTINGS.ITEMS.RECOVER_WALLET.DESCRIPTION')}
      />
      <SettingsItem
        title={t('SETTINGS.ITEMS.EXPORT_PRIVATE_KEY.TITLE')}
        description={t('SETTINGS.ITEMS.EXPORT_PRIVATE_KEY.DESCRIPTION')}
      />
      <SettingsItem
        title={t('SETTINGS.ITEMS.ADVANCED_INFO.TITLE')}
        description={t('SETTINGS.ITEMS.ADVANCED_INFO.DESCRIPTION')}
      />
      <SettingsItem
        title={t('SETTINGS.ITEMS.ADD_NEW_DEVICE.TITLE')}
        description={t('SETTINGS.ITEMS.ADD_NEW_DEVICE.DESCRIPTION')}
      />
      <SettingsItem
        title={t('SETTINGS.ITEMS.SHARE_LOGS.TITLE')}
        description={t('SETTINGS.ITEMS.SHARE_LOGS.DESCRIPTION')}
      />
    </RootStyled>
  );
});
