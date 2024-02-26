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

const LargeStyled = styled('div')(({ theme }) => ({
  margin: theme.spacing(2, 3),
}));

interface IProps {
  onClick?: () => void;
  children: JSX.Element;
  large?: boolean;
}

export const IconButton: React.FC<IProps> = ({ onClick, children, large }) => (
  <IconButtonStyled size="small" onClick={onClick}>
    {large ? <LargeStyled>{children}</LargeStyled> : children}
  </IconButtonStyled>
);
