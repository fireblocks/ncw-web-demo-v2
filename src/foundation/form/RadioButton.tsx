import { FormControlRootStyled } from './commonStyledComponents';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import Radio from '@mui/material/Radio/Radio';
import styled from '@mui/material/styles/styled';

const FormControlLabelStyled = styled(FormControlLabel)(({ theme }) => ({
  '&.MuiFormControlLabel-root .MuiTypography-root': {
    fontSize: theme.typography.h5.fontSize,
    fontWeight: theme.typography.h6.fontWeight,
  },
}));

interface IProps {
  value: string;
  label: string;
}

export const RadioButton: React.FC<IProps> = ({ label, value }) => (
  <FormControlRootStyled>
    <FormControlLabelStyled value={value} control={<Radio />} label={label} />
  </FormControlRootStyled>
);
