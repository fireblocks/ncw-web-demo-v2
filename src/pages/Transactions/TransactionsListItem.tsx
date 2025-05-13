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
import { Button as MUIButton } from '@mui/material';
import { TransactionDetailsDialog } from './TransactionDetailsDialog';
import IconDots from '@icons/dots.svg';
import IconNoAsset from '@icons/no_asset_image.svg';
import IconNoNft from '@icons/no_nft_image.svg';
import { TransactionStore, useTransactionsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

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
          <TableTextCell text={
            transaction.isSubmitted
              ? t('TRANSACTIONS.TABLE.SUBMITTED')
              : `${t(transaction.isOutgoing ? 'TRANSACTIONS.TABLE.SENT' : 'TRANSACTIONS.TABLE.RECEIVED')} ${transaction.asset?.symbol || ''}`
          } />
          <TableBalanceCell 
            balance={`${transaction.amount} ${transaction.asset?.symbol || ''}`} 
            balanceInUsd={transaction.amountInUSD} 
          />
          <TableTitleCell
            title={transaction.asset?.name || ''}
            subtitle={transaction.asset?.symbol || ''}
            iconUrl={transaction.asset?.iconUrl || iconPlaceholder}
            assetSymbol={transaction.asset?.networkProtocol || IconNoAsset}
          />
          <TableTextCell text={transaction.fee !== '--' ? `${transaction.fee} ${transaction.asset?.symbol || ''}` : transaction.fee} />
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
                  transaction.signTransaction();
                }}
                onCancel={() => {
                  transaction.cancelTransaction();
                }}
              />
            ) : (
              <ActionButtonStyled>
                <CustomActionButton
                  onClick={() => {
                    setSelectedTx(transaction);
                    onOpenDetailsDialog();
                  }}
                >
                  <img src={IconDots} alt="Actions" />
                </CustomActionButton>
              </ActionButtonStyled>
            )}
          </TableCell>
        </RowStyled>
      </TableRow>

      <TransactionDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={onCloseDetailsDialog}
        transaction={selectedTx}
      />
    </div>
  );
});
