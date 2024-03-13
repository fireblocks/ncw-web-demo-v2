import React from 'react';
import {
  CopyText,
  DropDownMenu,
  MenuItem,
  TableBalanceCell,
  TableCell,
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

export const RowStyled = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr 1fr 0.7fr 1fr 1fr 0.7fr',
}));

const ActionsStyled = styled('div')(() => ({
  width: '100%',
  textAlign: 'right',
}));

interface IProps {
  index: number;
  style: React.CSSProperties;
}

export const TransactionsListItem: React.FC<IProps> = observer(function TransactionsListItem({ index, style }) {
  const { t } = useTranslation();
  const transactionsStore = useTransactionsStore();

  const [txMenuAnchorEl, setTxMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedTx, setSelectedTx] = React.useState<TransactionStore | null>(null);

  const isTxMenuOpen = Boolean(txMenuAnchorEl);

  const onOpenTxMenuClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setTxMenuAnchorEl(event.currentTarget);
  };

  const onCloseTxMenuClick = () => {
    setTxMenuAnchorEl(null);
  };

  const transaction = transactionsStore.transactionsSortedByCreationDate[index];

  return (
    <div key={transaction.id} style={style}>
      <TableRow>
        <RowStyled>
          <TableTitleCell
            title={
              transaction.isSubmitted
                ? t('TRANSACTIONS.TABLE.SUBMITTED')
                : `${t(transaction.isOutgoing ? 'TRANSACTIONS.TABLE.SENT' : 'TRANSACTIONS.TABLE.RECEIVED')} ${transaction.asset?.name || ''}`
            }
            subtitle={transaction.asset?.symbol || ''}
            iconUrl={transaction.asset?.iconUrl}
          />
          <TableBalanceCell balance={transaction.amount} balanceInUsd={transaction.amountInUSD} />
          <TableTextCell text={transaction.fee} />
          <TableStatusCell status={transaction.status} />
          <TableTextCell text={transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : ''} />
          <TableCell>
            {transaction.destinationAddress ? <CopyText text={transaction.destinationAddress} /> : null}
          </TableCell>
          <TableCell>
            {transaction.isFinal ? null : (
              <ActionsStyled
                onClick={(e) => {
                  setSelectedTx(transaction);
                  onOpenTxMenuClick(e);
                }}
              >
                <img src={IconDots} />
              </ActionsStyled>
            )}
          </TableCell>
        </RowStyled>
      </TableRow>

      <DropDownMenu anchorEl={txMenuAnchorEl} isOpen={isTxMenuOpen} onClose={onCloseTxMenuClick}>
        <MenuItem
          disabled={!!selectedTx && (selectedTx.status !== 'PENDING_SIGNATURE' || selectedTx.isSigning)}
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
    </div>
  );
});
