import React from 'react';
import { TableRow, TableTextCell, TableTitleCell, TableTransferCell, styled } from '@foundation';
import { NFTTokenStore } from '@store';
import { observer } from 'mobx-react';

export const RowStyled = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '1.3fr 1.2fr 1fr 1fr 0.5fr',
}));

interface IProps {
  index: number;
  style: React.CSSProperties;
  filteredTokens: NFTTokenStore[];
  selectedTokenId: string | null;
  setSelectedTokenId: (id: string | null) => void;
  onNewTransactionDialogOpen: () => void;
}

export const NFTsListItem: React.FC<IProps> = observer(function NFTsListItem({
  filteredTokens,
  selectedTokenId,
  setSelectedTokenId,
  onNewTransactionDialogOpen,
  index,
  style,
}) {
  const token = filteredTokens[index];

  const date = new Date(token.ownershipStartTime).toLocaleString();

  return (
    <div
      key={token.blockchainDescriptor}
      style={style}
      onMouseEnter={() => {
        setSelectedTokenId(token.id);
      }}
      onMouseLeave={() => {
        setSelectedTokenId(null);
      }}
    >
      <TableRow>
        <RowStyled>
          <TableTitleCell
            title={token.name}
            subtitle={token.blockchainDescriptor}
            iconUrl={token.imageUrl || undefined}
          />
          <TableTextCell text={token.collectionName} />
          <TableTextCell text={date} />
          <TableTextCell text={token.tokenId} />
          {selectedTokenId === token.id ? (
            <TableTransferCell
              onSend={() => {
                onNewTransactionDialogOpen();
              }}
              totalBalance={1}
            />
          ) : (
            <TableTextCell text={token.standard} />
          )}
        </RowStyled>
      </TableRow>
    </div>
  );
});
