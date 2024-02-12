import { styled } from '@foundation';
import { observer } from 'mobx-react';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '#eeeeee',
}));

export const TransactionsPage = observer(function TransactionsPage() {
  return <RootStyled>Hello im TransactionsPage</RootStyled>;
});
