import React from 'react';
import { styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(3, 6),
  backgroundColor: theme.palette.primary.light,
  borderBottom: `2px solid ${theme.palette.secondary.main}`,
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: theme.palette.secondary.main,
  },
}));

interface IProps {
  children: JSX.Element;
  style?: React.CSSProperties;
}

export const TableRow: React.FC<IProps> = ({ children, style }) => {
  return <RootStyled style={style}>{children}</RootStyled>;
};
