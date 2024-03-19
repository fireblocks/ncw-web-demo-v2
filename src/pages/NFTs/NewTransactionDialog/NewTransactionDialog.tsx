import React from 'react';
import { TFeeLevel } from '@api';
import { Dialog, TextInput, styled } from '@foundation';
import { NFTTokenStore, useAccountsStore, useDeviceStore, useTransactionsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { FeeLevel } from '../../common/FeeLevel';
import { SelectedToken } from './SelectedToken';

const RootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
}));

interface IProps {
  token?: NFTTokenStore;
  isOpen: boolean;
  onClose: () => void;
}

export const NewTransactionDialog: React.FC<IProps> = observer(function NewTransactionDialog({
  token,
  isOpen,
  onClose,
}) {
  const { t } = useTranslation();
  const transactionsStore = useTransactionsStore();
  const deviceStore = useDeviceStore();
  const accountsStore = useAccountsStore();

  const [address, setAddress] = React.useState('');
  const [feeLevel, setFeeLevel] = React.useState('LOW');

  const clearState = () => {
    setAddress('');
    setFeeLevel('LOW');
  };

  const createNewTransaction = () => {
    transactionsStore
      .createTransaction({
        note: `API Transaction by ${deviceStore.deviceId}`,
        accountId: `${accountsStore.currentAccount?.accountId}`,
        assetId: `${token?.id}`,
        destAddress: address,
        estimateFee: false,
        feeLevel: feeLevel as TFeeLevel,
        amount: '1',
      })
      .then(() => {
        onClose();
        clearState();
      })
      .catch(() => {});
  };

  if (!token) {
    return null;
  }

  return (
    <Dialog
      size="small"
      title={t('NFT.NEW_TRANSACTION_DIALOG.TITLE')}
      description={t('NFT.NEW_TRANSACTION_DIALOG.DESCRIPTION')}
      isOpen={isOpen}
      onClose={onClose}
      doAction={createNewTransaction}
      actionCaption={t('NFT.NEW_TRANSACTION_DIALOG.ACTION')}
      disableAction={!address}
    >
      <RootStyled>
        <SelectedToken token={token} />
        <TextInput
          placeholder={t('NFT.NEW_TRANSACTION_DIALOG.RECEIVING_ADDRESS')}
          label={t('NFT.NEW_TRANSACTION_DIALOG.RECEIVING_ADDRESS')}
          value={address}
          setValue={setAddress}
        />
        <FeeLevel setLevel={setFeeLevel} level={feeLevel} />
      </RootStyled>
    </Dialog>
  );
});
