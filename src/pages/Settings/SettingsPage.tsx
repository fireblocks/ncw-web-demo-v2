import React from 'react';
import { Typography, styled } from '@foundation';
import { useBackupStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { SettingsItems } from './SettingsItems';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const PageHeadingStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(2, 0, 8, 0),
}));

export const SettingsPage: React.FC = observer(function SettingsPage() {
  const { t } = useTranslation();
  const backupStore = useBackupStore();

  React.useEffect(() => {
    const init = async () => {
      await backupStore.init();
    };

    init().catch(() => {});
  }, [backupStore]);

  return (
    <RootStyled>
      <PageHeadingStyled>
        <Typography variant="h5" color="text.primary">
          {t('SETTINGS.NAME')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('SETTINGS.DESCRIPTION')}
        </Typography>
      </PageHeadingStyled>
      <SettingsItems />
    </RootStyled>
  );
});
