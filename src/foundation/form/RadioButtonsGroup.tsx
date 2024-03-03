import { styled } from '@foundation';
import { ReactElement } from 'react';
import { FormControlRootStyled, InputLabelStyled } from './commonStyledComponents';
import RadioGroup from '@mui/material/RadioGroup/RadioGroup';

const RadiosStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  border: `2px solid ${theme.palette.secondary.main}`,
  borderRadius: 8,
  padding: theme.spacing(0, 3),
  marginTop: theme.spacing(2),
}));

const RadioGroupStyled = styled(RadioGroup)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignContent: 'center',
  gap: theme.spacing(2),
}));

interface IProps {
  caption: string;
  defaultValue: string;
  onChange: (value: string) => void;
  children: ReactElement | ReactElement[];
}

export const RadioButtonsGroup: React.FC<IProps> = ({ caption, defaultValue, children, onChange }) => (
  <FormControlRootStyled>
    <InputLabelStyled>{caption}</InputLabelStyled>
    <RadiosStyled>
      <RadioGroupStyled
        defaultValue={defaultValue}
        name={caption}
        onChange={(_, value) => {
          onChange(value);
        }}
      >
        {children}
      </RadioGroupStyled>
    </RadiosStyled>
  </FormControlRootStyled>
);
