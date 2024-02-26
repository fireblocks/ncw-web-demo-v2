import { ReactElement } from 'react';
import { styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(2, 6, 0, 6),
}));

export const TableHead: React.FC<{ children: ReactElement }> = ({ children }) => <RootStyled>{children}</RootStyled>;
