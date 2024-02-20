import { Typography, styled } from '@foundation';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { SettingsItems } from './SettingsItems';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

export const SettingsPage: React.FC = observer(function SettingsPage() {
  const { t } = useTranslation();

  return (
    <RootStyled>
      <Typography variant="h3" color="text.primary">
        {t('PAGE_NAME.SETTINGS')}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {t('SETTINGS.DESCRIPTION')}
      </Typography>
      <SettingsItems />
    </RootStyled>
  );
});
