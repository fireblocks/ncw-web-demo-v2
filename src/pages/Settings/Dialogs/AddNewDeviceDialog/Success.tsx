/**
 * Success component for displaying success message after device approval
 */
import React from 'react';
import { Typography } from '@foundation';
import VSignIcon from '@icons/v-sign.svg';
import { useTranslation } from 'react-i18next';
import { ParametersStyled, ResultMessageContainerStyled, ResultContentStyled, IconWrapperStyled } from './styled';
import { ISuccessProps } from './types';

export const Success: React.FC<ISuccessProps> = () => {
  const { t } = useTranslation();

  return (
    <ParametersStyled>
      <ResultMessageContainerStyled>
        <ResultContentStyled>
          <IconWrapperStyled style={{ marginBottom: '24px' }}>
            <img src={VSignIcon} alt="Success" />
          </IconWrapperStyled>
          <Typography style={{ fontSize: '25px', width: '100%', marginBottom: '8px' }}>
            {t('SETTINGS.DIALOGS.ADD_DEVICE.SUCCESS_TITLE')}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {t('SETTINGS.DIALOGS.ADD_DEVICE.SUCCESS_SUBTITLE')}
          </Typography>
        </ResultContentStyled>
      </ResultMessageContainerStyled>
    </ParametersStyled>
  );
};
