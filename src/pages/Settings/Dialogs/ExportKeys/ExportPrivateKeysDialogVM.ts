import IconKey from '@icons/key.svg';
import IconNoAsset from '@icons/no_asset_image.svg';
import { AssetsStore, FireblocksSDKStore } from '@store';
import { sha256, encodeBase58 } from 'ethers';
import { action, computed, makeObservable, observable } from 'mobx';

interface IExportPrivateKeyItem {
  name: string;
  key: string | null;
  iconSrc: string;
  index: number;
  wif?: string;
}

export class ExportPrivateKeysDialogVM {
  @observable public error: string | null;
  @observable public selectedTabValue: number;
  constructor(
    public assetsStore: AssetsStore,
    public fireblocksSDKStore: FireblocksSDKStore,
  ) {
    makeObservable(this);
    this.error = null;
    this.selectedTabValue = 0;
  }

  @action
  public setSelectedTabValue(selectedTabValue: number) {
    this.selectedTabValue = selectedTabValue;
  }

  @action
  public setError(error: string) {
    this.error = error;
  }

  @action
  public handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    this.setSelectedTabValue(newValue);
  };
  public getWif(privateKey: string, isMainnet: boolean = false, isCompression: boolean = true) {
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

  private get fprvPrivateKeyItem(): IExportPrivateKeyItem {
    const privateKeyItem: IExportPrivateKeyItem = {
      name: 'FPRV',
      key: this.fireblocksSDKStore.fprvKey,
      iconSrc: IconKey,
      index: 0,
    };
    return privateKeyItem;
  }

  private get xprvPrivateKeyItem(): IExportPrivateKeyItem {
    const privateKeyItem: IExportPrivateKeyItem = {
      name: 'XPRV',
      key: this.fireblocksSDKStore.xprvKey,
      iconSrc: IconKey,
      index: 0,
    };
    return privateKeyItem;
  }

  @computed
  public get eddsaLIstItems(): Array<IExportPrivateKeyItem> {
    const items: Array<IExportPrivateKeyItem> = [];
    items.push(this.fprvPrivateKeyItem);
    return items;
  }

  @computed
  public get ecdsaLIstItems(): Array<IExportPrivateKeyItem> {
    const items: Array<IExportPrivateKeyItem> = [];
    let assetIndex = 1;
    const xprvKey = this.fireblocksSDKStore.xprvKey;

    if (xprvKey) {
      items.push(this.xprvPrivateKeyItem);
      this.assetsStore.myECDSAAssets.map((asset) => {
        const accountId = Number(asset.addressData?.accountId ?? 0);
        const addressIndex = asset.addressData?.addressIndex ?? 0;
        const change: number = 0;
        const derivedAssetKey = this.fireblocksSDKStore.deriveAssetKey(
          xprvKey,
          asset.assetData?.coinType,
          accountId,
          change,
          addressIndex,
        );

        assetIndex++;
        let wifKey;

        if (asset.assetData.networkProtocol === 'BTC') {
          try {
            wifKey = this.getWif(derivedAssetKey);
          } catch (e: any) {
            this.setError(e.message);
          }
        }

        const assetPrivateKeyItem: IExportPrivateKeyItem = {
          name: asset.assetData.name,
          key: derivedAssetKey,
          iconSrc: asset.iconUrl || IconNoAsset,
          index: assetIndex,
          wif: wifKey,
        };
        items.push(assetPrivateKeyItem);
      });
    }
    return items;
  }
}
