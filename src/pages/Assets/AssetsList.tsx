import React from 'react';
import { TNewTransactionMode } from '@api';
import {
  CopyText,
  Skeleton,
  Table,
  TableBalanceCell,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableTextCell,
  TableTitleCell,
  TableTransferCell,
  styled,
} from '@foundation';
import { AssetStore, useAssetsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { NewTransactionDialog } from './NewTransactionDialog/NewTransactionDialog';

const RowStyled = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr 0.7fr 1fr 1fr',
}));

export const AssetsList: React.FC = observer(function AssetsList() {
  const assetsStore = useAssetsStore();
  const { t } = useTranslation();

  const [selectedAssetId, setSelectedAssetId] = React.useState<string | null>(null);
  const [selectedAssetStore, setSelectedAssetStore] = React.useState<AssetStore | undefined>(undefined);

  const [isNewTransactionDialogOpen, setIsNewTransactionDialogOpen] = React.useState(false);
  const [transactionDialogMode, setTransactionDialogMode] = React.useState<TNewTransactionMode>(null);

  const onNewTransactionDialogOpen = () => {
    setIsNewTransactionDialogOpen(true);
    if (selectedAssetId) {
      setSelectedAssetStore(assetsStore.getAssetById(selectedAssetId));
    }
  };

  const onNewTransactionDialogClose = () => {
    setIsNewTransactionDialogOpen(false);
  };

  if (assetsStore.isLoading && !assetsStore.myAssets.length) {
    return (
      <Table>
        <Skeleton mode="TABLE" />
      </Table>
    );
  }

  return (
    <Table>
      <TableHead>
        <RowStyled>
          <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.CURRENCY')} />
          <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.BALANCE')} />
          <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.PRICE')} />
          <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.ADDRESS')} />
          <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.BASE_ASSET')} />
        </RowStyled>
      </TableHead>
      <TableBody>
        {assetsStore.myAssetsSortedByBalanceInUSD.map((a) => (
          <TableRow key={a.id}>
            <RowStyled
              onMouseEnter={() => {
                setSelectedAssetId(a.id);
              }}
              onMouseLeave={() => {
                setSelectedAssetId(null);
              }}
            >
              <TableTitleCell title={a.name} subtitle={a.symbol} iconUrl={a.iconUrl} />
              <TableBalanceCell balance={a.totalBalance} balanceInUsd={a.totalBalanceInUSD} />
              <TableTextCell text={a.rate} />
              <TableCell>
                <CopyText text={a.address} />
              </TableCell>
              {selectedAssetId === a.id ? (
                <TableTransferCell
                  onSend={() => {
                    setTransactionDialogMode('SEND');
                    onNewTransactionDialogOpen();
                  }}
                  onReceive={() => {
                    setTransactionDialogMode('RECEIVE');
                    onNewTransactionDialogOpen();
                  }}
                  totalBalance={a.totalBalance}
                />
              ) : (
                <TableTextCell text={a.baseAsset} />
              )}
            </RowStyled>
          </TableRow>
        ))}
      </TableBody>

      <NewTransactionDialog
        isOpen={isNewTransactionDialogOpen}
        onClose={onNewTransactionDialogClose}
        mode={transactionDialogMode}
        asset={selectedAssetStore}
      />
    </Table>
  );
});
