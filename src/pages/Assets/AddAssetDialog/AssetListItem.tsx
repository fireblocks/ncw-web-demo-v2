import React from 'react';
import { Button, TableCell, TableRow, TableTextCell, TableTitleCell, styled } from '@foundation';
import { AssetStore, useAssetsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

const RowStyled = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '1.7fr 1fr 130px',
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
  const [hoveredLine, setHoveredLine] = React.useState<string | null>(null);
  const [isAddDisabled, setIsAddDisabled] = React.useState(false);

  const currentAsset = filteredAssets[index];

  const handleAddAsset = (assetId: string) => {
    setIsAddDisabled(true);
    assetsStore
      .addAsset(assetId)
      .then(() => {
        onDialogClose();
      })
      .catch(() => {})
      .finally(() => {
        setIsAddDisabled(false);
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
          <TableTitleCell title={currentAsset.name} subtitle={currentAsset.symbol} iconUrl={currentAsset.iconUrl} />
          <TableTextCell text={currentAsset.rate} />
          <TableCell>
            {hoveredLine === currentAsset.id ? (
              <Button
                disabled={isAddDisabled}
                onClick={() => {
                  handleAddAsset(currentAsset.id);
                }}
                variant="contained"
              >
                {t('ASSETS.ADD_ASSET')}
              </Button>
            ) : null}
          </TableCell>
        </RowStyled>
      </TableRow>
    </div>
  );
});
