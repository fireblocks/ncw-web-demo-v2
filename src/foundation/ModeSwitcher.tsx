import IconCardActive from '@icons/card_view_active.svg';
import IconCardNotActive from '@icons/card_view_not_active.svg';
import IconTableActive from '@icons/table_view_active.svg';
import IconTableNotActive from '@icons/table_view_not_active.svg';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

export type TViewMode = 'CARD' | 'TABLE';

interface IProps {
  value: TViewMode;
  onChange: (event: React.MouseEvent<HTMLElement>, value: TViewMode) => void;
}

export const ModeSwitcher: React.FC<IProps> = ({ value, onChange }) => (
  <ToggleButtonGroup value={value} onChange={onChange} exclusive>
    <ToggleButton value="CARD" aria-label="left aligned">
      <img src={value === 'CARD' ? IconCardActive : IconCardNotActive} />
    </ToggleButton>
    <ToggleButton value="TABLE" aria-label="right aligned">
      <img src={value === 'TABLE' ? IconTableActive : IconTableNotActive} />
    </ToggleButton>
  </ToggleButtonGroup>
);
