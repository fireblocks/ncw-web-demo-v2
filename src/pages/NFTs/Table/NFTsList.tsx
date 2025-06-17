import React from 'react';
import { Table, TableBody, TableHead, TableHeaderCell, SortableTableHeaderCell, SortDirection } from '@foundation';
import { useNFTStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import { EmptySearch } from '../../common/EmptySearch';
import { RowStyled, NFTsListItem } from './NFTsListItem';

const TABLE_ROW_HEIGHT = 114;

interface IProps {
  query: string;
  selectedTokenId: string | null;
  setSelectedTokenId: (id: string | null) => void;
  onNewTransactionDialogOpen: () => void;
}

export const NFTsList: React.FC<IProps> = observer(function NFTsList({
  query,
  selectedTokenId,
  setSelectedTokenId,
  onNewTransactionDialogOpen,
}) {
  const NFTStore = useNFTStore();
  const { t } = useTranslation();

  const [sortField, setSortField] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null);

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

  // Filter tokens based on search query
  const filteredBySearch = NFTStore.tokens.filter(
    (token) =>
      (token.name?.toLowerCase() || '').includes(query.toLowerCase()) ||
      (token.tokenId?.toLowerCase() || '').includes(query.toLowerCase()),
  );

  // Sort tokens based on sort field and direction
  const filteredTokens = React.useMemo(() => {
    if (!sortField || !sortDirection) {
      return filteredBySearch;
    }

    return [...filteredBySearch].sort((a, b) => {
      if (sortField === 'date') {
        // Sort by ownership start time
        const timeA = a.ownershipStartTime || 0;
        const timeB = b.ownershipStartTime || 0;

        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      }

      return 0;
    });
  }, [filteredBySearch, sortField, sortDirection]);

  return (
    <Table>
      <TableHead>
        <RowStyled>
          <TableHeaderCell title={t('NFT.TABLE.HEADERS.NFT')} />
          <TableHeaderCell title={t('NFT.TABLE.HEADERS.AMOUNT')} />
          <TableHeaderCell title={t('NFT.TABLE.HEADERS.COLLECTION')} />
          <SortableTableHeaderCell
            title={t('NFT.TABLE.HEADERS.DATE')}
            sortField="date"
            currentSortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <TableHeaderCell title={t('NFT.TABLE.HEADERS.STANDARD')} />
          <TableHeaderCell title={t('NFT.TABLE.HEADERS.TOKEN_ID')} />
        </RowStyled>
      </TableHead>
      <TableBody>
        <AutoSizer>
          {({ height, width }) => {
            if (filteredTokens.length === 0) {
              return <EmptySearch height={height} width={width} />;
            }

            return (
              <FixedSizeList
                height={height}
                width={width}
                itemCount={filteredTokens.length}
                itemSize={TABLE_ROW_HEIGHT}
              >
                {({ index, style }) => (
                  <NFTsListItem
                    selectedTokenId={selectedTokenId}
                    setSelectedTokenId={setSelectedTokenId}
                    onNewTransactionDialogOpen={onNewTransactionDialogOpen}
                    filteredTokens={filteredTokens}
                    index={index}
                    style={style}
                  />
                )}
              </FixedSizeList>
            );
          }}
        </AutoSizer>
      </TableBody>
    </Table>
  );
});
