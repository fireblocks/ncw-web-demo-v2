import React from 'react';
import { styled, Typography } from '@foundation';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  minHeight: 400,
  width: '100%',
  margin: 'auto',
  marginTop: theme.spacing(4),
  gap: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
  backgroundColor: theme.palette.background.paper,
}));

const Message = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(2),
  textAlign: 'center',
}));

interface Props {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingIndicator: React.FC<Props> = ({
  message = 'Loading wallet data, please wait...',
  size = 'medium',
}) => {
  return (
    <LoadingContainer>
      <CircularProgress size={size === 'small' ? 24 : size === 'large' ? 60 : 40} />
      <Message variant="body1">{message}</Message>
    </LoadingContainer>
  );
};

export default LoadingIndicator; 