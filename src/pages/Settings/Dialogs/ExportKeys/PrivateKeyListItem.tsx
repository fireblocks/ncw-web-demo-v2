import React from 'react';
import { TableRow, Typography, styled } from '@foundation';
import IconNoAsset from '@icons/no_asset_image.svg';
import { observer } from 'mobx-react';
import { Key } from './Key';

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

interface IExportPrivateKeyItem {
  name: string;
  key: string | null;
  iconSrc: string;
  index: number;
  wif?: string;
}
interface IProps {
  items: Array<IExportPrivateKeyItem>;
}
export const PrivateKeyListItem: React.FC<IProps> = observer(function PrivateKeyListItem({ items }) {
  return (
    <div>
      {items.map((item) => (
        <TableRow key={item.index}>
          <RowStyled>
            <AssetBoxStyled>
              <ImageStyled>
                <img width="16px" height="16px" src={item.iconSrc || IconNoAsset} alt={item.name} />
              </ImageStyled>
              <Typography variant="body2">{item.name}</Typography>
            </AssetBoxStyled>
            {item.key && (
              <KeyBoxStyled>
                <Key assetKey={item.key} />
              </KeyBoxStyled>
            )}
            {item.wif && (
              <div>
                <Typography variant="body2">WIF</Typography>
                <KeyBoxStyled>
                  <Key assetKey={item.wif} />
                </KeyBoxStyled>
              </div>
            )}
          </RowStyled>
        </TableRow>
      ))}
    </div>
  );
});
