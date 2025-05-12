import React, { useMemo } from 'react';
import { ActionButton, Progress, TableCell, TableRow, TableTextCell, TableTitleCell, styled } from '@foundation';
import IconNoAsset from '@icons/no_asset_image.svg';
import { top100Cryptos } from '@services';
import { AssetStore, NOT_AVAILABLE_PLACEHOLDER, useAssetsStore } from '@store';
import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

const RowStyled = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '250px 100px 130px',
  columnGap: theme.spacing(2), // Add spacing between columns
  '& > *': {
    maxWidth: '100%', // Ensure each child has max width
    overflow: 'hidden', // Hide overflow
  },
}));

interface IProps {
  index: number;
  filteredAssets: AssetStore[];
  style: React.CSSProperties;
  onDialogClose: () => void;
}

export const AssetListItem: React.FC<IProps> = observer(function AssetListItem({
  index,
  style,
  filteredAssets,
  onDialogClose,
}) {
  const { t } = useTranslation();
  const assetsStore = useAssetsStore();
  const { enqueueSnackbar } = useSnackbar();
  const [hoveredLine, setHoveredLine] = React.useState<string | null>(null);
  const [isAddingAsset, setIsAddingAsset] = React.useState(false);

  const currentAsset = filteredAssets[index];

  const handleAddAsset = (assetId: string) => {
    setIsAddingAsset(true);
    assetsStore
      .addAsset(assetId)
      .then(() => {
        onDialogClose();
        setIsAddingAsset(false);
        enqueueSnackbar(t('ASSETS.ADD_DIALOG.SUCCESS_MESSAGE'), { variant: 'success' });
      })
      .catch(() => {
        setIsAddingAsset(false);
        enqueueSnackbar(t('ASSETS.ADD_DIALOG.ERROR_MESSAGE'), { variant: 'error' });
      });
  };

  const titleCellProps = useMemo(
    () => ({
      title: currentAsset.name,
      subtitle: currentAsset.symbol,
      iconUrl: currentAsset.iconUrl || IconNoAsset,
    }),
    [currentAsset.name, currentAsset.symbol, currentAsset.iconUrl],
  );

  // Get the price for the current asset from top100Cryptos
  const formattedPrice = useMemo(() => {
    // Get the price from top100Cryptos using the asset symbol
    // Try different variations of the symbol to find a match
    const symbol = currentAsset.symbol.toUpperCase();
    let cryptoData = top100Cryptos[symbol];

    // If not found, try to find it by name
    if (!cryptoData) {
      // Log the symbol for debugging
      console.log('Symbol not found in top100Cryptos:', symbol);

      // Try to find a match by comparing the asset name with the titles in top100Cryptos
      const assetNameLower = currentAsset.name.toLowerCase();

      // Find a matching cryptocurrency by comparing the asset name with the titles in top100Cryptos
      const matchingSymbol = Object.keys(top100Cryptos).find(key => {
        const cryptoTitle = top100Cryptos[key].title.toLowerCase();
        return assetNameLower.includes(cryptoTitle) || cryptoTitle.includes(assetNameLower);
      });

      if (matchingSymbol) {
        cryptoData = top100Cryptos[matchingSymbol];
      }
    }

    // If we don't have price data for this coin, return placeholder instead of "$0"
    if (!cryptoData) {
      return NOT_AVAILABLE_PLACEHOLDER;
    }

    const price = cryptoData.price;

    // Format the price as a dollar amount with commas
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  }, [currentAsset.symbol, currentAsset.name]);

  return (
    <div
      style={style}
      key={currentAsset.id}
      onMouseEnter={() => {
        setHoveredLine(currentAsset.id);
      }}
      onMouseLeave={() => {
        setHoveredLine(null);
      }}
    >
      <TableRow>
        <RowStyled>
          <TableTitleCell {...titleCellProps} />
          <TableTextCell text={formattedPrice} />
          <TableCell>
            {hoveredLine === currentAsset.id ? (
              <>
                {isAddingAsset ? (
                  <Progress size="small" />
                ) : (
                  <ActionButton
                    isDialog
                    caption={t('ASSETS.ADD')}
                    onClick={() => {
                      handleAddAsset(currentAsset.id);
                    }}
                  />
                )}
              </>
            ) : null}
          </TableCell>
        </RowStyled>
      </TableRow>
    </div>
  );
});
