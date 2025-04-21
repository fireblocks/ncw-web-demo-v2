import React from 'react';
import { TNewTransactionMode, TFeeLevel } from '@api';
import { AddressField, AssetAmountInput, Dialog, QRField, TextInput, styled } from '@foundation';
import { AssetStore, localizedCurrencyView, useAccountsStore, useDeviceStore, useTransactionsStore } from '@store';
import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
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
  const { enqueueSnackbar } = useSnackbar();

  const [amount, setAmount] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [feeLevel, setFeeLevel] = React.useState('LOW');
  const [txType, setTxType] = React.useState('TRANSFER');
  const [isAmountTooHigh, setIsAmountTooHigh] = React.useState(false);
  const [isCreatingTransfer, setIsCreatingTransfer] = React.useState(false);

  React.useEffect(() => {
    if (asset?.totalBalance === 0) {
      setTxType('TYPED_MESSAGE');
    } else {
      setTxType('TRANSFER');
    }
  }, [asset]);

  React.useEffect(() => {
    if (!amount || !asset?.totalBalance) {
      setIsAmountTooHigh(false);
      return;
    }

    const amountValue = parseFloat(amount);
    const balanceValue = asset.totalBalance;

    setIsAmountTooHigh(amountValue > balanceValue);
  }, [amount, asset?.totalBalance]);

  const clearState = () => {
    setAmount('');
    setAddress('');
    setFeeLevel('LOW');
  };

  const shouldDisableAction = (
    txType === 'TRANSFER' &&
    mode === 'SEND' &&
    (!amount || !address || isAmountTooHigh)
  ) || isCreatingTransfer;


    const createNewTransaction = () => {
    setIsCreatingTransfer(true);
    if (txType === 'TRANSFER') {
      transactionsStore
        .createTransaction({
          note: `API Transaction by ${deviceStore.deviceId}`,
          accountId: accountsStore.currentAccount?.accountId.toString() || '0',
          assetId: asset?.id || '',
          destAddress: address,
          estimateFee: false,
          feeLevel: feeLevel as TFeeLevel,
          amount,
        })
        .then(() => {
          onClose();
          clearState();
          setIsCreatingTransfer(false);
          enqueueSnackbar(t('ASSETS.NEW_TRANSACTION_DIALOG.SUCCESS_MESSAGE'), { variant: 'success' });
        })
        .catch(() => {
          setIsCreatingTransfer(false);
          enqueueSnackbar(t('ASSETS.NEW_TRANSACTION_DIALOG.ERROR_MESSAGE'), { variant: 'error' });
        });
    } else {
      transactionsStore
        .createTransaction()
        .then(() => {
          onClose();
          setIsCreatingTransfer(false);
          clearState();
          enqueueSnackbar(t('ASSETS.NEW_TRANSACTION_DIALOG.SUCCESS_MESSAGE'), { variant: 'success' });
        })
        .catch(() => {
          setIsCreatingTransfer(false);
          enqueueSnackbar(t('ASSETS.NEW_TRANSACTION_DIALOG.ERROR_MESSAGE'), { variant: 'error' });
        });
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
      onClose={() => {
        onClose();
        clearState();
      }}
      doAction={mode === 'SEND' ? createNewTransaction : undefined}
      disableAction={shouldDisableAction}
      actionCaption={t('ASSETS.NEW_TRANSACTION_DIALOG.ACTION')}
    >
      <RootStyled>
        <SelectedAsset asset={asset} />
        {mode === 'SEND' ? (
          <>
            <TxType setType={setTxType} type={txType} disabled={asset?.totalBalance === 0} />
            <AssetAmountInput
              disabled={txType !== 'TRANSFER'}
              placeholder="0"
              label={t('ASSETS.NEW_TRANSACTION_DIALOG.AMOUNT')}
              value={amount}
              setValue={setAmount}
              assetSymbol={asset.symbol}
              adornment={convertedAmount}
            />
            <TextInput
              disabled={txType !== 'TRANSFER'}
              placeholder={t('ASSETS.NEW_TRANSACTION_DIALOG.RECEIVING_ADDRESS')}
              label={t('ASSETS.NEW_TRANSACTION_DIALOG.RECEIVING_ADDRESS')}
              value={address}
              setValue={setAddress}
            />
            <FeeLevel setLevel={setFeeLevel} level={feeLevel} disabled={txType !== 'TRANSFER'} />
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
