import { Typography, styled } from '@foundation';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

export const AssetsPage: React.FC = observer(function AssetsPage() {
  const { t } = useTranslation();

  return (
    <RootStyled>
      <Typography variant="h4" color="text.primary">
        {t('ASSETS.TITLE')}
      </Typography>
      <div>
        <Typography variant="h5" color="text.primary">
          {t('ASSETS.CURRENT_BALANCE')}
        </Typography>
        <Typography variant="h1" color="text.primary">
          $45,873.03
        </Typography>
      </div>
    </RootStyled>
  );
});
