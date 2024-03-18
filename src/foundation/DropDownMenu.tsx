import { ReactElement } from 'react';
import { styled } from '@mui/material';
import Menu from '@mui/material/Menu/Menu';

const MenuStyled = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    marginTop: theme.spacing(1),
    minWidth: 150,
    borderRadius: theme.spacing(1),
  },
}));

interface IProps {
  anchorEl: HTMLElement | null;
  isOpen: boolean;
  children: ReactElement | ReactElement[];
  onClose: () => void;
}

export const DropDownMenu: React.FC<IProps> = ({ anchorEl, isOpen, children, onClose }) => (
  <MenuStyled
    anchorEl={anchorEl}
    open={isOpen}
    onClose={onClose}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    autoFocus={false}
  >
    {children}
  </MenuStyled>
);
