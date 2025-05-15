import React from 'react';
import { useTranslation } from 'react-i18next';
import IconWallet from '@icons/join_existing_wallet.svg';
import IconRecovery from '@icons/recover.svg';
import IconKey from '@icons/key.svg';
import { ActionPlate } from '../ActionPlate';
import { RootStyled } from './styles';

interface WalletGenerationOptionsUIProps {
  isEmbeddedWallet: boolean;
  hasBackup: boolean;
  joinExistingWallet: () => void;
  recoverMPCKeys: () => void;
  generateMPCKeys: () => void;
}

export const WalletGenerationOptionsUI: React.FC<WalletGenerationOptionsUIProps> = ({
  isEmbeddedWallet,
  hasBackup,
  joinExistingWallet,
  recoverMPCKeys,
  generateMPCKeys,
}) => {
  const { t } = useTranslation();

  return (
    <RootStyled>
      {isEmbeddedWallet && hasBackup && (
        // if we already have a backup we can't generate keys, so we need to allow 'join to existing wallet'
        <ActionPlate iconSrc={IconWallet} caption={t('LOGIN.JOIN_EXISTING_WALLET')} onClick={joinExistingWallet} />
      )}
      {hasBackup && (
        <ActionPlate iconSrc={IconRecovery} caption={t('LOGIN.RECOVERY_FROM_BACKUP')} onClick={recoverMPCKeys} />
      )}
      {((isEmbeddedWallet && !hasBackup) || !isEmbeddedWallet) && (
        // in an embedded wallet mode we can't generate keys if backup exists already OR not embedded wallet mode
        <ActionPlate iconSrc={IconKey} caption={t('LOGIN.GENERATE_MPC_KEYS')} onClick={generateMPCKeys} />
      )}
    </RootStyled>
  );
};
