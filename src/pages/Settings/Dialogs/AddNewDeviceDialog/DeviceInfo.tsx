/**
 * DeviceInfo component for displaying and approving device information
 */
import React from 'react';
import { Typography, ActionButton } from '@foundation';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  ParametersStyled,
  DeviceInfoContainerStyled,
  DeviceInfoHeaderStyled,
  DeviceInfoRowStyled,
  ActionButtonContainerStyled,
} from './styled';
import { IDeviceInfoProps } from './types';

export const DeviceInfo: React.FC<IDeviceInfoProps> = ({ decodedData, addDevice, onCancel }) => {
  const { t } = useTranslation();

  return (
    <ParametersStyled>
      <DeviceInfoContainerStyled>
        <DeviceInfoHeaderStyled>
          <Typography style={{ fontSize: '25px', width: '100%' }}>
            {t('SETTINGS.DIALOGS.ADD_DEVICE.DEVICE_INFO')}
          </Typography>
        </DeviceInfoHeaderStyled>

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

        {/* Approve Button */}
        <ActionButtonContainerStyled>
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
        </ActionButtonContainerStyled>

        {/* Cancel Button */}
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
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </DeviceInfoContainerStyled>
    </ParametersStyled>
  );
};
