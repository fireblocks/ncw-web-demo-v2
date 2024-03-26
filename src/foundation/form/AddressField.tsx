import * as React from 'react';
import { CopyText } from '@foundation';
import styled from '@mui/material/styles/styled';
import { InputLabelStyled, FormControlRootStyled } from './commonStyledComponents';

const AddressWrapperStyled = styled('div')(({ theme }) => ({
  border: `2px solid ${theme.palette.background.default}`,
  borderRadius: 8,
  marginTop: theme.spacing(2),
  padding: theme.spacing(2, 3),
  boxSizing: 'border-box',
}));

interface IProps {
  address: string;
  label: string;
}

export const AddressField: React.FC<IProps> = ({ address, label }) => (
  <FormControlRootStyled>
    <InputLabelStyled htmlFor={label} shrink={false}>
      {label}
    </InputLabelStyled>
    <AddressWrapperStyled>
      <CopyText size="large" text={address} />
    </AddressWrapperStyled>
  </FormControlRootStyled>
);
