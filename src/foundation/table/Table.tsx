import { ReactElement } from 'react';
import { styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.primary.light,
}));

export const Table: React.FC<{ children: ReactElement | ReactElement[] }> = ({ children }) => (
  <RootStyled>{children}</RootStyled>
);
