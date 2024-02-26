import * as React from 'react';
import { styled } from '@foundation';
import { Button as MUIButton } from '@mui/material';

const ButtonStyled = styled(MUIButton)(({ theme }) => ({
  '&.MuiButton-contained': {
    backgroundColor: theme.palette.primary.dark,
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
  },
}));

interface IProps {
  onClick?: () => void;
  caption: string;
  icon?: string;
}

export const ActionButton: React.FC<IProps> = ({ onClick, caption, icon }) => (
  <ButtonStyled size="large" variant="contained" onClick={onClick}>
    {icon ? <img src={icon} /> : null}
    {caption}
  </ButtonStyled>
);
