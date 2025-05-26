import React from 'react';
import { TableTextCell } from '@foundation';

interface IProps {
  change: number;
}

export const TableChangeCell: React.FC<IProps> = ({ change }) => {
  // Format the change value with plus/minus sign and percentage symbol
  const formattedChange = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;

  // Determine the mode based on whether the change is positive or negative
  const mode = (() => {
    if (change > 0) return 'POSITIVE';
    if (change < 0) return 'NEGATIVE';
    return 'REGULAR';
  })();

  return <TableTextCell text={formattedChange} mode={mode} />;
};
