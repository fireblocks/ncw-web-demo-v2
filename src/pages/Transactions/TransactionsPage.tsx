import React from 'react';
import { Typography, styled } from '@foundation';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { TransactionsList } from './TransactionsList';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const HeadingStyled = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(8),
  height: 204,
}));

export const TransactionsPage: React.FC = observer(function TransactionsPage() {
  const { t } = useTranslation();

  return (
    <RootStyled>
      <HeadingStyled>
        <Typography variant="h5" color="text.primary">
          {t('TRANSACTIONS.TITLE')}
        </Typography>
      </HeadingStyled>
      <TransactionsList />
    </RootStyled>
  );
});
