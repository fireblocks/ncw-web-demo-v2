import { ReactElement } from 'react';
import { styled } from '@foundation';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
}));

export const TableBody: React.FC<{ children: ReactElement | ReactElement[] }> = ({ children }) => (
  <RootStyled>{children}</RootStyled>
);
