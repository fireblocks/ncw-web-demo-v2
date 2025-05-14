import * as React from 'react';
import { useEffect } from 'react';
import { styled, Typography } from '@foundation';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import { NumericFormat } from 'react-number-format';
import { InputLabelStyled, FormControlRootStyled, InputStyled } from './commonStyledComponents';

const InputAdornmentStyled = styled(InputAdornment)(({ theme }) => ({
  '&.MuiInputAdornment-root .MuiTypography-root': {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body1.fontWeight,
    letterSpacing: theme.typography.body1.letterSpacing,
    maxWidth: 250,
    textWrap: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}));

const PriceDisplayStyled = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  textAlign: 'right',
}));

interface IProps {
  value: string;
  label: string;
  placeholder: string;
  adornment: string;
  assetSymbol: string;
  disabled?: boolean;
  setValue: (value: string) => void;
}

export const AssetAmountInput: React.FC<IProps> = ({
  value,
  placeholder,
  label,
  adornment,
  assetSymbol,
  disabled,
  setValue,
}) => {
  console.log('assetSymbol: ', assetSymbol);
  const materialUIInputProps = {
    id: label,
    disableUnderline: true,
    endAdornment: <InputAdornmentStyled position="end">{adornment}</InputAdornmentStyled>,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
    },
    label,
    placeholder,
    disabled,
  };

  return (
    <FormControlRootStyled>
      <InputLabelStyled htmlFor={label} shrink={false}>
        {label}
      </InputLabelStyled>
      <NumericFormat allowNegative={false} value={value} customInput={InputStyled} {...materialUIInputProps} />
    </FormControlRootStyled>
  );
};
