import React from 'react';
import { styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(3, 6),
  borderBottom: `2px solid ${theme.palette.secondary.main}`,
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: theme.palette.secondary.main,
  },
}));

export const TableRow: React.FC<{ children: JSX.Element }> = ({ children }) => <RootStyled>{children}</RootStyled>;
