import * as React from 'react';
import { ActionButton, IconButton, styled } from '@foundation';
import IconClose from '@icons/close.svg';
import { Typography } from '@mui/material';
import MUIDialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

const RootStyled = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
}));

const MUIDialogMediumStyled = styled(MUIDialog)(() => ({
  '.MuiDialog-paper': {
    width: 750,
    maxWidth: 750,
  },
}));

const MUIDialogSmallStyled = styled(MUIDialog)(() => ({
  '.MuiDialog-paper': {
    width: 600,
    maxWidth: 600,
  },
}));

const DialogContentStyled = styled(DialogContent)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.light,
  padding: 0,
}));

const DialogActionsStyled = styled(DialogActions)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.light,
  padding: theme.spacing(0, 3, 4, 0),
}));

const DialogHeaderStyled = styled('div')(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(5, 4),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const CloseButtonStyled = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(5),
  right: theme.spacing(4),
}));

interface IProps {
  title: string;
  description: string;
  isOpen: boolean;
  actionCaption?: string;
  onClose: () => void;
  doAction?: () => void;
  children: JSX.Element;
  size?: 'small' | 'medium' | 'large';
}

export const Dialog: React.FC<IProps> = ({
  title,
  description,
  isOpen,
  actionCaption,
  onClose,
  doAction,
  children,
  size = 'medium',
}) => {
  let DialogComponent = null;

  switch (size) {
    case 'small':
      DialogComponent = MUIDialogSmallStyled;
      break;
    case 'medium':
      DialogComponent = MUIDialogMediumStyled;
      break;
    default:
      DialogComponent = MUIDialogMediumStyled;
  }
  return (
    <DialogComponent open={isOpen} keepMounted onClose={onClose}>
      <RootStyled>
        <DialogHeaderStyled>
          <Typography variant="h2" component="p">
            {title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {description}
          </Typography>
          <CloseButtonStyled>
            <IconButton onClick={onClose}>
              <img src={IconClose} />
            </IconButton>
          </CloseButtonStyled>
        </DialogHeaderStyled>

        <DialogContentStyled>{children}</DialogContentStyled>
        {doAction && actionCaption && (
          <DialogActionsStyled>
            <ActionButton isDialog onClick={doAction} caption={actionCaption} />
          </DialogActionsStyled>
        )}
      </RootStyled>
    </DialogComponent>
  );
};
