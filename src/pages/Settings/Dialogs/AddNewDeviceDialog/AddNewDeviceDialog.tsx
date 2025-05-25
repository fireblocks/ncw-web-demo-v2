/**
 * Main AddNewDeviceDialog component that orchestrates the device addition process
 *
 * This component manages the different phases of adding a new device:
 * - Phase 0: Selection between QR code scanning and manual entry
 * - Phase 1: Enter request ID or scan QR code
 * - Phase 2: Display device info and confirm
 * - Phase 3: Success state
 * - Phase 4: Error state
 */
import React, { useState } from 'react';
import { Dialog, LoadingPage } from '@foundation';
import { useFireblocksSDKStore } from '@store';
import { decode } from 'js-base64';
import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { DeviceInfo } from './DeviceInfo';
import { Error } from './Error';
import { SelectionPhase } from './SelectionPhase';
import { Success } from './Success';
import { RootStyled } from './styled';
import { IAddNewDeviceDialogProps, TRequestDecodedData } from './types';

export const AddNewDeviceDialog: React.FC<IAddNewDeviceDialogProps> = observer(function AddNewDeviceDialog({
  isOpen,
  onClose,
}) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const fireblockStore = useFireblocksSDKStore();

  // State management
  const [requestId, setRequestId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState(0); // 0: selection with QR scan or manual entry, 1: device info, 2: success, 3: error
  const [decodedData, setDecodedData] = useState<TRequestDecodedData | null>(null);
  const [isQrScannerActive, setIsQrScannerActive] = useState(false);

  /**
   * Validates and processes the request ID
   */
  const handleCheckRequestId = () => {
    if (!requestId) {
      enqueueSnackbar(t('SETTINGS.DIALOGS.ADD_DEVICE.REQUEST_ID_EMPTY_ERROR'), { variant: 'error' });
      return;
    }
    setIsLoading(true);
    try {
      // Decode the request ID and validate it
      const decoded: TRequestDecodedData = JSON.parse(decode(requestId));
      if (decoded.requestId && decoded.email) {
        setDecodedData(decoded);
        setIsLoading(false);
        setPhase(1); // Phase 1: Display device info
      } else {
        setIsLoading(false);
        enqueueSnackbar(t('SETTINGS.DIALOGS.ADD_DEVICE.REQUEST_ID_CHECK_ERROR'), { variant: 'error' });
      }
    } catch (error) {
      console.error('Error checking request ID:', error);
      enqueueSnackbar(t('SETTINGS.DIALOGS.ADD_DEVICE.REQUEST_ID_CHECK_ERROR'), { variant: 'error' });
      setIsLoading(false);
    }
  };

  /**
   * Resets all state and closes the dialog
   */
  const resetBeforeClose = () => {
    setRequestId('');
    setDecodedData(null);
    setPhase(0); // Reset to selection phase
    setIsLoading(false);
    setIsQrScannerActive(false);
    onClose();
  };

  /**
   * Handles selection of QR scan option from the initial screen
   */
  const handleSelectQrScan = () => {
    setIsQrScannerActive(true);
    // Keep phase at 0 since we're integrating QR scanning into the selection phase
  };

  // Manual entry is now handled directly in the SelectionPhase component

  /**
   * Disables QR scanner when scanning fails
   */
  const handleScanError = () => {
    setIsQrScannerActive(false);
    // We're already in phase 0, so no need to change the phase
  };

  /**
   * Approves the device join request
   */
  const addDevice = async (): Promise<void> => {
    if (decodedData && decodedData.requestId) {
      try {
        setIsLoading(true); // Set loading state to true before making the API call
        setIsLoading(false); // Set loading state to false after API call completes
        setPhase(2); // Set phase to 2 for success
      } catch (e) {
        console.error(e);
        setIsLoading(false); // Set loading state to false if there's an error
        setPhase(3); // Set phase to 3 for error
      }
    } else {
      setPhase(3); // Set phase to 3 for error
    }
  };

  /**
   * Resets the state to try again
   */
  const tryAgain = () => {
    setRequestId('');
    setDecodedData(null);
    setPhase(0); // Reset to selection phase
    setIsLoading(false);
  };

  return (
    <Dialog title={t('SETTINGS.DIALOGS.ADD_DEVICE.TITLE')} isOpen={isOpen} onClose={resetBeforeClose} size="medium">
      <RootStyled>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          {!isLoading ? (
            <>
              {/* Phase 0: Selection between QR scan and manual entry with direct request ID input */}
              {phase === 0 && (
                <SelectionPhase
                  onSelectQrScan={handleSelectQrScan}
                  requestId={requestId}
                  setRequestId={setRequestId}
                  handleCheckRequestId={handleCheckRequestId}
                  isQrScannerActive={isQrScannerActive}
                  toggleQrScanner={() => {
                    setIsQrScannerActive(!isQrScannerActive);
                  }}
                  onScanError={handleScanError}
                />
              )}

              {/* Phase 1: Device Info */}
              {phase === 1 && decodedData && (
                <DeviceInfo
                  decodedData={decodedData}
                  addDevice={addDevice}
                  onCancel={resetBeforeClose}
                  isLoading={isLoading}
                />
              )}

              {/* Phase 2: Success */}
              {phase === 2 && <Success />}

              {/* Phase 3: Error */}
              {phase === 3 && <Error tryAgain={tryAgain} />}
            </>
          ) : (
            <LoadingPage></LoadingPage>
          )}
        </div>
      </RootStyled>
    </Dialog>
  );
});
