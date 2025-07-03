import { styled } from '@foundation';
import Input from '@mui/material/Input/Input';
import InputLabel from '@mui/material/InputLabel/InputLabel';

export const FormControlRootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(1.5, 0),
  position: 'relative',
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

export const InputStyled = styled(Input)<{ error?: boolean }>(({ theme, error }) => ({
  '&.MuiInput-root': {
    marginTop: theme.spacing(1),
    border: `2px solid ${error ? theme.palette.error.main : theme.palette.background.default}`,
    borderRadius: 8,
    padding: theme.spacing(2, 3),
    width: '100%',
    boxSizing: 'border-box',
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body1.fontWeight,
    letterSpacing: theme.typography.body1.letterSpacing,
  },
}));
