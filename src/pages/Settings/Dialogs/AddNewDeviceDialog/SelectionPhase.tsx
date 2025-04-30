/**
 * SelectionPhase component for choosing between QR code scanning and manual entry
 *
 * This component displays two options for adding a new device:
 * - Scan QR Code: Initiates the QR code scanning process
 * - Enter Encoded ID: Allows manual entry of the request ID
 */
import React from 'react';
import { Typography } from '@foundation';
import NewDeviceIcon from '@icons/pencil-icon-with-frame.svg';
import ScanQRcodeIcon from '@icons/scan-qr-code.svg';
import { useTranslation } from 'react-i18next';
import { ParametersStyled } from './styled';

interface ISelectionPhaseProps {
  onSelectQrScan: () => void;
  onSelectManualEntry: () => void;
}

export const SelectionPhase: React.FC<ISelectionPhaseProps> = ({ onSelectQrScan, onSelectManualEntry }) => {
  const { t } = useTranslation();

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
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
        {/* QR Code Scanning Option */}
        <div
          style={optionContainerStyle}
          onClick={onSelectQrScan}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <img src={ScanQRcodeIcon} alt="Search" style={iconStyle} />
          <Typography variant="h6" align="center">
            {t('SETTINGS.DIALOGS.ADD_DEVICE.SCAN_QR_CODE')}
          </Typography>
        </div>

        {/* Separator Line with "OR" text */}
        <div style={separatorContainerStyle}>
          <div style={separatorTextStyle}>OR</div>
        </div>

        {/* Manual Entry Option */}
        <div
          style={optionContainerStyle}
          onClick={onSelectManualEntry}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <img src={NewDeviceIcon} alt="New Device" style={iconStyle} />
          <Typography variant="h6" align="center">
            {t('SETTINGS.DIALOGS.ADD_DEVICE.ENTER_ENCODED_ID')}
          </Typography>
        </div>
      </div>
    </ParametersStyled>
  );
};
