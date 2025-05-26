import React from 'react';
import { styled } from '@foundation';
import { useNFTStore } from '@store';
import { observer } from 'mobx-react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid } from 'react-window';
import { EmptySearch } from '../../common/EmptySearch';
import { CARD_HEIGHT, CARD_WIDTH, COLUMN_COUNT, NFTCard } from './NFTCard';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  backgroundColor: theme.palette.primary.light,
}));

interface IProps {
  query: string;
  setSelectedTokenId: (id: string | null) => void;
  onNewTransactionDialogOpen: () => void;
}

export const NFTCards: React.FC<IProps> = observer(function NFTCards({
  query,
  setSelectedTokenId,
  onNewTransactionDialogOpen,
}) {
  const NFTStore = useNFTStore();

  const filteredTokens = NFTStore.tokens.filter(
    (t) =>
      (t.name?.toLowerCase() || '').includes(query.toLowerCase()) ||
      (t.tokenId?.toLowerCase() || '').includes(query.toLowerCase()),
  );

  const columnsCount = filteredTokens.length < COLUMN_COUNT ? filteredTokens.length : COLUMN_COUNT;

  return (
    <RootStyled>
      <AutoSizer>
        {({ height, width }) => {
          if (filteredTokens.length === 0) {
            return <EmptySearch height={height} width={width} />;
          }

          return (
            <FixedSizeGrid
              height={height}
              width={width}
              rowHeight={CARD_HEIGHT}
              columnCount={columnsCount}
              columnWidth={CARD_WIDTH}
              rowCount={Math.ceil(filteredTokens.length / COLUMN_COUNT)}
            >
              {({ columnIndex, rowIndex, style }) => (
                <NFTCard
                  setSelectedTokenId={setSelectedTokenId}
                  onNewTransactionDialogOpen={onNewTransactionDialogOpen}
                  filteredTokens={filteredTokens}
                  columnIndex={columnIndex}
                  rowIndex={rowIndex}
                  style={style}
                />
              )}
            </FixedSizeGrid>
          );
        }}
      </AutoSizer>
    </RootStyled>
  );
});
