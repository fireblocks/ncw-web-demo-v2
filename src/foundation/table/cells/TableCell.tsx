import { ReactElement } from 'react';
import { styled } from '@foundation';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
}));

export const TableCell: React.FC<{ children: ReactElement | ReactElement[] | null }> = ({ children }) => (
  <RootStyled>{children}</RootStyled>
);
