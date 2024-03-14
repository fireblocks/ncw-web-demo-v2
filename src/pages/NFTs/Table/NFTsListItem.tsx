import React from 'react';
import { TableRow, TableTextCell, TableTitleCell, styled } from '@foundation';
import { NFTTokenStore } from '@store';
import { observer } from 'mobx-react';

export const RowStyled = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '1.3fr 1fr 1fr 1fr 1fr',
}));

interface IProps {
  index: number;
  style: React.CSSProperties;
  filteredTokens: NFTTokenStore[];
}

export const NFTsListItem: React.FC<IProps> = observer(function NFTsListItem({ filteredTokens, index, style }) {
  const token = filteredTokens[index];

  const date = new Date(token.ownershipStartTime).toLocaleString();

  return (
    <div key={token.blockchainDescriptor} style={style}>
      <TableRow>
        <RowStyled>
          <TableTitleCell
            title={token.name}
            subtitle={token.blockchainDescriptor}
            iconUrl={token.imageUrl || undefined}
          />
          <TableTextCell text={token.collectionName} />
          <TableTextCell text={date} />
          <TableTextCell text={token.standard} />
          <TableTextCell text={token.tokenId} />
        </RowStyled>
      </TableRow>
    </div>
  );
});
