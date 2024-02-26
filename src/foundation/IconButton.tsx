import * as React from 'react';
import { styled } from '@foundation';
import { IconButton as MUIIconButton } from '@mui/material';

const IconButtonStyled = styled(MUIIconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  padding: 0,
  borderRadius: 4,
  minWidth: 50,
  height: 50,
  boxSizing: 'border-box',
  textAlign: 'center',
}));

interface IProps {
  onClick?: () => void;
  children: JSX.Element;
}

export const IconButton: React.FC<IProps> = ({ onClick, children }) => (
  <IconButtonStyled size="small" onClick={onClick}>
    {children}
  </IconButtonStyled>
);
