import React from 'react';
import { styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(3, 5),
  backgroundColor: theme.palette.primary.light,
  borderBottom: `2px solid ${theme.palette.secondary.main}`,
  transition: 'background-color 0.3s',
  boxSizing: 'border-box',
  '&:hover': {
    backgroundColor: theme.palette.secondary.main,
  },
}));

interface IProps {
  children: JSX.Element;
  style?: React.CSSProperties;
}

export const TableRow: React.FC<IProps> = ({ children, style }) => <RootStyled style={style}>{children}</RootStyled>;
