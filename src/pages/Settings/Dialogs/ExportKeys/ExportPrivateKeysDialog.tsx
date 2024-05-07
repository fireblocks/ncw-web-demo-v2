import React from 'react';
import { Box, CustomTabPanel, Dialog, Tab, Table, TableBody, Tabs, styled } from '@foundation';
import IconKey from '@icons/key.svg';
import IconNoAsset from '@icons/no_asset_image.svg';
import { useAssetsStore, useFireblocksSDKStore } from '@store';
import { sha256, encodeBase58 } from 'ethers';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { PrivateKeyListItem } from './PrivateKeyListItem';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: 545,
}));

const TabsStyled = styled(Tabs)(({ theme }) => ({
  '.MuiTabs-indicator': {
    backgroundColor: theme.palette.text.primary,
  },
}));
interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IExportPrivateKeyItem {
  name: string;
  key: string;
  iconSrc: string;
  index: number;
  wif?: string;
}

export const ExportPrivateKeysDialog: React.FC<IProps> = observer(function ExportPrivateKeysDialog({
  isOpen,
  onClose,
}) {
  const { t } = useTranslation();
  const assetsStore = useAssetsStore();
  const fireblocksSDKStore = useFireblocksSDKStore();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  function getWif(privateKey: string, isMainnet: boolean = false, isCompression: boolean = true) {
    if (!privateKey) {
      return undefined;
    }
    const networkPrefix = isMainnet ? '80' : 'EF';
    const compressionByte = isCompression ? '01' : '';
    const fullPrivateKey = `0x${networkPrefix}${privateKey}${compressionByte}`;
    const firstHash = sha256(fullPrivateKey);
    const secondHash = sha256(firstHash);
    const checksum = secondHash.slice(2, 10);
    const wifHex = `${fullPrivateKey}${checksum}`;
    const wifBase58 = encodeBase58(wifHex);
    return wifBase58;
  }

  const eddsaArray: Array<IExportPrivateKeyItem> = [];
  if (assetsStore.myEDDSAAssets.length && fireblocksSDKStore.fprvKey) {
    const fprvPrivateKeyItem: IExportPrivateKeyItem = {
      name: 'FPRV',
      key: fireblocksSDKStore.fprvKey,
      iconSrc: IconKey,
      index: 0,
    };
    eddsaArray.push(fprvPrivateKeyItem);
  }
  const ecdsaArray: Array<IExportPrivateKeyItem> = [];
  const privateKey = fireblocksSDKStore.xprvKey;
  if (assetsStore.myECDSAAssets.length && privateKey) {
    const xprvPrivateKeyItem: IExportPrivateKeyItem = {
      name: 'XPRV',
      key: privateKey,
      iconSrc: IconKey,
      index: 0,
    };
    ecdsaArray.push(xprvPrivateKeyItem);

    let assetIndex = 1;
    assetsStore.myECDSAAssets.map((asset) => {
      const accountId = Number(asset.addressData?.accountId ?? 0);
      const addressIndex = asset.addressData?.addressIndex ?? 0;
      const change: number = 0;
      const derivedAssetKey = fireblocksSDKStore.deriveAssetKey(
        privateKey,
        asset.assetData?.coinType,
        accountId,
        change,
        addressIndex,
      );
      assetIndex = assetIndex + 1;
      let wifKey;
      if (asset.assetData.networkProtocol === 'BTC') {
        try {
          wifKey = getWif(derivedAssetKey);
        } catch (error: any) {
          console.error('An error ocurred while trying getWif:', error.message);
        }
      }
      const assetPrivateKeyItem: IExportPrivateKeyItem = {
        name: asset.assetData.name,
        key: derivedAssetKey,
        iconSrc: asset.iconUrl || IconNoAsset,
        index: assetIndex,
        wif: wifKey,
      };
      ecdsaArray.push(assetPrivateKeyItem);
    });
  }

  return (
    <Dialog
      title={t('SETTINGS.DIALOGS.EXPORT_PRIVATE_KEYS.TITLE')}
      description={t('SETTINGS.DIALOGS.EXPORT_PRIVATE_KEYS.DESCRIPTION')}
      isOpen={isOpen}
      onClose={onClose}
      size="large"
    >
      <RootStyled>
        <div>
          <TabsStyled value={value} onChange={handleChange} aria-label="privateKeysAlgorithmTabs" textColor="inherit">
            {assetsStore.myEDDSAAssets.length && (
              <Tab
                label={t('SETTINGS.DIALOGS.EXPORT_PRIVATE_KEYS.EDDSA')}
                sx={{ textTransform: 'none', marginLeft: 2.5, fontWeight: 'bold' }}
              />
            )}
            {assetsStore.myECDSAAssets.length && (
              <Tab
                label={t('SETTINGS.DIALOGS.EXPORT_PRIVATE_KEYS.ECDSA')}
                sx={{ textTransform: 'none', marginLeft: 2.5, fontWeight: 'bold' }}
              />
            )}
          </TabsStyled>
        </div>
        <Box>
          <CustomTabPanel value={value} index={0}>
            <Table>
              <TableBody>
                <PrivateKeyListItem items={ecdsaArray} />
              </TableBody>
            </Table>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <Table>
              <TableBody>
                <PrivateKeyListItem items={eddsaArray} />
              </TableBody>
            </Table>
          </CustomTabPanel>
        </Box>
      </RootStyled>
    </Dialog>
  );
});
