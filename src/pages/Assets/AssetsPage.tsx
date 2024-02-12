import { styled } from '@foundation';
import { observer } from 'mobx-react';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '#eeeeee',
}));

export const AssetsPage = observer(function AssetsPage() {
  return <RootStyled>Hello im AssetsPage</RootStyled>;
});
