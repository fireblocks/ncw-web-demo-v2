import React from 'react';
import { TNewTransactionMode, TFeeLevel } from '@api';
import { AddressField, AssetAmountInput, Dialog, QRField, TextInput, styled, Typography } from '@foundation';
import { top100Cryptos } from '@services';
import { AssetStore, useAccountsStore, useDeviceStore, useTransactionsStore } from '@store';
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

  const shouldDisableAction =
    (txType === 'TRANSFER' &&
      mode === 'SEND' &&
      (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || !address || isAmountTooHigh)) ||
    isCreatingTransfer;

  const createNewTransaction = () => {
    setIsCreatingTransfer(true);
    if (txType === 'TRANSFER') {
      transactionsStore
        .createTransaction({
          operation: 'TRANSFER',
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
        .createTransaction({
          operation: 'TYPED_MESSAGE',
          note: `API Transaction by ${deviceStore.deviceId}`,
          accountId: accountsStore.currentAccount?.accountId.toString() || '0',
          assetId: asset?.id || '',
          estimateFee: false,
          feeLevel: feeLevel as TFeeLevel,
        })
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

  // Get price from top100Cryptos based on asset symbol, myRate --> (true) do we want to calculate the amount based
  // on what we have in our wallet or (false) based on the amount entered in the text input amount
  const getAssetPriceFromTop100Cryptos = (assetItem: any, myRate = true) => {
    if (!assetItem) return '--';

    // Get the price from top100Cryptos using the asset symbol
    const symbol = assetItem.symbol.toUpperCase();
    let cryptoData = top100Cryptos[symbol];

    // If not found, try to find it by name
    if (!cryptoData) {
      // Try to find a match by comparing the asset name with the titles in top100Cryptos
      const assetNameLower = assetItem.name.toLowerCase();

      // Find a matching cryptocurrency by comparing the asset name with the titles in top100Cryptos
      const matchingSymbol = Object.keys(top100Cryptos).find((key) => {
        const cryptoTitle = top100Cryptos[key].title.toLowerCase();
        return assetNameLower.includes(cryptoTitle) || cryptoTitle.includes(assetNameLower);
      });

      if (matchingSymbol) {
        cryptoData = top100Cryptos[matchingSymbol];
      }
    }

    // If we don't have price data for this coin, return assetItem.rate as fallback
    if (!cryptoData) {
      return assetItem.rate;
    }

    const price = cryptoData.price;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount && !myRate ? price * Number(amount) : price * assetItem.totalBalance);
  };

  if (!asset) {
    return null;
  }

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
        <Typography component="p" color="text.secondary" variant="subtitle1" style={{ marginBottom: '5px' }}>
          Asset
        </Typography>
        <SelectedAsset asset={asset} rate={getAssetPriceFromTop100Cryptos(asset)} />
        {mode === 'SEND' ? (
          <>
            <TxType setType={setTxType} type={txType} disabled={asset?.totalBalance === 0} />
            <AssetAmountInput
              disabled={txType !== 'TRANSFER'}
              placeholder={'0' + ' ' + asset.symbol}
              label={t('ASSETS.NEW_TRANSACTION_DIALOG.AMOUNT')}
              value={amount}
              setValue={setAmount}
              assetSymbol={asset.symbol}
              adornment={Number(amount) > 0 ? getAssetPriceFromTop100Cryptos(asset, false) : asset.rate}
            />
            <TextInput
              disabled={txType !== 'TRANSFER'}
              placeholder={t('ASSETS.NEW_TRANSACTION_DIALOG.RECEIVING_ADDRESS')}
              label={t('ASSETS.NEW_TRANSACTION_DIALOG.SEND_TO')}
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
