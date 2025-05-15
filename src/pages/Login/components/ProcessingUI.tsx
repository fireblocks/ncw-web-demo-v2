import React from 'react';
import { Progress, Typography } from '@foundation';
import { useTranslation } from 'react-i18next';
import { ProcessingStyled } from './styles';

export const ProcessingUI: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ProcessingStyled>
      <Progress size="medium" />
      <Typography variant="body1" color="text.primary">
        {t('LOGIN.CHECKING_WORKSPACE')}
      </Typography>
    </ProcessingStyled>
  );
};
