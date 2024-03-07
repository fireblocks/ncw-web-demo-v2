import * as React from 'react';
import { styled } from '@foundation';
import { Button as MUIButton } from '@mui/material';

const ButtonStyled = styled(MUIButton)(({ theme }) => ({
  '&.MuiButton-contained': {
    backgroundColor: theme.palette.primary.dark,
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
    padding: theme.spacing(1.5, 4),
  },
}));

const ButtonDarkStyled = styled(MUIButton)(({ theme }) => ({
  '&.MuiButton-contained': {
    backgroundColor: theme.palette.secondary.main,
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
    fontSize: theme.typography.h5.fontSize,
  },
}));

interface IProps {
  onClick?: () => void;
  caption: string;
  icon?: string;
  isDialog?: boolean;
}

export const ActionButton: React.FC<IProps> = ({ onClick, caption, icon, isDialog }) => {
  const Button = isDialog ? ButtonDarkStyled : ButtonStyled;

  return (
    <Button size="large" variant="contained" onClick={onClick}>
      {icon ? <img src={icon} /> : null}
      {caption}
    </Button>
  );
};
