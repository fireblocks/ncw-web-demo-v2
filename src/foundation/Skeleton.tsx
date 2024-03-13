import React from 'react';
import { styled } from '@foundation';
import MUISkeleton from '@mui/material/Skeleton';

const RootStyled = styled('div')(({ theme }) => ({
  width: '100%',
  margin: '0 auto',
  padding: theme.spacing(4, 0),
}));

const TableStyled = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const TableHeaderStyled = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 0),
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

export const Skeleton: React.FC<IProps> = ({ mode }) => (
  <RootStyled>
    {mode === 'TABLE' && (
      <TableStyled>
        <TableHeaderStyled>
          <MUISkeleton variant="rounded" width="8%" height={25} />
          <MUISkeleton variant="rounded" width="11%" height={25} />
          <MUISkeleton variant="rounded" width="15%" height={25} />
          <MUISkeleton variant="rounded" width="16%" height={25} />
          <MUISkeleton variant="rounded" width="13%" height={25} />
        </TableHeaderStyled>
        <MUISkeleton variant="rounded" width="100%" height={50} />
        <MUISkeleton variant="rounded" width="100%" height={50} />
        <MUISkeleton variant="rounded" width="100%" height={50} />
        <MUISkeleton variant="rounded" width="100%" height={50} />
        <MUISkeleton variant="rounded" width="100%" height={50} />
        <MUISkeleton variant="rounded" width="100%" height={50} />
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
