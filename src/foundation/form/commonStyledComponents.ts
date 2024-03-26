import { styled } from '@foundation';
import Input from '@mui/material/Input/Input';
import InputLabel from '@mui/material/InputLabel/InputLabel';

export const FormControlRootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(1.5, 0),
}));

export const InputLabelStyled = styled(InputLabel)(({ theme }) => ({
  '&.MuiInputLabel-root': {
    padding: 0,
    margin: 0,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body1.fontWeight,
    textTransform: 'uppercase',
    color: theme.palette.text.secondary,
  },
}));

export const InputStyled = styled(Input)(({ theme }) => ({
  '&.MuiInput-root': {
    marginTop: theme.spacing(1),
    border: `2px solid ${theme.palette.background.default}`,
    borderRadius: 8,
    padding: theme.spacing(2, 3),
    width: '100%',
    boxSizing: 'border-box',
    fontSize: theme.typography.h5.fontSize,
    fontWeight: theme.typography.h6.fontWeight,
  },
}));
