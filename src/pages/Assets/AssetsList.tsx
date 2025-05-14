import React from 'react';
import { TNewTransactionMode } from '@api';
import {
  ActionButton,
  IconButton,
  Progress,
  SearchInput,
  SortableTableHeaderCell,
  SortDirection,
  Table,
  TableBody,
  TableHead,
  TableHeaderCell,
} from '@foundation';
import IconRefresh from '@icons/refresh.svg';
import { AssetStore, useAssetsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import { ActionsBoxWrapperStyled, ActionsWrapperStyled, SearchWrapperStyled } from '../common/ActionsBox';
import { EmptySearch } from '../common/EmptySearch';
import { AssetsListItem, RowStyled } from './AssetsListItem';
import { NewTransactionDialog } from './NewTransactionDialog/NewTransactionDialog';

const TABLE_ROW_HEIGHT = 114;

interface IProps {
  onAddAssetDialogOpen: () => void;
}

export const AssetsList: React.FC<IProps> = observer(function AssetsList({ onAddAssetDialogOpen }) {
  const assetsStore = useAssetsStore();
  const { t } = useTranslation();

  const [selectedAssetId, setSelectedAssetId] = React.useState<string | null>(null);
  const [selectedAssetStore, setSelectedAssetStore] = React.useState<AssetStore | undefined>(undefined);

  const [transactionDialogMode, setTransactionDialogMode] = React.useState<TNewTransactionMode>(null);

  const [query, setQuery] = React.useState('');

  const [isNewTransactionDialogOpen, setIsNewTransactionDialogOpen] = React.useState(false);

  const [sortField, setSortField] = React.useState<string | null>('marketCap');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter assets based on search query
  const filteredBySearch = assetsStore.myAssetsSortedByBalanceInUSD.filter(
    (a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.symbol.toLowerCase().includes(query.toLowerCase()),
  );

  // Sort assets based on sort field and direction
  const filteredAssets = React.useMemo(() => {
    if (!sortField) {
      return filteredBySearch;
    }

    return [...filteredBySearch].sort((a, b) => {
      if (sortField === 'balance') {
        // Sort by total balance
        const balanceA = a.totalBalance;
        const balanceB = b.totalBalance;

        return sortDirection === 'asc' ? balanceA - balanceB : balanceB - balanceA;
      } else if (sortField === 'price') {
        // Sort by price (rate)
        const rateA = a.assetData?.rate || 0;
        const rateB = b.assetData?.rate || 0;

        return sortDirection === 'asc' ? rateA - rateB : rateB - rateA;
      } else if (sortField === 'change24h') {
        // Generate change24h values for comparison
        const getChange24h = (asset: AssetStore) => {
          const seed = parseInt(asset.id.replace(/\D/g, '') || '0', 10);
          const random = Math.abs(Math.sin(seed) * 10000);
          return (random % 25) - 5; // Range from -5 to 20
        };

        const change24hA = getChange24h(a);
        const change24hB = getChange24h(b);

        return sortDirection === 'asc' ? change24hA - change24hB : change24hB - change24hA;
      } else if (sortField === 'marketCap') {
        // Generate market cap values for comparison
        const getMarketCap = (asset: AssetStore) => {
          const seed = parseInt(asset.id.replace(/\D/g, '') || '0', 10) + 1000;
          const randomBillions = (Math.abs(Math.sin(seed) * 10000) % 2000) + 1;
          return randomBillions * 1000000000;
        };

        const marketCapA = getMarketCap(a);
        const marketCapB = getMarketCap(b);

        return sortDirection === 'asc' ? marketCapA - marketCapB : marketCapB - marketCapA;
      } else if (sortField === 'volume24h') {
        // Generate 24H volume values for comparison
        const getVolume24h = (asset: AssetStore) => {
          const seed = parseInt(asset.id.replace(/\D/g, '') || '0', 10) + 2000;
          const randomMillions = (Math.abs(Math.sin(seed) * 10000) % 1000) + 1;
          return randomMillions * 1000000;
        };

        const volume24hA = getVolume24h(a);
        const volume24hB = getVolume24h(b);

        return sortDirection === 'asc' ? volume24hA - volume24hB : volume24hB - volume24hA;
      }

      return 0;
    });
  }, [filteredBySearch, sortField, sortDirection]);

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
          <SearchInput
            query={query}
            setQuery={setQuery}
            placeholder={
              t('ASSETS.ADD_DIALOG.SEARCH') + (filteredAssets.length > 0 ? ' (' + `${filteredAssets.length}` + ')' : '')
            }
          />
        </SearchWrapperStyled>
        <ActionsWrapperStyled>
          <ActionButton onClick={onAddAssetDialogOpen} caption={t('ASSETS.ADD_ASSET')} />
          <IconButton
            disabled={assetsStore.isGettingBalances}
            tooltip={t('ASSETS.REFRESH_BALANCES')}
            onClick={() => {
              assetsStore.refreshBalances();
            }}
          >
            {assetsStore.isGettingBalances ? <Progress size="small" /> : <img src={IconRefresh} />}
          </IconButton>
        </ActionsWrapperStyled>
      </ActionsBoxWrapperStyled>
      <Table>
        <TableHead>
          <RowStyled>
            <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.CURRENCY')} />
            <SortableTableHeaderCell
              title={t('ASSETS.TABLE.HEADERS.BALANCE')}
              sortField="balance"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <SortableTableHeaderCell
              title={t('ASSETS.TABLE.HEADERS.PRICE')}
              sortField="price"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <SortableTableHeaderCell
              title={t('ASSETS.TABLE.HEADERS.CHANGE_24H')}
              sortField="change24h"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <SortableTableHeaderCell
              title={t('ASSETS.TABLE.HEADERS.MARKET_CAP')}
              sortField="marketCap"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <SortableTableHeaderCell
              title={t('ASSETS.TABLE.HEADERS.VOLUME_24H')}
              sortField="volume24h"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.ADDRESS')} />
            <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.BASE_ASSET')} />
          </RowStyled>
        </TableHead>
        <TableBody>
          <AutoSizer>
            {({ height, width }) => {
              if (filteredAssets.length === 0) {
                return <EmptySearch height={height} width={width} />;
              }

              return (
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
              );
            }}
          </AutoSizer>
        </TableBody>

        <NewTransactionDialog
          isOpen={isNewTransactionDialogOpen}
          onClose={onNewTransactionDialogClose}
          mode={transactionDialogMode}
          asset={selectedAssetStore}
        />
      </Table>
    </>
  );
});
