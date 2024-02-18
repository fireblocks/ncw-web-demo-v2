import { Typography, styled } from '@foundation';
import { observer } from 'mobx-react';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

export const TransactionsPage: React.FC = observer(function TransactionsPage() {
  return (
    <RootStyled>
      <Typography variant="h4" color="text.primary">
        Hello im Transactions page
      </Typography>
    </RootStyled>
  );
});
