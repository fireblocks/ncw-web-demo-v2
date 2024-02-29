import React from 'react';
import { ActionButton, ContentSection, IconButton, Typography, styled } from '@foundation';
import IconRefresh from '@icons/refresh.svg';
import { useAssetsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { AddAssetDialog } from './AddAssetDialog';
import { AssetsList } from './AssetsList';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
}));

const ActionsWrapperStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '100%',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
}));

const BalanceStyled = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const HeadingStyled = styled('div')(({ theme }) => ({
  margin: theme.spacing(5, 0, 8, 0),
}));

export const AssetsPage: React.FC = observer(function AssetsPage() {
  const { t } = useTranslation();
  const assetsStore = useAssetsStore();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const onDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const onDialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <RootStyled>
      <HeadingStyled>
        <Typography variant="h5" color="text.primary">
          {t('ASSETS.TITLE')}
        </Typography>
        <BalanceStyled>
          <Typography variant="h6" color="text.secondary">
            {t('ASSETS.CURRENT_BALANCE')}
          </Typography>
          <Typography variant="h1" color="text.primary">
            $45,873.03
          </Typography>
        </BalanceStyled>
      </HeadingStyled>
      <ContentSection>
        <ActionsWrapperStyled>
          <ActionButton onClick={onDialogOpen} caption={t('ASSETS.ADD_ASSET')} />
          <IconButton
            onClick={() => {
              assetsStore.refreshBalances();
            }}
          >
            <img src={IconRefresh} />
          </IconButton>
        </ActionsWrapperStyled>
      </ContentSection>
      <AssetsList />
      <AddAssetDialog isOpen={isDialogOpen} onClose={onDialogClose} />
    </RootStyled>
  );
});
