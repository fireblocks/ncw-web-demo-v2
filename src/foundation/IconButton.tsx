import * as React from 'react';
import { styled } from '@foundation';
import { IconButton as MUIIconButton, Tooltip } from '@mui/material';

const IconButtonStyled = styled(MUIIconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
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

const IconButtonLargeStyled = styled(MUIIconButton)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.dark,
  padding: 0,
  borderRadius: 4,
  minWidth: 50,
  height: 50,
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

interface IProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: JSX.Element;
  large?: boolean;
  tooltip?: string;
  disabled?: boolean;
}

export const IconButton: React.FC<IProps> = ({ onClick, children, large, tooltip, disabled }) => {
  const ButtonComponent = large ? IconButtonLargeStyled : IconButtonStyled;

  return (
    <>
      {tooltip && !disabled ? (
        <Tooltip title={tooltip} arrow placement="top">
          <ButtonComponent size="small" onClick={onClick}>
            {children}
          </ButtonComponent>
        </Tooltip>
      ) : (
        <ButtonComponent size="small" onClick={onClick} disabled={disabled}>
          {children}
        </ButtonComponent>
      )}
    </>
  );
};
