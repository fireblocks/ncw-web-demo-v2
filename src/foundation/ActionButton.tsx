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
    textTransform: 'capitalize',
  },
  '&.MuiButton-outlined': {
    border: 0,
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
    padding: theme.spacing(0, 4),
    height: 40,
    textTransform: 'capitalize',
  },
}));

const ButtonDarkStyled = styled(MUIButton)(({ theme }) => ({
  '&.MuiButton-contained': {
    backgroundColor: theme.palette.primary.main,
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
    padding: theme.spacing(1.5, 4),
    fontWeight: 600,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    letterSpacing: theme.typography.body2.letterSpacing,
    textTransform: 'capitalize',
  },
  '&.MuiButton-outlined': {
    border: 0,
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
    padding: theme.spacing(1.5, 4),
    fontWeight: 600,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    letterSpacing: theme.typography.body2.letterSpacing,
    textTransform: 'capitalize',
    color: theme.palette.text.primary,
  },
}));

interface IProps {
  onClick?: () => void;
  caption: string;
  disabled?: boolean;
  icon?: string;
  isDialog?: boolean;
  secondary?: boolean;
}

export const ActionButton: React.FC<IProps> = ({ onClick, disabled, caption, icon, isDialog, secondary }) => {
  const Button = isDialog ? ButtonDarkStyled : ButtonStyled;

  return (
    <Button disabled={disabled} size="large" variant={secondary ? 'outlined' : 'contained'} onClick={onClick}>
      {icon ? <img src={icon} /> : null}
      {caption}
    </Button>
  );
};
