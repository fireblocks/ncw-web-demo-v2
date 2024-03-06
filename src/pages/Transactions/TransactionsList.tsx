import React from 'react';
import { Skeleton, Table, TableBody, TableHead, TableHeaderCell } from '@foundation';
import { useTransactionsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import { RowStyled, TransactionsListItem } from './TransactionsListItem';

const TABLE_ROW_HEIGHT = 106;

export const TransactionsList: React.FC = observer(function TransactionsList() {
  const transactionsStore = useTransactionsStore();
  const { t } = useTranslation();

  if (transactionsStore.transactions.length === 0) {
    return (
      <Table>
        <Skeleton mode="TABLE" />
      </Table>
    );
  }

  return (
    <Table>
      <TableHead>
        <RowStyled>
          <TableHeaderCell title={t('TRANSACTIONS.TABLE.HEADERS.ACTION')} />
          <TableHeaderCell title={t('TRANSACTIONS.TABLE.HEADERS.AMOUNT')} />
          <TableHeaderCell title={t('TRANSACTIONS.TABLE.HEADERS.FEE')} />
          <TableHeaderCell title={t('TRANSACTIONS.TABLE.HEADERS.STATUS')} />
          <TableHeaderCell title={t('TRANSACTIONS.TABLE.HEADERS.DATE')} />
          <TableHeaderCell title={t('TRANSACTIONS.TABLE.HEADERS.ADDRESS')} />
          <TableHeaderCell title="" />
        </RowStyled>
      </TableHead>
      <TableBody>
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList
              height={height}
              width={width}
              itemCount={transactionsStore.transactionsSortedByCreationDate.length}
              itemSize={TABLE_ROW_HEIGHT}
            >
              {({ index, style }) => <TransactionsListItem index={index} style={style} />}
            </FixedSizeList>
          )}
        </AutoSizer>
      </TableBody>
    </Table>
  );
});
