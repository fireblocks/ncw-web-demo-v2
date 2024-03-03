import * as React from 'react';
import { styled } from '@foundation';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import { NumericFormat } from 'react-number-format';
import { InputLabelStyled, FormControlRootStyled, InputStyled } from './commonStyledComponents';

const InputAdornmentStyled = styled(InputAdornment)(({ theme }) => ({
  '&.MuiInputAdornment-root .MuiTypography-root': {
    fontSize: theme.typography.h5.fontSize,
    fontWeight: theme.typography.h6.fontWeight,
    maxWidth: 250,
    textWrap: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}));

interface IProps {
  value: string;
  label: string;
  placeholder: string;
  adornment: string;
  assetSymbol: string;
  setValue: (value: string) => void;
}

export const AssetAmountInput: React.FC<IProps> = ({ value, placeholder, label, adornment, assetSymbol, setValue }) => {
  const materialUIInputProps = {
    id: label,
    disableUnderline: true,
    endAdornment: <InputAdornmentStyled position="end">{adornment}</InputAdornmentStyled>,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
    },
    label,
    placeholder,
  };

  return (
    <FormControlRootStyled>
      <InputLabelStyled htmlFor={label} shrink={false}>
        {label} {assetSymbol}
      </InputLabelStyled>
      <NumericFormat value={value} customInput={InputStyled} {...materialUIInputProps} />
    </FormControlRootStyled>
  );
};
