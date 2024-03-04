import React from 'react';
import { Skeleton, Table, TableBody, TableHead, TableHeaderCell, TableRow, TableTextCell, styled } from '@foundation';
import { useTransactionsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

const RowStyled = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr',
}));

export const TransactionsList: React.FC = observer(function TransactionsList() {
  const transactionsStore = useTransactionsStore();
  const { t } = useTranslation();

  const [selectedTxId, setSelectedTxId] = React.useState<string | null>(null);

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
          <TableHeaderCell title={t('TRANSACTIONS.TABLE.HEADERS.ACTIONS')} />
        </RowStyled>
      </TableHead>
      <TableBody>
        {transactionsStore.transactions.map((tx) => (
          <TableRow key={tx.id}>
            <RowStyled
              onMouseEnter={() => {
                setSelectedTxId(tx.id);
              }}
              onMouseLeave={() => {
                setSelectedTxId(null);
              }}
            >
              <TableTextCell text={tx.assetId} />
              <TableTextCell text={tx.status || ''} />
              <TableTextCell text={tx.status || ''} />
              <TableTextCell text={tx.status || ''} />
              <TableTextCell text={tx.status || ''} />
              <TableTextCell text={tx.sourceAddress} />
              <TableTextCell text={tx.status || ''} />
            </RowStyled>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
});
