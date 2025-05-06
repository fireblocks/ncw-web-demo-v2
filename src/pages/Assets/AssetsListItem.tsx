import React, { useMemo } from 'react';
import { TNewTransactionMode } from '@api';
import {
  CopyText,
  TableBalanceCell,
  TableCell,
  TableChangeCell,
  TableRow,
  TableTextCell,
  TableTitleCell,
  TableTransferCell,
  styled,
} from '@foundation';
import IconNoAsset from '@icons/no_asset_image.svg';
import { AssetStore } from '@store';
import { observer } from 'mobx-react';

export const RowStyled = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr 0.7fr 0.7fr 0.7fr 0.7fr 1fr 0.6fr',
  columnGap: theme.spacing(2), // Add spacing between columns
}));

interface IProps {
  index: number;
  style: React.CSSProperties;
  selectedAssetId: string | null;
  filteredAssets: AssetStore[];
  setSelectedAssetId: (id: string | null) => void;
  setTransactionDialogMode: (mode: TNewTransactionMode) => void;
  onNewTransactionDialogOpen: () => void;
}

export const AssetsListItem: React.FC<IProps> = observer(function AssetsListItem({
  index,
  style,
  selectedAssetId,
  filteredAssets,
  setSelectedAssetId,
  setTransactionDialogMode,
  onNewTransactionDialogOpen,
}) {
  const currentAsset = filteredAssets[index];

  const titleCellProps = useMemo(
    () => ({
      title: currentAsset.name,
      subtitle: currentAsset.symbol,
      iconUrl: currentAsset.iconUrl || IconNoAsset,
      assetSymbol: currentAsset.networkProtocol || IconNoAsset, // Pass the network protocol for the secondary icon
    }),
    [currentAsset.name, currentAsset.symbol, currentAsset.iconUrl, currentAsset.networkProtocol],
  );

  // Generate a random number between -5 and 20 for the 24H change
  const change24h = useMemo(() => {
    // Use the asset ID as a seed for the random number to ensure consistency
    const seed = parseInt(currentAsset.id.replace(/\D/g, '') || '0', 10);
    // Use Math.abs to ensure we get a positive value before taking modulo
    const random = Math.abs(Math.sin(seed) * 10000);
    // Get a value between 0 and 25, then adjust to range from -5 to 20
    return (random % 25) - 5; // Range from -5 to 20
  }, [currentAsset.id]);

  // Generate a random market cap value in billions
  const marketCap = useMemo(() => {
    // Use a different seed for market cap to ensure different values
    const seed = parseInt(currentAsset.id.replace(/\D/g, '') || '0', 10) + 1000;
    // Generate a random value between 1 and 2000 billion
    const randomBillions = Math.abs(Math.sin(seed) * 10000) % 2000 + 1;
    // Convert to actual value (multiply by 1 billion)
    return randomBillions * 1000000000;
  }, [currentAsset.id]);

  // Format market cap as a dollar amount with commas
  const formattedMarketCap = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(marketCap);
  }, [marketCap]);

  // Generate a random 24H volume value in millions
  const volume24h = useMemo(() => {
    // Use a different seed for 24H volume to ensure different values
    const seed = parseInt(currentAsset.id.replace(/\D/g, '') || '0', 10) + 2000;
    // Generate a random value between 1 and 1000 million
    const randomMillions = Math.abs(Math.sin(seed) * 10000) % 1000 + 1;
    // Convert to actual value (multiply by 1 million)
    return randomMillions * 1000000;
  }, [currentAsset.id]);

  // Format 24H volume as a dollar amount with commas
  const formattedVolume24h = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(volume24h);
  }, [volume24h]);

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
          <TableTitleCell {...titleCellProps} />
          <TableBalanceCell balance={currentAsset.totalBalance} balanceInUsd={currentAsset.totalBalanceInUSD} />
          <TableTextCell text={currentAsset.rate} />
          <TableChangeCell change={change24h} />
          <TableTextCell text={formattedMarketCap} />
          <TableTextCell text={formattedVolume24h} />
          <TableCell>
            <CopyText text={currentAsset.address} />
          </TableCell>
          {currentAsset.id === selectedAssetId ? (
            <TableTransferCell
              onSend={() => {
                setTransactionDialogMode('SEND');
                onNewTransactionDialogOpen();
              }}
              onReceive={() => {
                setTransactionDialogMode('RECEIVE');
                onNewTransactionDialogOpen();
              }}
            />
          ) : (
            <TableTextCell text={currentAsset.baseAsset} />
          )}
        </RowStyled>
      </TableRow>
    </div>
  );
});
