import { ReactElement } from 'react';
import { styled } from '@foundation';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%',
}));

export const Table: React.FC<{ children: ReactElement | ReactElement[] }> = ({ children }) => (
  <RootStyled>{children}</RootStyled>
);
