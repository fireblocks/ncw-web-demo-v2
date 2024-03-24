import * as React from 'react';
import { styled } from '@foundation';
import { IconButton as MUIIconButton, Tooltip } from '@mui/material';

const IconButtonStyled = styled(MUIIconButton)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.dark,
  padding: 0,
  borderRadius: 4,
  minWidth: 40,
  height: 40,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignContent: 'center',
  alignItems: 'center',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const LargeStyled = styled('div')(({ theme }) => ({
  margin: theme.spacing(0, 2.5),
  width: 24,
  height: 24,
}));

interface IProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: JSX.Element;
  large?: boolean;
  tooltip?: string;
  disabled?: boolean;
}

export const IconButton: React.FC<IProps> = ({ onClick, children, large, tooltip, disabled }) => (
  <>
    {tooltip && !disabled ? (
      <Tooltip title={tooltip} arrow placement="top">
        <IconButtonStyled size="small" onClick={onClick}>
          {large ? <LargeStyled>{children}</LargeStyled> : children}
        </IconButtonStyled>
      </Tooltip>
    ) : (
      <IconButtonStyled size="small" onClick={onClick} disabled={disabled}>
        {large ? <LargeStyled>{children}</LargeStyled> : children}
      </IconButtonStyled>
    )}
  </>
);
