import { Typography, styled } from '@foundation';
import { Button as MUIButton } from '@mui/material';

// Common styled components
export const SkipButtonWrapperStyled = styled('div')(({ theme }) => ({
  alignSelf: 'flex-start',
  marginTop: theme.spacing(2),
}));

export const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
  marginTop: theme.spacing(7),
}));

export const ProcessingStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  marginTop: theme.spacing(7),
}));

export const ButtonDarkStyledSpecial = styled(MUIButton)(({ theme }) => ({
  '&.MuiButton-outlined': {
    border: 0,
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    paddingLeft: '24px',
    paddingRight: '24px',
    fontWeight: 600,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    letterSpacing: theme.typography.body2.letterSpacing,
    textTransform: 'capitalize',
    color: theme.palette.text.primary,
  },
}));

// Join wallet UI styled components
export const JoinWalletContainerStyled = styled('div')(() => ({
  backgroundColor: 'transparent',
  padding: '16px',
  borderRadius: '8px',
  marginTop: '16px',
}));

export const StepRowStyled = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '16px',
}));

export const StepNumberStyled = styled('div')(() => ({
  backgroundColor: '#222222',
  color: '#FFFFFF',
  padding: '4px 8.5px',
  borderRadius: '4px',
  marginRight: '8px',
}));

export const StepTextStyled = styled(Typography)(() => ({
  color: '#6B7280',
}));

export const QRCodeContainerStyled = styled('div')(() => ({
  width: '248px',
  height: '248px',
  backgroundColor: '#222222',
  padding: '32px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '8px',
}));

export const QRLinkTextStyled = styled(Typography)(() => ({
  color: '#6B7280',
  marginBottom: '8px',
}));

export const IdContainerStyled = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
}));
