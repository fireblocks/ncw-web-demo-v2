import { ReactElement } from 'react';
import { styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(2, 5, 0, 5),
}));

export const TableHead: React.FC<{ children: ReactElement }> = ({ children }) => <RootStyled>{children}</RootStyled>;
