import * as React from 'react';
import Button from '@mui/material/Button';
import MUIDialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Typography } from '@mui/material';
import { IconButton, styled } from '@foundation';
import IconClose from '@icons/close.svg';

const RootStyled = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
}));

const DialogContentStyled = styled(DialogContent)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.light,
}));

const DialogHeaderStyled = styled('div')(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(4),
}));

const CloseButtonStyled = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(4),
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
}

export const Dialog: React.FC<IProps> = ({
  title,
  description,
  isOpen,
  actionCaption,
  onClose,
  doAction,
  children,
}) => (
  <MUIDialog open={isOpen} keepMounted onClose={onClose} fullWidth maxWidth="md">
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
        <DialogActions>
          <Button onClick={doAction}>{actionCaption}</Button>
        </DialogActions>
      )}
    </RootStyled>
  </MUIDialog>
);
