import * as React from 'react';
import { InputLabelStyled, FormControlRootStyled, InputStyled } from './commonStyledComponents';

interface IProps {
  value: string;
  label: string;
  placeholder: string;
  readonly?: boolean;
  disabled?: boolean;
  setValue: (value: string) => void;
}

export const TextInput: React.FC<IProps> = ({ value, placeholder, label, readonly, disabled, setValue }) => (
  <FormControlRootStyled>
    <InputLabelStyled htmlFor={label} shrink={false}>
      {label}
    </InputLabelStyled>
    <InputStyled
      readOnly={readonly}
      disableUnderline
      placeholder={placeholder}
      id={label}
      value={value}
      disabled={disabled}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
      }}
    />
  </FormControlRootStyled>
);
