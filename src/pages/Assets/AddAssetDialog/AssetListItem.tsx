import React from 'react';
import { ActionButton, Progress, TableCell, TableRow, TableTitleCell, styled } from '@foundation';
import IconNoAsset from '@icons/no_asset_image.svg';
import { AssetStore, useAssetsStore } from '@store';
import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

const RowStyled = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '1fr 130px',
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
          <TableTitleCell
            title={currentAsset.name}
            subtitle={currentAsset.symbol}
            iconUrl={currentAsset.iconUrl || IconNoAsset}
          />
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
