import React from 'react';
import {
  CopyText,
  DropDownMenu,
  MenuItem,
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
import IconDots from '@icons/dots.svg';
import { TransactionStore, useTransactionsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

const RowStyled = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr 1fr 0.7fr 1fr 1fr 0.7fr',
}));

const ActionsStyled = styled('div')(() => ({
  width: '100%',
  textAlign: 'right',
}));

export const TransactionsList: React.FC = observer(function TransactionsList() {
  const transactionsStore = useTransactionsStore();
  const { t } = useTranslation();

  const [txMenuAnchorEl, setTxMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedTx, setSelectedTx] = React.useState<TransactionStore | null>(null);

  const isTxMenuOpen = Boolean(txMenuAnchorEl);

  const onOpenTxMenuClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setTxMenuAnchorEl(event.currentTarget);
  };

  const onCloseTxMenuClick = () => {
    setTxMenuAnchorEl(null);
  };

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
        {transactionsStore.transactionsSortedByCreationDate.map((tx) => (
          <TableRow key={tx.id}>
            <RowStyled>
              <TableTitleCell
                title={
                  tx.isSubmitted
                    ? t('TRANSACTIONS.TABLE.SUBMITTED')
                    : `${t(tx.isOutgoing ? 'TRANSACTIONS.TABLE.SENT' : 'TRANSACTIONS.TABLE.RECEIVED')} ${tx.asset?.name}`
                }
                subtitle={tx.asset?.symbol || ''}
                iconUrl={tx.asset?.iconUrl}
              />
              <TableBalanceCell balance={tx.amount} balanceInUsd={tx.amountInUSD} />
              <TableTextCell text={tx.fee} />
              <TableStatusCell status={tx.status} />
              <TableTextCell text={tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ''} />
              <TableCell>{tx.destinationAddress ? <CopyText text={tx.destinationAddress} /> : null}</TableCell>
              <TableCell>
                {tx.isFinal ? null : (
                  <ActionsStyled
                    onClick={(e) => {
                      setSelectedTx(tx);
                      onOpenTxMenuClick(e);
                    }}
                  >
                    <img src={IconDots} />
                  </ActionsStyled>
                )}
              </TableCell>
            </RowStyled>
          </TableRow>
        ))}
      </TableBody>

      <DropDownMenu anchorEl={txMenuAnchorEl} isOpen={isTxMenuOpen} onClose={onCloseTxMenuClick}>
        <MenuItem
          disabled={!!selectedTx && selectedTx.status !== 'PENDING_SIGNATURE'}
          onClick={() => {
            selectedTx?.signTransaction();
            onCloseTxMenuClick();
          }}
        >
          {t('TRANSACTIONS.TABLE.SIGN')}
        </MenuItem>

        <MenuItem
          disabled={!!selectedTx && selectedTx.cantBeCanceled}
          onClick={() => {
            selectedTx?.cancelTransaction();
            onCloseTxMenuClick();
          }}
        >
          {t('TRANSACTIONS.TABLE.CANCEL')}
        </MenuItem>
      </DropDownMenu>
    </Table>
  );
});
