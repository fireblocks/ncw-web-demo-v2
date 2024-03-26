import { Typography, styled } from '@foundation';
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
