import React from 'react';
import {
  CopyText,
  TableBalanceCell,
  TableCell,
  TableRow,
  TableSignCell,
  TableStatusCell,
  TableTextCell,
  TableTitleCell,
  styled,
} from '@foundation';
import IconDots from '@icons/dots.svg';
import IconNoAsset from '@icons/no_asset_image.svg';
import IconNoNft from '@icons/no_nft_image.svg';
import { Button as MUIButton, Tooltip } from '@mui/material';
import { TransactionStore, useTransactionsStore } from '@store';
import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { TransactionDetailsDialog } from './TransactionDetailsDialog';

export const RowStyled = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 0.9fr 1.2fr 0.8fr 0.7fr 1fr 1fr 0.6fr',
  columnGap: theme.spacing(2), // Add spacing between columns
  '& > *': {
    maxWidth: '100%', // Ensure each child has max width
    overflow: 'hidden', // Hide overflow
  },
}));

// Create a custom button component
const CustomActionButton = styled(MUIButton)(({ theme }) => ({
  width: '42px',
  height: '42px',
  minWidth: '42px',
  padding: 0,
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const ActionButtonStyled = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

interface IProps {
  index: number;
  style: React.CSSProperties;
}

export const TransactionsListItem: React.FC<IProps> = observer(function TransactionsListItem({ index, style }) {
  const { t } = useTranslation();
  const transactionsStore = useTransactionsStore();
  const { enqueueSnackbar } = useSnackbar();

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false);
  const [selectedTx, setSelectedTx] = React.useState<TransactionStore | null>(null);

  const onOpenDetailsDialog = () => {
    setIsDetailsDialogOpen(true);
  };

  const onCloseDetailsDialog = () => {
    setIsDetailsDialogOpen(false);
  };

  const transaction = transactionsStore.transactionsSortedByCreationDate[index];

  const iconPlaceholder = transaction.isNFT ? IconNoNft : IconNoAsset;

  return (
    <div key={transaction.id} style={style}>
      <TableRow>
        <RowStyled>
          <TableTextCell
            text={
              transaction.isSubmitted
                ? t('TRANSACTIONS.TABLE.SUBMITTED')
                : `${t(transaction.isOutgoing ? 'TRANSACTIONS.TABLE.SENT' : 'TRANSACTIONS.TABLE.RECEIVED')} ${transaction.asset?.symbol || ''}`
            }
          />
          <TableBalanceCell
            balance={`${String(transaction.amount)} ${transaction.asset?.symbol || ''}`}
            balanceInUsd={transaction.amountInUSD}
          />
          <TableTitleCell
            title={transaction.asset?.name || ''}
            subtitle={transaction.asset?.symbol || ''}
            iconUrl={transaction.asset?.iconUrl || iconPlaceholder}
            assetSymbol={transaction.asset?.networkProtocol || IconNoAsset}
          />
          <TableTextCell
            text={transaction.fee !== '--' ? `${transaction.fee} ${transaction.asset?.symbol || ''}` : transaction.fee}
          />
          <TableStatusCell status={transaction.status} isSigning={transaction.isSigning} />
          <TableTextCell text={transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : ''} />
          <TableCell>
            {transaction.destinationAddress ? <CopyText text={transaction.destinationAddress} /> : null}
          </TableCell>
          <TableCell>
            {transaction.status === 'PENDING_SIGNATURE' ? (
              <TableSignCell
                isSigning={transaction.isSigning}
                onSign={() => {
                  // Clear any previous error
                  transaction.setError('');

                  // Call signTransaction and watch for errors
                  transaction.signTransaction();

                  // Set up an error watcher
                  const errorWatcher = setInterval(() => {
                    if (transaction.error) {
                      enqueueSnackbar(
                        transaction.error !== 'UNKNOWN_ERROR'
                          ? `Transaction signing failed: ${transaction.error}`
                          : 'Transaction signing failed',
                        { variant: 'error' },
                      );
                      clearInterval(errorWatcher);
                    } else if (!transaction.isSigning) {
                      // If signing is no longer in progress and there's no error, we can stop watching
                      clearInterval(errorWatcher);
                    }
                  }, 500); // Check every 500ms
                }}
                onCancel={() => {
                  transaction.cancelTransaction();
                }}
              />
            ) : (
              <ActionButtonStyled>
                <Tooltip title="More info" arrow placement="top">
                  <CustomActionButton
                    onClick={() => {
                      setSelectedTx(transaction);
                      onOpenDetailsDialog();
                    }}
                  >
                    <img src={IconDots} alt="Actions" />
                  </CustomActionButton>
                </Tooltip>
              </ActionButtonStyled>
            )}
          </TableCell>
        </RowStyled>
      </TableRow>

      <TransactionDetailsDialog isOpen={isDetailsDialogOpen} onClose={onCloseDetailsDialog} transaction={selectedTx} />
    </div>
  );
});
