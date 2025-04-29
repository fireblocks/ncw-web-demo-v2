import React, { useState } from 'react';
import { Dialog, Typography, styled, LoadingPage, TextInput, ActionButton } from '@foundation';
import CloseSignIcon from '@icons/close-icon.svg';
import VSignIcon from '@icons/v-sign.svg';
import { Button } from '@mui/material';
import { useFireblocksSDKStore } from '@store';
import { decode } from 'js-base64';
import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

const RootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(7, 5),
  display: 'flex',
  gap: theme.spacing(4),
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
}));

const ParametersStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  alignItems: 'center',
  width: '100%',
}));

const IconWrapperStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export type TRequestDecodedData = { email: string; requestId: string; platform: string };

export const AddNewDeviceDialog: React.FC<IProps> = observer(function AddNewDeviceDialog({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [requestId, setRequestId] = React.useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState(0); // 0: enter request id, 1: recognize device info, 2. success, 3. error
  const [decodedData, setDecodedData] = useState<TRequestDecodedData | null>(null);
  const fireblockStore = useFireblocksSDKStore();

  const handleCheckRequestId = () => {
    if (!requestId) {
      enqueueSnackbar(t('SETTINGS.DIALOGS.ADD_DEVICE.REQUEST_ID_EMPTY_ERROR'), { variant: 'error' });
      return;
    }
    setIsLoading(true);
    try {
      console.log('Checking request ID:', requestId);
      // for testing only!!!
      /// const a = encode(`{"email":"test@gmail.com","platform":"Web","requestId":"fsdd343dssa4332fdsfdsfsdsdf"}`);
      ////
      const decoded: TRequestDecodedData = JSON.parse(decode(requestId));
      if (decoded.requestId && decoded.email) {
        setDecodedData(decoded);
        setIsLoading(false);
        setPhase(1);
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

  const resetBeforeClose = () => {
    setRequestId('');
    setDecodedData(null);
    setPhase(0);
    setIsLoading(false);
    onClose();
  };

  const addDevice = async (): Promise<void> => {
    if (requestId) {
      try {
        const result = await fireblockStore.sdkInstance?.approveJoinWalletRequest(requestId);
        console.log('approveJoinWallet result', result);
        setPhase(2); // Set phase to 2 for success
      } catch (e) {
        console.error(e);
        setPhase(3); // Set phase to 3 for error
      }
    } else {
      console.log('approveJoinWallet cancelled');
      setPhase(3); // Set phase to 3 for error
    }
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
              {phase === 0 && (
                <>
                  <ParametersStyled>
                    <div style={{ marginBottom: '20px', width: '100%' }}>
                      <TextInput
                        label={t('SETTINGS.DIALOGS.ADD_DEVICE.REQUEST_ID')}
                        placeholder={t('SETTINGS.DIALOGS.ADD_DEVICE.REQUEST_ID_PLACEHOLDER')}
                        value={requestId}
                        setValue={setRequestId}
                      />
                    </div>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <ActionButton
                        caption={t('SETTINGS.DIALOGS.ADD_DEVICE.CHECK_REQUEST_ID')}
                        onClick={handleCheckRequestId}
                        disabled={!requestId}
                        isDialog={true}
                      />
                    </div>
                  </ParametersStyled>
                </>
              )}
              {phase === 1 && decodedData && (
                <>
                  <ParametersStyled>
                    <div style={{ width: '278px' }}>
                      <div style={{ marginBottom: '32px' }}>
                        <Typography style={{ fontSize: '25px', width: '100%' }}>
                          {t('SETTINGS.DIALOGS.ADD_DEVICE.DEVICE_INFO')}
                        </Typography>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          gap: '10px',
                          width: '100%',
                          alignItems: 'center',
                          marginBottom: '16px',
                        }}
                      >
                        <Typography variant="h6" color="text.secondary">
                          {t('SETTINGS.DIALOGS.ADD_DEVICE.DEVICE_TYPE')}:
                        </Typography>
                        <Typography variant="h6" color="text.primary">
                          {decodedData.platform === 'mobile'
                            ? t('SETTINGS.DIALOGS.ADD_DEVICE.DEVICE_TYPE_MOBILE')
                            : decodedData.platform === 'desktop'
                              ? t('SETTINGS.DIALOGS.ADD_DEVICE.DEVICE_TYPE_DESKTOP')
                              : t('SETTINGS.DIALOGS.ADD_DEVICE.DEVICE_TYPE_UNKNOWN')}
                        </Typography>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          gap: '10px',
                          width: '100%',
                          alignItems: 'center',
                          marginBottom: '16px',
                        }}
                      >
                        <Typography variant="h6" color="text.secondary">
                          {t('SETTINGS.DIALOGS.ADD_DEVICE.EMAIL')}:
                        </Typography>
                        <Typography
                          variant="h6"
                          color="text.primary"
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {decodedData.email}
                        </Typography>
                      </div>
                      <div style={{ marginTop: '56px', marginBottom: '25px', width: '100%' }}>
                        <div style={{ width: '100%' }}>
                          <style>
                            {`
                              .approve-device-button .MuiButton-root {
                                width: 100%;
                              }
                            `}
                          </style>
                          <div className="approve-device-button" style={{ width: '100%' }}>
                            <ActionButton
                              caption={t('SETTINGS.DIALOGS.ADD_DEVICE.APPROVE_DEVICE')}
                              onClick={() => addDevice()}
                              isDialog={true}
                            />
                          </div>
                        </div>
                      </div>
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Button
                          sx={{
                            textTransform: 'none',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            lineHeight: 1.43,
                            letterSpacing: '0.01071em',
                          }}
                          onClick={resetBeforeClose}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </ParametersStyled>
                </>
              )}
              {phase === 2 && (
                <>
                  <ParametersStyled>
                    <div style={{ width: '100%', textAlign: 'center' }}>
                      <div
                        style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                      >
                        <IconWrapperStyled style={{ marginBottom: '24px' }}>
                          <img src={VSignIcon} alt="Success" />
                        </IconWrapperStyled>
                        <Typography style={{ fontSize: '25px', width: '100%', marginBottom: '8px' }}>
                          {t('SETTINGS.DIALOGS.ADD_DEVICE.SUCCESS_TITLE')}
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                          {t('SETTINGS.DIALOGS.ADD_DEVICE.SUCCESS_SUBTITLE')}
                        </Typography>
                      </div>
                    </div>
                  </ParametersStyled>
                </>
              )}
              {phase === 3 && (
                <>
                  <ParametersStyled>
                    <div style={{ width: '100%', textAlign: 'center' }}>
                      <div
                        style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                      >
                        <IconWrapperStyled style={{ marginBottom: '24px' }}>
                          <img src={CloseSignIcon} alt="Success" />
                        </IconWrapperStyled>
                        <Typography style={{ fontSize: '25px', width: '100%', marginBottom: '8px' }}>
                          {t('SETTINGS.DIALOGS.ADD_DEVICE.FAILED_TITLE')}
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                          {t('SETTINGS.DIALOGS.ADD_DEVICE.FAILED_SUBTITLE')}
                        </Typography>
                      </div>
                    </div>
                  </ParametersStyled>
                </>
              )}
            </>
          ) : (
            <LoadingPage></LoadingPage>
          )}
        </div>
      </RootStyled>
    </Dialog>
  );
});
