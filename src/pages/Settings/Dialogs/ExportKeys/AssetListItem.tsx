import React from 'react';
import { CopyText, TableRow, Typography, styled } from '@foundation';
import IconNoAsset from '@icons/no_asset_image.svg';
import { useAssetsStore, useFireblocksSDKStore } from '@store';
import { observer } from 'mobx-react';

const RowStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const KeyBoxStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  padding: theme.spacing(1, 0),
  boxSizing: 'border-box',
}));

const AssetBoxStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const ImageStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  minWidth: 32,
  minHeight: 32,
  maxWidth: 32,
  maxHeight: 32,
  overflow: 'hidden',
  backgroundColor: theme.palette.secondary.main,
  borderRadius: 4,
}));

interface IProps {
  privateKey: string;
  index: number;
  style: React.CSSProperties;
}

export const AssetListItem: React.FC<IProps> = observer(function AssetListItem({ privateKey, index, style }) {
  const assetsStore = useAssetsStore();
  const fireblocksSDKStore = useFireblocksSDKStore();

  const currentAsset = assetsStore.myBaseAssets[index];

  const accountId = Number(currentAsset.addressData?.accountId ?? 0);
  const addressIndex = currentAsset.addressData?.addressIndex ?? 0;
  const change: number = 0;

  const derivedAssetKey = fireblocksSDKStore.deriveAssetKey(
    privateKey,
    currentAsset.assetData?.coinType,
    accountId,
    change,
    addressIndex,
  );

  return (
    <div style={style} key={currentAsset.id}>
      <TableRow>
        <RowStyled>
          <AssetBoxStyled>
            <ImageStyled>
              <img width="16px" height="16px" src={currentAsset.iconUrl || IconNoAsset} alt={currentAsset.name} />
            </ImageStyled>
            <Typography variant="body2">{currentAsset.name}</Typography>
          </AssetBoxStyled>
          <KeyBoxStyled>
            <CopyText size="large" text={derivedAssetKey} />
          </KeyBoxStyled>
        </RowStyled>
      </TableRow>
    </div>
  );
});
