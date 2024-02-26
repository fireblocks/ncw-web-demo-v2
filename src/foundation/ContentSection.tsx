import { ReactElement } from 'react';
import { styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  padding: theme.spacing(2, 5),
  borderBottom: `2px solid ${theme.palette.secondary.main}`,
}));

export const ContentSection: React.FC<{ children: ReactElement }> = ({ children }) => (
  <RootStyled>{children}</RootStyled>
);
