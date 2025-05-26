/**
 * QR Scanner component for scanning device request IDs
 */
import React, { useEffect, useRef } from 'react';
import { Typography, ActionButton } from '@foundation';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { QrScannerContainerStyled, QrReaderContainerStyled, QrScannerFallbackStyled } from './styled';
import { IQrScannerProps } from './types';

export const QrScanner: React.FC<IQrScannerProps> = ({ onScan, toggleQrScanner, onScanError }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const qrScannerRef = useRef<HTMLDivElement>(null);
  const scannerInstanceRef = useRef<any>(null);

  useEffect(() => {
    const timeoutId: NodeJS.Timeout = setTimeout(() => {
      try {
        if (!qrScannerRef.current) {
          console.error('QR scanner container not found');
          enqueueSnackbar('QR scanner initialization failed. Please try again.', { variant: 'error' });
          return;
        }

        // Check if the element with the ID exists in the DOM
        const qrContainer = document.getElementById('qr-reader-container');
        if (!qrContainer) {
          console.error('QR scanner container element not found in DOM');
          enqueueSnackbar('QR scanner initialization failed. Please try again.', { variant: 'error' });
          return;
        }

        // Dynamic import of html5-qrcode to avoid issues with SSR
        import('html5-qrcode')
          .then(({ Html5Qrcode }) => {
            try {
              const qrCodeSuccessCallback = (decodedText: string) => {
                onScan(decodedText);
              };

              const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
              };

              // Initialize the scanner
              const scanner = new Html5Qrcode('qr-reader-container');
              scannerInstanceRef.current = scanner;

              // Start scanning
              scanner
                .start({ facingMode: 'environment' }, config, qrCodeSuccessCallback, (errorMessage: string) => {
                  console.error('QR Code scanning error:', errorMessage);
                  if (errorMessage.includes('Camera access is not supported')) {
                    enqueueSnackbar(
                      'Camera access is not supported in this browser. Please try another browser or enter the code manually.',
                      { variant: 'error' },
                    );
                    if (onScanError) {
                      onScanError();
                    } else {
                      toggleQrScanner();
                    }
                  } else if (errorMessage.includes('Permission denied')) {
                    enqueueSnackbar('Camera access was denied. Please allow camera access and try again.', {
                      variant: 'error',
                    });
                    if (onScanError) {
                      onScanError();
                    } else {
                      toggleQrScanner();
                    }
                  }
                })
                .catch((err: any) => {
                  console.error('Failed to start scanner:', err);
                  enqueueSnackbar('Failed to start QR scanner. Please try again or enter the code manually.', {
                    variant: 'error',
                  });
                  if (onScanError) {
                    onScanError();
                  } else {
                    toggleQrScanner();
                  }
                });
            } catch (error) {
              console.error('Error initializing QR scanner:', error);
              enqueueSnackbar('Failed to initialize QR scanner. Please try again or enter the code manually.', {
                variant: 'error',
              });
              if (onScanError) {
                onScanError();
              } else {
                toggleQrScanner();
              }
            }
          })
          .catch((err) => {
            console.error('Failed to load html5-qrcode:', err);
            enqueueSnackbar('Failed to load QR scanner. Please try again or enter the code manually.', {
              variant: 'error',
            });
            if (onScanError) {
              onScanError();
            } else {
              toggleQrScanner();
            }
          });
      } catch (error) {
        console.error('Unexpected error during QR scanner initialization:', error);
        enqueueSnackbar('An unexpected error occurred. Please try again or enter the code manually.', {
          variant: 'error',
        });
        if (onScanError) {
          onScanError();
        } else {
          toggleQrScanner();
        }
      }
    }, 500); // Delay to ensure the div is rendered

    return () => {
      // Clear the timeout if component unmounts
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Clean up the scanner when component unmounts
      if (scannerInstanceRef.current) {
        try {
          scannerInstanceRef.current.stop().catch((err: any) => {
            console.error('Failed to stop scanner:', err);
          });
        } catch (error) {
          console.error('Error stopping scanner:', error);
        }
        scannerInstanceRef.current = null;
      }
    };
  }, [enqueueSnackbar, toggleQrScanner, onScan]);

  return (
    <>
      <QrScannerContainerStyled>
        <QrReaderContainerStyled id="qr-reader-container" ref={qrScannerRef}>
          {/* Fallback message that will be replaced by the scanner UI */}
          <QrScannerFallbackStyled>
            <Typography variant="body2" color="text.secondary">
              Initializing camera...
            </Typography>
          </QrScannerFallbackStyled>
        </QrReaderContainerStyled>
      </QrScannerContainerStyled>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <ActionButton
          caption={t('SETTINGS.DIALOGS.ADD_DEVICE.BACK_TO_MANUAL')}
          onClick={toggleQrScanner}
          isDialog={true}
          secondary={true}
        />
      </div>
    </>
  );
};
