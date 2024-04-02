import * as React from 'react';
import { styled } from '@foundation';
import { IconButton as MUIIconButton, Tooltip } from '@mui/material';

const IconButtonStyled = styled(MUIIconButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  padding: 0,
  borderRadius: 4,
  minWidth: 30,
  height: 30,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignContent: 'center',
  alignItems: 'center',
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
  },
}));

interface IProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  tooltip?: string;
  disabled?: boolean;
  iconSrc: string;
}

export const SecondaryIconButton: React.FC<IProps> = ({
  onClick,
  onMouseLeave = () => {},
  tooltip,
  iconSrc,
  disabled,
}) => (
  <div>
    {tooltip && !disabled ? (
      <Tooltip title={tooltip} arrow placement="top">
        <IconButtonStyled size="small" onClick={onClick} onMouseLeave={onMouseLeave}>
          <img src={iconSrc} />
        </IconButtonStyled>
      </Tooltip>
    ) : (
      <IconButtonStyled size="small" onClick={onClick} onMouseLeave={onMouseLeave} disabled={disabled}>
        <img src={iconSrc} />
      </IconButtonStyled>
    )}
  </div>
);
