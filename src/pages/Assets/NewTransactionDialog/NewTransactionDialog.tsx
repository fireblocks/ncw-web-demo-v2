import React from 'react';
import { TNewTransactionMode, TFeeLevel } from '@api';
import { AddressField, AssetAmountInput, Dialog, QRField, TextInput, styled } from '@foundation';
import { AssetStore, localizedCurrencyView, useAccountsStore, useDeviceStore, useTransactionsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { FeeLevel } from '../../common/FeeLevel';
import { SelectedAsset } from './SelectedAsset';
import { TxType } from './TxType';

const RootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
}));

interface IProps {
  mode: TNewTransactionMode;
  asset?: AssetStore;
  isOpen: boolean;
  onClose: () => void;
}

export const NewTransactionDialog: React.FC<IProps> = observer(function NewTransactionDialog({
  mode,
  asset,
  isOpen,
  onClose,
}) {
  const { t } = useTranslation();
  const transactionsStore = useTransactionsStore();
  const deviceStore = useDeviceStore();
  const accountsStore = useAccountsStore();

  const [amount, setAmount] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [feeLevel, setFeeLevel] = React.useState('LOW');
  const [txType, setTxType] = React.useState('TRANSFER');

  const clearState = () => {
    setAmount('');
    setAddress('');
    setFeeLevel('LOW');
    setTxType('TRANSFER');
  };

  const shouldDisableTransaction = txType === 'TRANSFER' && mode === 'SEND' && (!amount || !address);

  const createNewTransaction = () => {
    if (txType === 'TRANSFER') {
      transactionsStore
        .createTransaction({
          note: `API Transaction by ${deviceStore.deviceId}`,
          accountId: `${accountsStore.currentAccount?.accountId}`,
          assetId: `${asset?.id}`,
          destAddress: address,
          estimateFee: false,
          feeLevel: feeLevel as TFeeLevel,
          amount,
        })
        .then(() => {
          onClose();
          clearState();
        })
        .catch(() => {});
    } else {
      transactionsStore
        .createTransaction()
        .then(() => {
          onClose();
          clearState();
        })
        .catch(() => {});
    }
  };

  React.useEffect(() => {
    if (mode === 'RECEIVE') {
      setAddress(asset?.address || '');
    } else {
      clearState();
    }
  }, [mode, asset]);

  if (!asset) {
    return null;
  }

  const convertedAmount = asset.assetData.rate ? localizedCurrencyView(Number(amount) * asset.assetData.rate) : '--';

  return (
    <Dialog
      size="small"
      title={t(
        mode === 'RECEIVE' ? 'ASSETS.NEW_TRANSACTION_DIALOG.RECEIVE_TITLE' : 'ASSETS.NEW_TRANSACTION_DIALOG.SEND_TITLE',
      )}
      description={t('ASSETS.NEW_TRANSACTION_DIALOG.DESCRIPTION')}
      isOpen={isOpen}
      onClose={onClose}
      doAction={mode === 'SEND' ? createNewTransaction : undefined}
      disableAction={shouldDisableTransaction}
      actionCaption={t('ASSETS.NEW_TRANSACTION_DIALOG.ACTION')}
    >
      <RootStyled>
        <SelectedAsset asset={asset} />
        {mode === 'SEND' ? (
          <>
            <TxType setType={setTxType} type={txType} />
            {txType === 'TRANSFER' && (
              <>
                <AssetAmountInput
                  placeholder="0"
                  label={t('ASSETS.NEW_TRANSACTION_DIALOG.AMOUNT')}
                  value={amount}
                  setValue={setAmount}
                  assetSymbol={asset.symbol}
                  adornment={convertedAmount}
                />
                <TextInput
                  placeholder={t('ASSETS.NEW_TRANSACTION_DIALOG.RECEIVING_ADDRESS')}
                  label={t('ASSETS.NEW_TRANSACTION_DIALOG.RECEIVING_ADDRESS')}
                  value={address}
                  setValue={setAddress}
                />
                <FeeLevel setLevel={setFeeLevel} level={feeLevel} />
              </>
            )}
          </>
        ) : (
          <>
            <QRField label={t('ASSETS.NEW_TRANSACTION_DIALOG.QR_DETAILS')} value={address} />
            <AddressField address={address} label={t('ASSETS.NEW_TRANSACTION_DIALOG.RECEIVING_ADDRESS')} />
          </>
        )}
      </RootStyled>
    </Dialog>
  );
});
