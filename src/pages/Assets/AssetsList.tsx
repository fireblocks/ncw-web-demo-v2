import React from 'react';
import { TNewTransactionMode } from '@api';
import { Skeleton, Table, TableBody, TableHead, TableHeaderCell } from '@foundation';
import { AssetStore, useAssetsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import { AssetsListItem, RowStyled } from './AssetsListItem';
import { NewTransactionDialog } from './NewTransactionDialog/NewTransactionDialog';

const TABLE_ROW_HEIGHT = 106;

export const AssetsList: React.FC = observer(function AssetsList() {
  const assetsStore = useAssetsStore();
  const { t } = useTranslation();

  const [selectedAssetId, setSelectedAssetId] = React.useState<string | null>(null);
  const [selectedAssetStore, setSelectedAssetStore] = React.useState<AssetStore | undefined>(undefined);

  const [isNewTransactionDialogOpen, setIsNewTransactionDialogOpen] = React.useState(false);
  const [transactionDialogMode, setTransactionDialogMode] = React.useState<TNewTransactionMode>(null);

  const onNewTransactionDialogOpen = () => {
    setIsNewTransactionDialogOpen(true);
    if (selectedAssetId) {
      setSelectedAssetStore(assetsStore.getAssetById(selectedAssetId));
    }
  };

  const onNewTransactionDialogClose = () => {
    setIsNewTransactionDialogOpen(false);
  };

  if (assetsStore.isLoading && !assetsStore.myAssets.length) {
    return (
      <Table>
        <Skeleton mode="TABLE" />
      </Table>
    );
  }

  return (
    <Table>
      <TableHead>
        <RowStyled>
          <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.CURRENCY')} />
          <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.BALANCE')} />
          <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.PRICE')} />
          <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.ADDRESS')} />
          <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.BASE_ASSET')} />
        </RowStyled>
      </TableHead>
      <TableBody>
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList
              height={height}
              width={width}
              itemCount={assetsStore.myAssetsSortedByBalanceInUSD.length}
              itemSize={TABLE_ROW_HEIGHT}
            >
              {({ index, style }) => (
                <AssetsListItem
                  index={index}
                  style={style}
                  selectedAssetId={selectedAssetId}
                  setSelectedAssetId={setSelectedAssetId}
                  setTransactionDialogMode={setTransactionDialogMode}
                  onNewTransactionDialogOpen={onNewTransactionDialogOpen}
                />
              )}
            </FixedSizeList>
          )}
        </AutoSizer>
      </TableBody>

      <NewTransactionDialog
        isOpen={isNewTransactionDialogOpen}
        onClose={onNewTransactionDialogClose}
        mode={transactionDialogMode}
        asset={selectedAssetStore}
      />
    </Table>
  );
});
