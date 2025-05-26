import React from 'react';
import { Typography, styled } from '@foundation';
import IconArrowDownBlue from '@icons/arrow-down-blue.svg';

// Sort direction type
export type SortDirection = 'asc' | 'desc' | null;

// Styled components
const RootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(2, 0),
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  userSelect: 'none',
  '&:hover': {
    opacity: 0.8,
  },
}));

const SortIconStyled = styled('img')<{ isAscending: boolean }>(({ isAscending }) => ({
  marginLeft: '8px',
  width: '12px',
  height: '12px',
  transform: isAscending ? 'rotate(180deg)' : 'none',
  transition: 'transform 0.2s ease-in-out',
}));

interface IProps {
  title: string;
  sortField: string;
  currentSortField: string | null;
  sortDirection: SortDirection;
  onSort: (field: string) => void;
}

export const SortableTableHeaderCell: React.FC<IProps> = ({
  title,
  sortField,
  currentSortField,
  sortDirection,
  onSort,
}) => {
  const isCurrentlySorted = currentSortField === sortField;

  const handleClick = () => {
    onSort(sortField);
  };

  return (
    <RootStyled onClick={handleClick}>
      <Typography component="p" variant="caption" color="text.secondary">
        {title}
      </Typography>
      {isCurrentlySorted && sortDirection && (
        <SortIconStyled src={IconArrowDownBlue} alt={sortDirection} isAscending={sortDirection === 'asc'} />
      )}
    </RootStyled>
  );
};
