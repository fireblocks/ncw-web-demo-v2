import React from 'react';
import { TableRow, TableTextCell, TableTitleCell, TableTransferCell, styled } from '@foundation';
import IconNoNft from '@icons/no_nft_image.svg';
import { NFTTokenStore } from '@store';
import { observer } from 'mobx-react';

export const RowStyled = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1.3fr 1.2fr 1fr 1fr 0.5fr',
  columnGap: theme.spacing(2), // Add spacing between columns
  '& > *': {
    maxWidth: '100%', // Ensure each child has max width
    overflow: 'hidden', // Hide overflow
  },
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

  if (!token) {
    return null;
  }

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
            iconUrl={token.imageUrl || IconNoNft}
          />
          <TableTextCell text={token.collectionName} />
          <TableTextCell text={date} />
          <TableTextCell text={token.tokenId} />
          {selectedTokenId === token.id ? (
            <TableTransferCell
              onSend={() => {
                onNewTransactionDialogOpen();
              }}
            />
          ) : (
            <TableTextCell text={token.standard} />
          )}
        </RowStyled>
      </TableRow>
    </div>
  );
});
