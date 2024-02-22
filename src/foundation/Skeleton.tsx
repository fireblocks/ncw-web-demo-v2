import React from 'react';
import MUISkeleton from '@mui/material/Skeleton';
import { styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  width: '70%',
  margin: '0 auto',
  padding: theme.spacing(2),
}));

const TableStyled = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const CardsStyled = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
}));

interface IProps {
  mode: 'TABLE' | 'CARDS';
}

export const Skeleton: React.FC<IProps> = ({ mode }) => {
  return (
    <RootStyled>
      {mode === 'TABLE' && (
        <TableStyled>
          <MUISkeleton variant="rounded" width="100%" height={40} />
          <MUISkeleton variant="rounded" width="100%" height={40} />
          <MUISkeleton variant="rounded" width="100%" height={40} />
          <MUISkeleton variant="rounded" width="100%" height={40} />
        </TableStyled>
      )}

      {mode === 'CARDS' && (
        <CardsStyled>
          <MUISkeleton variant="rounded" width={175} height={175} />
          <MUISkeleton variant="rounded" width={175} height={175} />
          <MUISkeleton variant="rounded" width={175} height={175} />
        </CardsStyled>
      )}
    </RootStyled>
  );
};
