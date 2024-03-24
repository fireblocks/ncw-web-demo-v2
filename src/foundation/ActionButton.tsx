import * as React from 'react';
import { styled } from '@foundation';
import { Button as MUIButton } from '@mui/material';

const ButtonStyled = styled(MUIButton)(({ theme }) => ({
  '&.MuiButton-contained': {
    backgroundColor: theme.palette.primary.dark,
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
    padding: theme.spacing(0, 4),
    height: 40,
  },
}));

const ButtonDarkStyled = styled(MUIButton)(({ theme }) => ({
  '&.MuiButton-contained': {
    backgroundColor: theme.palette.secondary.main,
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
    padding: theme.spacing(1.5, 4),
    fontWeight: 600,
    fontSize: theme.typography.h5.fontSize,
    textTransform: 'capitalize',
  },
}));

interface IProps {
  onClick?: () => void;
  caption: string;
  disabled?: boolean;
  icon?: string;
  isDialog?: boolean;
}

export const ActionButton: React.FC<IProps> = ({ onClick, disabled, caption, icon, isDialog }) => {
  const Button = isDialog ? ButtonDarkStyled : ButtonStyled;

  return (
    <Button disabled={disabled} size="large" variant="contained" onClick={onClick}>
      {icon ? <img src={icon} /> : null}
      {caption}
    </Button>
  );
};
