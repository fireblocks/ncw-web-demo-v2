import * as React from 'react';
import styled from '@mui/material/styles/styled';
import QRCode from 'react-qr-code';
import { InputLabelStyled, FormControlRootStyled } from './commonStyledComponents';

const QRWrapperStyled = styled('div')(({ theme }) => ({
  width: '60%',
  border: `2px solid ${theme.palette.secondary.main}`,
  borderRadius: 8,
  marginTop: theme.spacing(2),
  padding: theme.spacing(2, 3),
  boxSizing: 'border-box',
}));

interface IProps {
  value: string;
  label: string;
}

export const QRField: React.FC<IProps> = ({ value, label }) => (
  <FormControlRootStyled>
    <InputLabelStyled htmlFor={label} shrink={false}>
      {label}
    </InputLabelStyled>
    <QRWrapperStyled>
      <QRCode value={value} style={{ width: '250px', height: '250px' }} />
    </QRWrapperStyled>
  </FormControlRootStyled>
);
