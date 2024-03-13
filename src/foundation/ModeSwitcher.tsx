import IconCardActive from '@icons/card_view_active.svg';
import IconCardNotActive from '@icons/card_view_not_active.svg';
import IconTableActive from '@icons/table_view_active.svg';
import IconTableNotActive from '@icons/table_view_not_active.svg';
import { ToggleButton, ToggleButtonGroup, styled } from '@mui/material';

const ToggleButtonGroupStyled = styled(ToggleButtonGroup)(() => ({
  border: 0,
}));

const ToggleButtonStyled = styled(ToggleButton)(() => ({
  border: 0,
  backgroundColor: 'transparent',
  '&.Mui-selected': {
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  '&:hover': {
    backgroundColor: 'transparent',
  },
}));

export type TViewMode = 'CARD' | 'TABLE';

interface IProps {
  value: TViewMode;
  onChange: (value: TViewMode) => void;
}

export const ModeSwitcher: React.FC<IProps> = ({ value, onChange }) => (
  <ToggleButtonGroupStyled
    value={value}
    onChange={(_, mode) => {
      onChange(mode);
    }}
    exclusive
  >
    <ToggleButtonStyled disableRipple value="TABLE">
      <img src={value === 'TABLE' ? IconTableActive : IconTableNotActive} />
    </ToggleButtonStyled>
    <ToggleButtonStyled disableRipple value="CARD">
      <img src={value === 'CARD' ? IconCardActive : IconCardNotActive} />
    </ToggleButtonStyled>
  </ToggleButtonGroupStyled>
);
