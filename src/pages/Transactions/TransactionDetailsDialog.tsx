import React from 'react';
import { CopyText, Dialog, Typography, styled } from '@foundation';
import { TransactionStore } from '@store';
import { useTranslation } from 'react-i18next';

// Container for the entire dialog content
const ContentContainerStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(4, 8),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

// Row for information items
const InfoRowStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

// Label styling
const LabelStyled = styled(Typography)(() => ({
  color: '#6B7280',
  fontSize: '14px',
  fontWeight: 600,
}));

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionStore | null;
}

export const TransactionDetailsDialog: React.FC<IProps> = ({ isOpen, onClose, transaction }) => {
  const { t } = useTranslation();

  if (!transaction) {
    return null;
  }

  return (
    <Dialog size="small" title={t('TRANSACTIONS.DETAILS_DIALOG.TITLE')} isOpen={isOpen} onClose={onClose}>
      <ContentContainerStyled>
        <InfoRowStyled>
          <LabelStyled>{t('TRANSACTIONS.DETAILS_DIALOG.TRANSACTION_HASH')}</LabelStyled>
          <CopyText size="large" text={transaction.details?.txHash || ''} />
        </InfoRowStyled>
        <InfoRowStyled>
          <LabelStyled>{t('TRANSACTIONS.DETAILS_DIALOG.FIREBLOCKS_TRANSACTION_ID')}</LabelStyled>
          <CopyText size="large" text={transaction.id} />
        </InfoRowStyled>
      </ContentContainerStyled>
    </Dialog>
  );
};
