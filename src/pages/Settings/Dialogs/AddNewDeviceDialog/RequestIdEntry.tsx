/**
 * RequestIdEntry component for entering or scanning a device request ID
 */
import React from 'react';
import { TextInput, ActionButton } from '@foundation';
import { useTranslation } from 'react-i18next';
import { QrScanner } from './QrScanner';
import { ParametersStyled } from './styled';
import { IRequestIdEntryProps } from './types';

export const RequestIdEntry: React.FC<IRequestIdEntryProps> = ({
  requestId,
  setRequestId,
  handleCheckRequestId,
  isQrScannerActive,
  toggleQrScanner,
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

  return (
    <ParametersStyled>
      {!isQrScannerActive ? (
        // Manual entry form
        <>
          <div style={{ marginBottom: '20px', width: '100%' }}>
            <TextInput
              label={t('SETTINGS.DIALOGS.ADD_DEVICE.REQUEST_ID')}
              placeholder={t('SETTINGS.DIALOGS.ADD_DEVICE.REQUEST_ID_PLACEHOLDER')}
              value={requestId}
              setValue={setRequestId}
            />
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <ActionButton
              caption={t('SETTINGS.DIALOGS.ADD_DEVICE.CHECK_REQUEST_ID')}
              onClick={handleCheckRequestId}
              disabled={!requestId}
              isDialog={true}
            />
          </div>
        </>
      ) : (
        // QR Scanner
        <QrScanner onScan={handleQrScan} toggleQrScanner={toggleQrScanner} />
      )}
    </ParametersStyled>
  );
};
