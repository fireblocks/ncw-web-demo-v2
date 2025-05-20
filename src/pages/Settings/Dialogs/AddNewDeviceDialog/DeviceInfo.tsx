/**
 * DeviceInfo component for displaying and approving device information
 */
import React from 'react';
import { Typography, ActionButton, BlueButton } from '@foundation';
import ConfirmDeviceIcon from '@icons/confirm-device.svg';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ParametersStyled, DeviceInfoRowStyled } from './styled';
import { IDeviceInfoProps } from './types';

export const DeviceInfo: React.FC<IDeviceInfoProps> = ({ decodedData, addDevice, onCancel, isLoading = false }) => {
  const { t } = useTranslation();

  return (
    <ParametersStyled>
      {/* Two-column layout */}
      <div style={{ display: 'flex', width: '100%', marginBottom: '24px' }}>
        {/* First column - Icon */}
        <div style={{ width: '35%', display: 'flex', alignItems: 'flex-start' }}>
          <img
            src={ConfirmDeviceIcon}
            alt="Confirm Device"
            style={{ width: '118px', height: '118px', marginLeft: '42px' }}
          />
        </div>

        {/* Second column - Device Info */}
        <div style={{ flex: 1, paddingTop: '7px' }}>
          {/* Title */}
          <Typography style={{ fontSize: '25px', width: '100%', marginBottom: '16px' }}>
            {t('SETTINGS.DIALOGS.ADD_DEVICE.DEVICE_INFO')}
          </Typography>
          {/* Device Type Row */}
          <DeviceInfoRowStyled>
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
          </DeviceInfoRowStyled>

          {/* Email Row */}
          <DeviceInfoRowStyled>
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
          </DeviceInfoRowStyled>
        </div>
      </div>

      {/* Buttons row aligned to the right */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', width: '100%' }}>
        {/* Cancel Button */}
        <ActionButton caption="Cancel" onClick={onCancel} isDialog={true} secondary={true} disabled={isLoading} />

        {/* Add Device Button - Blue background with white text */}
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '150px' }}>
            <CircularProgress size={24} color="primary" />
          </div>
        ) : (
          <BlueButton
            caption={t('SETTINGS.DIALOGS.ADD_DEVICE.APPROVE_DEVICE')}
            onClick={addDevice}
            isDialog={true}
          />
        )}
      </div>
    </ParametersStyled>
  );
};
