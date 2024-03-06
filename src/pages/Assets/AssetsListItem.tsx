import React from 'react';
import { TNewTransactionMode } from '@api';
import {
  CopyText,
  TableBalanceCell,
  TableCell,
  TableRow,
  TableTextCell,
  TableTitleCell,
  TableTransferCell,
  styled,
} from '@foundation';
import { useAssetsStore } from '@store';
import { observer } from 'mobx-react';

export const RowStyled = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr 0.7fr 1fr 1fr',
}));

interface IProps {
  index: number;
  style: React.CSSProperties;
  selectedAssetId: string | null;
  setSelectedAssetId: (id: string | null) => void;
  setTransactionDialogMode: (mode: TNewTransactionMode) => void;
  onNewTransactionDialogOpen: () => void;
}

export const AssetsListItem: React.FC<IProps> = observer(function AssetsListItem({
  index,
  style,
  selectedAssetId,
  setSelectedAssetId,
  setTransactionDialogMode,
  onNewTransactionDialogOpen,
}) {
  const assetsStore = useAssetsStore();

  const currentAsset = assetsStore.myAssetsSortedByBalanceInUSD[index];

  return (
    <div
      key={currentAsset.id}
      style={style}
      onMouseEnter={() => {
        setSelectedAssetId(currentAsset.id);
      }}
      onMouseLeave={() => {
        setSelectedAssetId(null);
      }}
    >
      <TableRow>
        <RowStyled>
          <TableTitleCell title={currentAsset.name} subtitle={currentAsset.symbol} iconUrl={currentAsset.iconUrl} />
          <TableBalanceCell balance={currentAsset.totalBalance} balanceInUsd={currentAsset.totalBalanceInUSD} />
          <TableTextCell text={currentAsset.rate} />
          <TableCell>
            <CopyText text={currentAsset.address} />
          </TableCell>
          {selectedAssetId === currentAsset.id ? (
            <TableTransferCell
              onSend={() => {
                setTransactionDialogMode('SEND');
                onNewTransactionDialogOpen();
              }}
              onReceive={() => {
                setTransactionDialogMode('RECEIVE');
                onNewTransactionDialogOpen();
              }}
              totalBalance={currentAsset.totalBalance}
            />
          ) : (
            <TableTextCell text={currentAsset.baseAsset} />
          )}
        </RowStyled>
      </TableRow>
    </div>
  );
});
