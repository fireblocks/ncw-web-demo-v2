import { styled } from '@foundation';
import { observer } from 'mobx-react';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '#eeeeee',
}));

export const NFTsPage = observer(function NFTsPage() {
  return <RootStyled>Hello im NFTsPage</RootStyled>;
});
