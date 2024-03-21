import React from 'react';
import { LoadingPage, Typography, styled } from '@foundation';
import { useAssetsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { EmptyPage } from '../common/EmptyPage';
import { AmountsStyled, HeadingAmount } from '../common/HeadingAmount';
import { AddAssetDialog } from './AddAssetDialog/AddAssetDialog';
import { AssetsList } from './AssetsList';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
}));

const HeadingStyled = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(7),
  height: 204,
}));

export const AssetsPage: React.FC = observer(function AssetsPage() {
  const { t } = useTranslation();
  const assetsStore = useAssetsStore();
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = React.useState(false);

  localStorage.setItem('VISITED_PAGE', 'assets');

  if (assetsStore.isLoading) {
    return <LoadingPage />;
  }

  return (
    <RootStyled>
      {assetsStore.myAssetsSortedByBalanceInUSD.length === 0 && !assetsStore.isLoading ? (
        <EmptyPage
          page="ASSETS"
          onAddAsset={() => {
            setIsAddAssetDialogOpen(true);
          }}
        />
      ) : (
        <>
          <HeadingStyled>
            <Typography variant="h5" color="text.primary">
              {t('ASSETS.TITLE')}
            </Typography>
            <AmountsStyled>
              <HeadingAmount
                title={t('ASSETS.CURRENT_BALANCE')}
                titleColor="text.secondary"
                value={assetsStore.totalAvailableBalanceInUSD}
              />
            </AmountsStyled>
          </HeadingStyled>
          <AssetsList
            onAddAssetDialogOpen={() => {
              setIsAddAssetDialogOpen(true);
            }}
          />
        </>
      )}
      <AddAssetDialog
        isOpen={isAddAssetDialogOpen}
        onClose={() => {
          setIsAddAssetDialogOpen(false);
        }}
      />
    </RootStyled>
  );
});
