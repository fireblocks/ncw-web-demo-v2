import React from 'react';
import { Dialog, Typography, styled } from '@foundation';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { useAssetsStore } from '@store';

const ListStyled = styled('ul')(() => ({
  listStyle: 'none',
  padding: 0,
  margin: 0,
}));

const AssetStyled = styled('li')(({ theme }) => ({
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1, 0),
}));

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAssetDialog: React.FC<IProps> = observer(function AddAssetDialog({ isOpen, onClose }) {
  const { t } = useTranslation();
  const assetsStore = useAssetsStore();
  console.log(assetsStore.supportedAssets);

  return (
    <Dialog
      title={t('ASSETS.ADD_DIALOG.TITLE')}
      description={t('ASSETS.ADD_DIALOG.DESCRIPTION')}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div>
        <ListStyled>
          {assetsStore.supportedAssets.map((asset) => (
            <AssetStyled key={asset.id}>
              {asset.iconUrl && <img width='30px' src={asset.iconUrl} alt={asset.name} />}
              <Typography component="p">{asset.name}</Typography>
              <Typography component="p">{asset.id}</Typography>
              <Typography component="p">${asset.rate}</Typography>
            </AssetStyled>
          ))}
        </ListStyled>
      </div>
    </Dialog>
  );
});
