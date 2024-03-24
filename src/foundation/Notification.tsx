import React from 'react';
import ErrorIcon from '@icons/notification_error.svg';
import SuccessIcon from '@icons/notification_success.svg';
import { Typography, styled } from '@mui/material';
import { CustomContentProps } from 'notistack';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  borderRadius: 8,
  overflow: 'hidden',
  gap: theme.spacing(1),
  backgroundColor: theme.palette.primary.light,
  minWidth: 'fit-content',
  width: 'fit-content',
  margin: '0 auto',
}));

const MessageStyled = styled(Typography)(({ theme }) => ({
  fontSize: 16,
  color: theme.palette.text.primary,
}));

export const Notification = React.forwardRef<HTMLDivElement, CustomContentProps>((props, ref) => {
  const { variant, message } = props;

  return (
    <RootStyled ref={ref}>
      <img src={variant === 'error' ? ErrorIcon : SuccessIcon} />
      <MessageStyled>{message}</MessageStyled>
    </RootStyled>
  );
});
