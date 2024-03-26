import * as React from 'react';
import styled from '@mui/material/styles/styled';
import QRCode from 'react-qr-code';
import { InputLabelStyled, FormControlRootStyled } from './commonStyledComponents';

const QRWrapperStyled = styled('div')(({ theme }) => ({
  width: 250,
  height: 250,
  border: `2px solid ${theme.palette.background.default}`,
  borderRadius: 8,
  marginTop: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
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
      <QRCode value={value} style={{ width: '200px', height: '200px' }} />
    </QRWrapperStyled>
  </FormControlRootStyled>
);
