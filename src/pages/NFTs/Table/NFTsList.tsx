import React from 'react';
import { Table, TableBody, TableHead, TableHeaderCell } from '@foundation';
import { useNFTStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import { RowStyled, NFTsListItem } from './NFTsListItem';

const TABLE_ROW_HEIGHT = 106;

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

  const filteredTokens = NFTStore.tokens.filter(
    (t) => t.name.toLowerCase().includes(query.toLowerCase()) || t.tokenId.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Table>
      <TableHead>
        <RowStyled>
          <TableHeaderCell title={t('NFT.TABLE.HEADERS.NFT')} />
          <TableHeaderCell title={t('NFT.TABLE.HEADERS.COLLECTION')} />
          <TableHeaderCell title={t('NFT.TABLE.HEADERS.DATE')} />
          <TableHeaderCell title={t('NFT.TABLE.HEADERS.TOKEN_ID')} />
          <TableHeaderCell title={t('NFT.TABLE.HEADERS.STANDARD')} />
        </RowStyled>
      </TableHead>
      <TableBody>
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList height={height} width={width} itemCount={filteredTokens.length} itemSize={TABLE_ROW_HEIGHT}>
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
          )}
        </AutoSizer>
      </TableBody>
    </Table>
  );
});
