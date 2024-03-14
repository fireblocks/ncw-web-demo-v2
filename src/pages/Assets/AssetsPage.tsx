import React from 'react';
import { Skeleton, Table, Typography, styled } from '@foundation';
import { useAssetsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { AmountsStyled, HeadingAmount } from '../common/HeadingAmount';
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

  if (assetsStore.isLoading && !assetsStore.myAssetsSortedByBalanceInUSD.length) {
    return (
      <Table>
        <Skeleton mode="TABLE" />
      </Table>
    );
  }

  return (
    <RootStyled>
      <HeadingStyled>
        <Typography variant="h5" color="text.primary">
          {t('ASSETS.TITLE')}
        </Typography>
        <AmountsStyled>
          <HeadingAmount
            title={t('ASSETS.CURRENT_BALANCE')}
            titleColor="text.secondary"
            value={assetsStore.isLoading ? t('ASSETS.REFRESHING_BALANCES') : assetsStore.totalAvailableBalanceInUSD}
          />
        </AmountsStyled>
      </HeadingStyled>
      <AssetsList />
    </RootStyled>
  );
});
