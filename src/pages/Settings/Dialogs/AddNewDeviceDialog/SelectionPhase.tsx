/**
 * SelectionPhase component for choosing between QR code scanning and manual entry
 *
 * This component displays two options for adding a new device:
 * - Scan QR Code: Initiates the QR code scanning process
 * - Enter Encoded ID: Shows input field for manual entry of the request ID
 */
import React from 'react';
import { Typography, TextInput, ActionButton } from '@foundation';
import NewDeviceIcon from '@icons/pencil-icon-with-frame.svg';
import ScanQRcodeIcon from '@icons/scan-qr-code.svg';
import { useTranslation } from 'react-i18next';
import { QrScanner } from './QrScanner';
import { ParametersStyled } from './styled';

interface ISelectionPhaseProps {
  onSelectQrScan: () => void;
  requestId: string;
  setRequestId: (value: string) => void;
  handleCheckRequestId: () => void;
  isQrScannerActive: boolean;
  toggleQrScanner: () => void;
  onScanError?: () => void;
}

export const SelectionPhase: React.FC<ISelectionPhaseProps> = ({
  onSelectQrScan,
  requestId,
  setRequestId,
  handleCheckRequestId,
  isQrScannerActive,
  toggleQrScanner,
  onScanError,
}) => {
  const { t } = useTranslation();

  // Handle QR scan result
  const handleQrScan = (result: string | null) => {
    if (result) {
      setRequestId(result);
      // Automatically check the request ID after scanning
      setTimeout(() => {
        handleCheckRequestId();
      }, 500);
    }
  };

  // Common styles for the option containers
  const optionContainerStyle: React.CSSProperties = {
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    height: '200px',
  };

  // Common styles for the option containers
  const optionContainerQRStyle: React.CSSProperties = {
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: '20px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    height: '200px',
  };

  // Common styles for the icons
  const iconStyle: React.CSSProperties = {
    fontSize: '48px',
    marginBottom: '16px',
  };

  // Styles for the separator line and text
  const separatorContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '2px',
    height: '200px', // Match the height of the option containers
    backgroundColor: '#1B1B1B',
    margin: '0 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const separatorTextStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'rgb(34 34 34)',
    color: '#6B7280',
    fontSize: '12px',
    padding: '4px', // Equal padding on all sides to create 4px gap
    zIndex: 1,
  };

  return (
    <ParametersStyled>
      {!isQrScannerActive ? (
        // Selection UI
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
          {/* QR Code Scanning Option */}
          <div
            style={optionContainerQRStyle}
            onClick={onSelectQrScan}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <img src={ScanQRcodeIcon} alt="Search" style={iconStyle} />
            <Typography
              variant="h6"
              align="center"
              style={{ textTransform: 'none', maxWidth: '248px', textAlign: 'left', fontSize: '20px' }}
            >
              {t('SETTINGS.DIALOGS.ADD_DEVICE.SCAN_QR_CODE')}
            </Typography>
          </div>

          {/* Separator Line with "OR" text */}
          <div style={separatorContainerStyle}>
            <div style={separatorTextStyle}>OR</div>
          </div>

          {/* Manual Entry Option */}
          <div style={optionContainerStyle}>
            <div style={{ width: '100%', marginBottom: '16px' }}>
              <TextInput
                label={t('SETTINGS.DIALOGS.ADD_DEVICE.REQUEST_ID')}
                placeholder={t('SETTINGS.DIALOGS.ADD_DEVICE.REQUEST_ID_PLACEHOLDER')}
                value={requestId}
                setValue={setRequestId}
              />
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'left' }}>
              <ActionButton
                caption={t('SETTINGS.DIALOGS.ADD_DEVICE.CHECK_REQUEST_ID')}
                onClick={handleCheckRequestId}
                disabled={!requestId}
                isDialog={true}
              />
            </div>
          </div>
        </div>
      ) : (
        // QR Scanner
        <QrScanner onScan={handleQrScan} toggleQrScanner={toggleQrScanner} onScanError={onScanError} />
      )}
    </ParametersStyled>
  );
};
