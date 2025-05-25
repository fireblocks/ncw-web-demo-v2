import React from 'react';
import IconApple from '@icons/apple.svg';
import IconGoogle from '@icons/google.svg';
import { useTranslation } from 'react-i18next';
import { ActionPlate } from '../ActionPlate';
import { RootStyled } from './styles';

interface LoginOptionsUIProps {
  onAppleLogin: () => void;
  onGoogleLogin: () => void;
}

export const LoginOptionsUI: React.FC<LoginOptionsUIProps> = ({ onAppleLogin, onGoogleLogin }) => {
  const { t } = useTranslation();

  return (
    <RootStyled>
      <ActionPlate iconSrc={IconApple} caption={t('LOGIN.SIGN_IN_WITH_APPLE')} onClick={onAppleLogin} />
      <ActionPlate iconSrc={IconGoogle} caption={t('LOGIN.SIGN_IN_WITH_GOOGLE')} onClick={onGoogleLogin} />
    </RootStyled>
  );
};
