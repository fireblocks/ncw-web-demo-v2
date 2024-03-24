import { ReactElement } from 'react';
import { styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  backgroundColor: theme.palette.primary.light,
  width: '100%',
}));

export const TableBody: React.FC<{ children: ReactElement | ReactElement[] }> = ({ children }) => (
  <RootStyled>{children}</RootStyled>
);
