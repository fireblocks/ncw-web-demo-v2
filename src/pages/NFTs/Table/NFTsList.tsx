import React from 'react';
import { Table, TableBody, TableHead, TableHeaderCell } from '@foundation';
import { useNFTStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import { RowStyled, NFTsListItem } from './NFTsListItem';

const TABLE_ROW_HEIGHT = 106;

export const NFTsList: React.FC = observer(function NFTsList() {
  const NFTStore = useNFTStore();
  const { t } = useTranslation();

  return (
    <Table>
      <TableHead>
        <RowStyled>
          <TableHeaderCell title={t('NFT.TABLE.HEADERS.NFT')} />
          <TableHeaderCell title={t('NFT.TABLE.HEADERS.COLLECTION')} />
          <TableHeaderCell title={t('NFT.TABLE.HEADERS.DATE')} />
          <TableHeaderCell title={t('NFT.TABLE.HEADERS.STANDARD')} />
          <TableHeaderCell title={t('NFT.TABLE.HEADERS.TOKEN_ID')} />
        </RowStyled>
      </TableHead>
      <TableBody>
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList height={height} width={width} itemCount={NFTStore.tokens.length} itemSize={TABLE_ROW_HEIGHT}>
              {({ index, style }) => <NFTsListItem index={index} style={style} />}
            </FixedSizeList>
          )}
        </AutoSizer>
      </TableBody>
    </Table>
  );
});
