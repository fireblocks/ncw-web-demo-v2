/**
 * Styled components for the AddNewDeviceDialog
 */
import { styled } from '@foundation';

// Root container for the dialog content
export const RootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(7, 5),
  display: 'flex',
  gap: theme.spacing(4),
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
}));

// Container for parameters and form elements
export const ParametersStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  alignItems: 'center',
  width: '100%',
}));

// Wrapper for icons (success, error)
export const IconWrapperStyled = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

// Container for the QR scanner
export const QrScannerContainerStyled = styled('div')({
  width: '100%',
  height: '300px',
  marginBottom: '20px',
});

// Inner container for the QR scanner
export const QrReaderContainerStyled = styled('div')({
  width: '100%',
  height: '100%',
  position: 'relative',
});

// Fallback message container for QR scanner
export const QrScannerFallbackStyled = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  gap: '10px',
  zIndex: 0,
});

// Placeholder for QR scanner when not active
export const QrScannerPlaceholderStyled = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  border: '1px dashed #ccc',
  borderRadius: '4px',
  flexDirection: 'column',
  gap: '10px',
});

// Container for device info
export const DeviceInfoContainerStyled = styled('div')({
  width: '278px',
});

// Container for device info header
export const DeviceInfoHeaderStyled = styled('div')({
  marginBottom: '32px',
});

// Container for device info row
export const DeviceInfoRowStyled = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  gap: '10px',
  width: '100%',
  alignItems: 'center',
  marginBottom: '16px',
});

// Container for action buttons
export const ActionButtonContainerStyled = styled('div')({
  marginTop: '56px',
  marginBottom: '25px',
  width: '100%',
});

// Container for success/error message
export const ResultMessageContainerStyled = styled('div')({
  width: '100%',
  textAlign: 'center',
});

// Container for success/error content
export const ResultContentStyled = styled('div')({
  marginBottom: '32px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});
