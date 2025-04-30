/**
 * Error component for displaying error message after device approval failure
 */
import React from 'react';
import { Typography, ActionButton } from '@foundation';
import { useTranslation } from 'react-i18next';
import CloseSignIcon from '@icons/close-icon.svg';
import { IErrorProps } from './types';
import { 
  ParametersStyled, 
  ResultMessageContainerStyled, 
  ResultContentStyled,
  IconWrapperStyled 
} from './styled';

export const Error: React.FC<IErrorProps> = ({ tryAgain }) => {
  const { t } = useTranslation();

  return (
    <ParametersStyled>
      <ResultMessageContainerStyled>
        <ResultContentStyled>
          <IconWrapperStyled style={{ marginBottom: '24px' }}>
            <img src={CloseSignIcon} alt="Error" />
          </IconWrapperStyled>
          <Typography style={{ fontSize: '25px', width: '100%', marginBottom: '8px' }}>
            {t('SETTINGS.DIALOGS.ADD_DEVICE.FAILED_TITLE')}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {t('SETTINGS.DIALOGS.ADD_DEVICE.FAILED_SUBTITLE')}
          </Typography>
        </ResultContentStyled>
        
        <div style={{ marginTop: '32px', marginBottom: '25px', width: '100%' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <style>
              {`
                .try-again-button .MuiButton-root {
                  width: 100%;
                }
              `}
            </style>
            <div className="try-again-button" style={{ width: '156px' }}>
              <ActionButton
                caption={t('SETTINGS.DIALOGS.ADD_DEVICE.TRY_AGAIN')}
                onClick={tryAgain}
                isDialog={true}
              />
            </div>
          </div>
        </div>
      </ResultMessageContainerStyled>
    </ParametersStyled>
  );
};
