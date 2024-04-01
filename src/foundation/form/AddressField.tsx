import * as React from 'react';
import { CopyText } from '@foundation';
import styled from '@mui/material/styles/styled';
import { InputLabelStyled, FormControlRootStyled } from './commonStyledComponents';

const AddressWrapperStyled = styled('div')(({ theme }) => ({
  border: `2px solid ${theme.palette.background.default}`,
  borderRadius: 8,
  padding: theme.spacing(2, 3),
  boxSizing: 'border-box',
}));

const LabelStyled = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

interface IProps {
  address: string;
  label: string;
}

export const AddressField: React.FC<IProps> = ({ address, label }) => (
  <FormControlRootStyled>
    <LabelStyled>
      <InputLabelStyled htmlFor={label} shrink={false}>
        {label}
      </InputLabelStyled>
    </LabelStyled>
    <AddressWrapperStyled>
      <CopyText size="large" text={address} />
    </AddressWrapperStyled>
  </FormControlRootStyled>
);
