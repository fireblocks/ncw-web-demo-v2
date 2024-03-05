import React from 'react';
import { TNewTransactionType } from '@api';
import {
  CopyText,
  Skeleton,
  Table,
  TableBalanceCell,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableStatusCell,
  TableTextCell,
  TableTitleCell,
  styled,
} from '@foundation';
import { useTransactionsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

const RowStyled = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr 1fr 0.7fr 1fr 1fr 0.7fr',
}));

const operationTypeFormatter = (type: TNewTransactionType | null) => {
  switch (type) {
    case 'TYPED_MESSAGE':
      return 'Typed message';
    case 'TRANSFER':
      return 'Transfer';
    default:
      return 'Unknown';
  }
};

export const TransactionsList: React.FC = observer(function TransactionsList() {
  const transactionsStore = useTransactionsStore();
  const { t } = useTranslation();

  if (transactionsStore.isLoading && !transactionsStore.transactions.length) {
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
          <TableHeaderCell title={t('TRANSACTIONS.TABLE.HEADERS.OPERATION')} />
        </RowStyled>
      </TableHead>
      <TableBody>
        {transactionsStore.transactions.map((tx) => (
          <TableRow key={tx.id}>
            <RowStyled>
              <TableTitleCell
                title={`${t(tx.isOutgoing ? 'TRANSACTIONS.TABLE.SENT' : 'TRANSACTIONS.TABLE.RECEIVED')} ${tx.asset?.name}`}
                subtitle={tx.asset?.symbol || ''}
                iconUrl={tx.asset?.iconUrl}
              />
              <TableBalanceCell balance={tx.amount} balanceInUsd={tx.amountInUSD} />
              <TableTextCell text={tx.fee} />
              <TableStatusCell status={tx.status} />
              <TableTextCell text={tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ''} />
              <TableCell>{tx.destinationAddress ? <CopyText text={tx.destinationAddress} /> : null}</TableCell>
              <TableTextCell text={operationTypeFormatter(tx.operationType)} />
            </RowStyled>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
});
