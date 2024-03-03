import React from 'react';
import { AssetAmountInput, Dialog, TextInput, styled } from '@foundation';
import { AssetStore, localizedCurrencyView } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { TNewTransactionMode } from '@api';
import { SelectedAsset } from './SelectedAsset';
import { QRBlock } from './QRBlock';
import { FeeLevel } from './FeeLevel';

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

  const [amount, setAmount] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [_, setFeeLevel] = React.useState('LOW');

  const clearSelections = () => {
    setAmount('');
    setAddress('');
  };

  const handleDialogClose = () => {
    onClose();
    clearSelections();
  };

  React.useEffect(() => {
    if (mode === 'RECEIVE') {
      setAddress(asset?.address || '');
    }
  }, [mode]);

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
      onClose={handleDialogClose}
      doAction={mode === 'SEND' ? () => {} : undefined}
      actionCaption={t('ASSETS.NEW_TRANSACTION_DIALOG.ACTION')}
    >
      <RootStyled>
        <SelectedAsset asset={asset} />
        {mode === 'SEND' ? (
          <>
            <AssetAmountInput
              placeholder="0"
              label={t('ASSETS.NEW_TRANSACTION_DIALOG.AMOUNT')}
              value={amount}
              setValue={setAmount}
              assetSymbol={asset?.symbol}
              adornment={convertedAmount}
            />

            <TextInput
              placeholder={t('ASSETS.NEW_TRANSACTION_DIALOG.RECEIVING_ADDRESS')}
              label={t('ASSETS.NEW_TRANSACTION_DIALOG.RECEIVING_ADDRESS')}
              value={address}
              setValue={setAddress}
            />

            <FeeLevel setLevel={setFeeLevel} />
          </>
        ) : (
          <>
            <TextInput
              readonly
              placeholder={t('ASSETS.NEW_TRANSACTION_DIALOG.RECEIVING_ADDRESS')}
              label={t('ASSETS.NEW_TRANSACTION_DIALOG.RECEIVING_ADDRESS')}
              value={address}
              setValue={setAddress}
            />

            <QRBlock value={address} />
          </>
        )}
      </RootStyled>
    </Dialog>
  );
});
