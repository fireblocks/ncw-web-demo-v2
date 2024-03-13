import { Button, styled } from '@foundation';
import ButtonGroup from '@mui/material/ButtonGroup/ButtonGroup';
import { FormControlRootStyled, InputLabelStyled } from './commonStyledComponents';

const ButtonGroupStyled = styled(ButtonGroup)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: 8,
  overflow: 'hidden',
  border: `2px solid ${theme.palette.secondary.main}`,
}));

const ButtonStyled = styled(Button)(({ theme }) => ({
  fontSize: 16,
  fontWeight: 600,
  color: theme.palette.text.secondary,
  '&.MuiButton-root': {
    padding: theme.spacing(1.5, 3),
    textTransform: 'none',
    transition: 'color 0.3s, background-color 0.3s',
    border: 0,
    '&:hover': {
      color: theme.palette.text.primary,
      border: 0,
      backgroundColor: 'transparent',
    },
  },
  '&.MuiButton-contained': {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.secondary.main,
    padding: theme.spacing(1.5, 3),
    border: 0,
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
    },
  },
  '&.MuiButtonGroup-firstButton': {
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
  },
  '&.MuiButtonGroup-middleButton': {
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

interface IButton {
  value: string;
  label: string;
}

interface IProps {
  caption: string;
  currentValue: string;
  onChange: (value: string) => void;
  buttons: IButton[];
}

export const ButtonsGroup: React.FC<IProps> = ({ caption, currentValue, buttons, onChange }) => (
  <FormControlRootStyled>
    <InputLabelStyled>{caption}</InputLabelStyled>
    <ButtonGroupStyled aria-label="Basic button group">
      {buttons.map((button) => {
        const buttonVariant = currentValue === button.value ? 'contained' : 'outlined';

        return (
          <ButtonStyled
            disableRipple
            size="large"
            variant={buttonVariant}
            onClick={() => {
              onChange(button.value);
            }}
            key={button.value}
          >
            {button.label}
          </ButtonStyled>
        );
      })}
    </ButtonGroupStyled>
  </FormControlRootStyled>
);
