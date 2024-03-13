import React from 'react';
import { TNewTransactionMode } from '@api';
import { ActionButton, IconButton, SearchInput, Table, TableBody, TableHead, TableHeaderCell } from '@foundation';
import IconRefresh from '@icons/refresh.svg';
import { AssetStore, useAssetsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import { ActionsBoxWrapperStyled, ActionsWrapperStyled, SearchWrapperStyled } from '../common/ActionsBox';
import { AddAssetDialog } from './AddAssetDialog/AddAssetDialog';
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

  const [query, setQuery] = React.useState('');

  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = React.useState(false);

  const onAddAssetDialogOpen = () => {
    setIsAddAssetDialogOpen(true);
  };

  const onAddAssetDialogClose = () => {
    setIsAddAssetDialogOpen(false);
  };

  const filteredAssets = assetsStore.myAssetsSortedByBalanceInUSD.filter(
    (a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.symbol.toLowerCase().includes(query.toLowerCase()),
  );

  const onNewTransactionDialogOpen = () => {
    setIsNewTransactionDialogOpen(true);
    if (selectedAssetId) {
      setSelectedAssetStore(assetsStore.getAssetById(selectedAssetId));
    }
  };

  const onNewTransactionDialogClose = () => {
    setIsNewTransactionDialogOpen(false);
  };

  return (
    <>
      <ActionsBoxWrapperStyled>
        <SearchWrapperStyled>
          <SearchInput query={query} setQuery={setQuery} placeholder={t('ASSETS.ADD_DIALOG.SEARCH')} />
        </SearchWrapperStyled>
        <ActionsWrapperStyled>
          <ActionButton onClick={onAddAssetDialogOpen} caption={t('ASSETS.ADD_ASSET')} />
          <IconButton
            disabled={assetsStore.isLoading}
            tooltip={t('ASSETS.REFRESH_BALANCES')}
            onClick={() => {
              assetsStore.refreshBalances();
            }}
          >
            <img src={IconRefresh} />
          </IconButton>
        </ActionsWrapperStyled>
      </ActionsBoxWrapperStyled>
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
                itemCount={filteredAssets.length}
                itemSize={TABLE_ROW_HEIGHT}
              >
                {({ index, style }) => (
                  <AssetsListItem
                    filteredAssets={filteredAssets}
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

      <AddAssetDialog isOpen={isAddAssetDialogOpen} onClose={onAddAssetDialogClose} />
    </>
  );
});
