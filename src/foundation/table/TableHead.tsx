import { ReactElement } from 'react';
import { styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(2, 6, 0, 6),
  backgroundColor: theme.palette.primary.light,
}));

export const TableHead: React.FC<{ children: ReactElement }> = ({ children }) => <RootStyled>{children}</RootStyled>;
