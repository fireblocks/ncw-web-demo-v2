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
import { RequestIdEntry } from './RequestIdEntry';
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
  const [phase, setPhase] = useState(0); // 0: selection, 1: enter request id, 2: recognize device info, 3: success, 4: error
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
      console.log('Checking request ID:', requestId);
      // Decode the request ID and validate it
      const decoded: TRequestDecodedData = JSON.parse(decode(requestId));
      if (decoded.requestId && decoded.email) {
        setDecodedData(decoded);
        setIsLoading(false);
        setPhase(2); // Phase 2: Display device info
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
   * Toggles the QR scanner
   */
  const toggleQrScanner = () => {
    setIsQrScannerActive(!isQrScannerActive);
  };

  /**
   * Handles selection of QR scan option from the initial screen
   */
  const handleSelectQrScan = () => {
    setIsQrScannerActive(true);
    setPhase(1); // Go to request ID entry phase with QR scanner active
  };

  /**
   * Handles selection of manual entry option from the initial screen
   */
  const handleSelectManualEntry = () => {
    setIsQrScannerActive(false);
    setPhase(1); // Go to request ID entry phase
  };

  /**
   * Returns to the selection phase when QR scanning fails
   */
  const handleScanError = () => {
    setIsQrScannerActive(false);
    setPhase(0); // Return to selection phase
  };

  /**
   * Approves the device join request
   */
  const addDevice = async (): Promise<void> => {
    if (requestId) {
      try {
        const result = await fireblockStore.sdkInstance?.approveJoinWalletRequest(requestId);
        console.log('approveJoinWallet result', result);
        setPhase(3); // Set phase to 3 for success
      } catch (e) {
        console.error(e);
        setPhase(4); // Set phase to 4 for error
      }
    } else {
      console.log('approveJoinWallet cancelled');
      setPhase(4); // Set phase to 4 for error
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
    <Dialog
      title={t('SETTINGS.DIALOGS.ADD_DEVICE.TITLE')}
      description={t('SETTINGS.DIALOGS.ADD_DEVICE.DESCRIPTION')}
      isOpen={isOpen}
      onClose={resetBeforeClose}
      size="medium"
    >
      <RootStyled>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          {!isLoading ? (
            <>
              {/* Phase 0: Selection between QR scan and manual entry */}
              {phase === 0 && (
                <SelectionPhase onSelectQrScan={handleSelectQrScan} onSelectManualEntry={handleSelectManualEntry} />
              )}

              {/* Phase 1: Request ID Entry */}
              {phase === 1 && (
                <RequestIdEntry
                  requestId={requestId}
                  setRequestId={setRequestId}
                  handleCheckRequestId={handleCheckRequestId}
                  isQrScannerActive={isQrScannerActive}
                  toggleQrScanner={toggleQrScanner}
                  onScanError={handleScanError}
                />
              )}

              {/* Phase 2: Device Info */}
              {phase === 2 && decodedData && (
                <DeviceInfo decodedData={decodedData} addDevice={addDevice} onCancel={resetBeforeClose} />
              )}

              {/* Phase 3: Success */}
              {phase === 3 && <Success />}

              {/* Phase 4: Error */}
              {phase === 4 && <Error tryAgain={tryAgain} />}
            </>
          ) : (
            <LoadingPage></LoadingPage>
          )}
        </div>
      </RootStyled>
    </Dialog>
  );
});
