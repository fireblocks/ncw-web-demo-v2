import React from 'react';
import { useNFTStore } from '@store';
import { observer } from 'mobx-react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid } from 'react-window';
import { CARD_HEIGHT, CARD_WIDTH, NFTCard } from './NFTCard';
import { styled } from '@foundation';

const COLUMN_COUNT = 4;

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
}));

interface IProps {
  query: string;
}

export const NFTCards: React.FC<IProps> = observer(function NFTCards({ query }) {
  const NFTStore = useNFTStore();

  const filteredTokens = NFTStore.tokens.filter(
    (t) => t.name.toLowerCase().includes(query.toLowerCase()) || t.tokenId.toLowerCase().includes(query.toLowerCase()),
  );

  const columnsCount =
    filteredTokens.length < COLUMN_COUNT ? filteredTokens.length : Math.ceil(filteredTokens.length / COLUMN_COUNT);

  return (
    <RootStyled>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeGrid
            height={height}
            width={width}
            rowHeight={CARD_HEIGHT}
            columnCount={columnsCount}
            columnWidth={CARD_WIDTH}
            rowCount={Math.ceil(filteredTokens.length / COLUMN_COUNT)}
          >
            {({ columnIndex, rowIndex, style }) => (
              <NFTCard filteredTokens={filteredTokens} columnIndex={columnIndex} rowIndex={rowIndex} style={style} />
            )}
          </FixedSizeGrid>
        )}
      </AutoSizer>
    </RootStyled>
  );
});
