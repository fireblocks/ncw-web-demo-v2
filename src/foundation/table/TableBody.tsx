import { ReactElement } from 'react';
import { styled } from '@foundation';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflowY: 'auto',
}));

export const TableBody: React.FC<{ children: ReactElement | ReactElement[] }> = ({ children }) => (
  <RootStyled>{children}</RootStyled>
);
