import React from 'react';
import { Typography, styled } from '@foundation';
import { useTransactionsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { EmptyPage } from '../common/EmptyPage';
import { AmountsStyled, HeadingAmount } from '../common/HeadingAmount';
import { TransactionsList } from './TransactionsList';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const HeadingStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(2, 0, 8, 0),
}));

export const TransactionsPage: React.FC = observer(function TransactionsPage() {
  const { t } = useTranslation();
  const transactionsStore = useTransactionsStore();
  localStorage.setItem('VISITED_PAGE', 'transactions');

  return (
    <RootStyled>
      {transactionsStore.transactionsSortedByCreationDate.length === 0 ? (
        <EmptyPage page="TRANSACTIONS" />
      ) : (
        <>
          <HeadingStyled>
            <Typography variant="h6" color="text.primary">
              {t('TRANSACTIONS.TITLE')}
            </Typography>
            <AmountsStyled>
              <HeadingAmount
                title={t('TRANSACTIONS.TOTAL_TRANSACTIONS_AMOUNT')}
                titleColor="text.secondary"
                value={transactionsStore.transactionsSortedByCreationDate.length}
              />
              <HeadingAmount
                title={t('TRANSACTIONS.COMPLETED')}
                titleColor="success.main"
                value={transactionsStore.completedAmount}
              />
              <HeadingAmount
                title={t('TRANSACTIONS.IN_PROGRESS')}
                titleColor="primary.dark"
                value={transactionsStore.inProgressAmount}
              />
              <HeadingAmount
                title={t('TRANSACTIONS.FAILED_AND_CANCELED')}
                titleColor="error.main"
                value={transactionsStore.failedOrCanceledAmount}
              />
            </AmountsStyled>
          </HeadingStyled>
          <TransactionsList />
        </>
      )}
    </RootStyled>
  );
});
