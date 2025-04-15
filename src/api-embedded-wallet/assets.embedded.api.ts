import { IPaginatedResponse } from '@fireblocks/embedded-wallet-sdk';
import { RootStore } from '@store';
import { AssetResponse, NCW } from 'fireblocks-sdk';

export interface IAssetDTO {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  networkProtocol: string;
  testnet: boolean;
  hasFee: boolean;
  type: string;
  baseAsset: string;
  ethNetwork?: number;
  ethContractAddress?: string;
  issuerAddress?: string;
  blockchainSymbol?: string;
  deprecated?: boolean;
  coinType: number;
  blockchain: string;
  blockchainDisplayName?: string;
  blockchainId?: string;
  iconUrl?: string;
  rate?: number;
  algorithm: string;
}

export interface IAssetAddressDTO {
  accountName: string;
  accountId: string;
  asset: string;
  address: string;
  addressType: string;
  addressDescription?: string;
  tag?: string;
  addressIndex?: number;
  legacyAddress?: string;
}

export interface IAssetBalanceDTO {
  id: string;
  total: string;
  lockedAmount?: string;
  available?: string;
  pending?: string;
  selfStakedCPU?: string;
  selfStakedNetwork?: string;
  pendingRefundCPU?: string;
  pendingRefundNetwork?: string;
  totalStakedCPU?: string;
  totalStakedNetwork?: string;
  blockHeight?: string;
  blockHash?: string;
}

export interface IAssetsSummaryDTO {
  asset: IAssetDTO;
  address: IAssetAddressDTO;
  balance: IAssetBalanceDTO;
}

export const addAsset = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IAssetAddressDTO> => {
  try {
    // const asset = await rootStore?.fireblocksSDKStore.fireblocksEW.addAsset(accountId, assetId);
    // return asset;
    if (!rootStore?.fireblocksSDKStore?.fireblocksEW) {
      throw new Error('Embedded wallet SDK is not initialized');
    }
    const response = await rootStore.fireblocksSDKStore.fireblocksEW.addAsset(accountId, assetId);
    return response;
  } catch (e) {
    console.error('addAsset error: ', e);
    return null;
  }
};

export const getAsset = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IAssetDTO> => {
  try {
    if (!rootStore?.fireblocksSDKStore.fireblocksEW) {
      throw new Error('Embedded wallet SDK is not initialized');
    }
    const asset = await rootStore.fireblocksSDKStore.fireblocksEW.getAsset(accountId, assetId);
    return {
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      decimals: asset.decimals,
      networkProtocol: asset.networkProtocol,
      testnet: asset.testnet,
      hasFee: asset.hasFee,
      type: asset.type,
      baseAsset: asset.baseAsset,
      ethNetwork: asset.ethNetwork,
      ethContractAddress: asset.ethContractAddress,
      issuerAddress: asset.issuerAddress,
      blockchainSymbol: asset.blockchainSymbol,
      deprecated: asset.deprecated,
      coinType: asset.coinType,
      blockchain: asset.blockchain,
      blockchainDisplayName: asset.blockchainDisplayName,
      blockchainId: asset.blockchainId,
      iconUrl: '',
      rate: 0,
      algorithm: '',
    };
  } catch (e) {
    console.error('getAsset error: ', e);
    return null;
  }
};

export const getEmbeddedWalletAssets = async (rootStore: RootStore, accountId: number): Promise<IAssetDTO[]> => {
  const response = await rootStore.fireblocksSDKStore.fireblocksEW.getAssets(accountId);
  return response.data.map((asset) => ({
    id: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    decimals: asset.decimals,
    networkProtocol: asset.networkProtocol,
    testnet: asset.testnet,
    hasFee: asset.hasFee,
    type: asset.type,
    baseAsset: asset.baseAsset,
    ethNetwork: asset.ethNetwork,
    ethContractAddress: asset.ethContractAddress,
    issuerAddress: asset.issuerAddress,
    blockchainSymbol: asset.blockchainSymbol,
    deprecated: asset.deprecated,
    coinType: asset.coinType,
    blockchain: asset.blockchain,
    blockchainDisplayName: asset.blockchainDisplayName,
    blockchainId: asset.blockchainId,
    iconUrl: asset?.iconUrl || '',
    rate: asset?.rate || 0,
    algorithm: asset?.algorithm || '',
  }));
};

export const getEmbeddedWalletAsset = async (rootStore: RootStore, assetId: string, accountId: number): Promise<IAssetDTO> => {
  const asset = await rootStore.fireblocksSDKStore.fireblocksEW.getAsset(accountId, assetId);
  return {
    id: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    decimals: asset.decimals,
    networkProtocol: asset.networkProtocol,
    testnet: asset.testnet,
    hasFee: asset.hasFee,
    type: asset.type,
    baseAsset: asset.baseAsset,
    ethNetwork: asset.ethNetwork,
    ethContractAddress: asset.ethContractAddress,
    issuerAddress: asset.issuerAddress,
    blockchainSymbol: asset.blockchainSymbol,
    deprecated: asset.deprecated,
    coinType: asset.coinType,
    blockchain: asset.blockchain,
    blockchainDisplayName: asset.blockchainDisplayName,
    blockchainId: asset.blockchainId,
    iconUrl: asset?.iconUrl || '',
    rate: asset?.rate || 0,
    algorithm: asset?.algorithm || '',
  };
};

export const getAssets = async (
  deviceId: string,
  accountId: number,
  token: string,
  rootStore: RootStore | null = null,
): Promise<Promise<IAssetDTO>[]> => {
  console.log('[EmbeddedWallet] Getting assets');

  if (!rootStore?.fireblocksSDKStore.fireblocksEW) {
    console.error('[EmbeddedWallet] Embedded wallet SDK is not initialized');
    return [];
  }
  try {
    const response = await rootStore.fireblocksSDKStore.fireblocksEW.getAssets(accountId);
    return response.data.map((asset) => getEmbeddedWalletAsset(rootStore, asset.id, accountId));
  } catch (error) {
    console.log('[EmbeddedWallet] Error getting assets:', error);
    return [];
  }
};

export const getEmbeddedWalletAssetsSummary = async (rootStore: RootStore, accountId: number): Promise<IAssetsSummaryDTO[]> => {
  const response = await rootStore.fireblocksSDKStore.fireblocksEW.getAssets(accountId);
  const summaries: IAssetsSummaryDTO[] = [];

  for (const asset of response.data) {
    const addressResponse = await rootStore.fireblocksSDKStore.fireblocksEW.getAddresses(accountId, asset.id );
    const address = addressResponse.data[0];
    const balance = await rootStore.fireblocksSDKStore.fireblocksEW.getBalance(accountId, asset.id);

    summaries.push({
      asset: {
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        decimals: asset.decimals,
        networkProtocol: asset.networkProtocol,
        testnet: asset.testnet,
        hasFee: asset.hasFee,
        type: asset.type,
        baseAsset: asset.baseAsset,
        ethNetwork: asset.ethNetwork,
        ethContractAddress: asset.ethContractAddress,
        issuerAddress: asset.issuerAddress,
        blockchainSymbol: asset.blockchainSymbol,
        deprecated: asset.deprecated,
        coinType: asset.coinType,
        blockchain: asset.blockchain,
        blockchainDisplayName: asset.blockchainDisplayName,
        blockchainId: asset.blockchainId,
        iconUrl: asset?.blockchainSymbol || '',
        rate: asset?.rate || 0,
        algorithm: asset?.algorithm || '',
      },
      address: {
        accountName: address.accountName,
        accountId: address.accountId,
        asset: address.asset,
        address: address.address,
        addressType: address.addressType,
        addressDescription: address.addressDescription,
        tag: address.tag,
        addressIndex: address.addressIndex,
        legacyAddress: address.legacyAddress,
      },
      balance: {
        id: balance.id,
        total: balance.total,
        lockedAmount: balance.lockedAmount,
        available: balance.available,
        pending: balance.pending,
        selfStakedCPU: balance.selfStakedCPU,
        selfStakedNetwork: balance.selfStakedNetwork,
        pendingRefundCPU: balance.pendingRefundCPU,
        pendingRefundNetwork: balance.pendingRefundNetwork,
        totalStakedCPU: balance.totalStakedCPU,
        totalStakedNetwork: balance.totalStakedNetwork,
        blockHeight: balance.blockHeight,
        blockHash: balance.blockHash,
      },
    });
  }

  console.log('[EmbeddedWallet] Assets summary:', summaries);

  return summaries;
};

export const getAssetsSummary = async (
  deviceId: string,
  accountId: number,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IAssetsSummaryDTO[]> => {
  console.log('[EmbeddedWallet] Getting assets summary');
  try {
    return await getEmbeddedWalletAssetsSummary(rootStore, accountId);
  } catch (error) {
    console.error('[EmbeddedWallet] Error getting assets summary:', error);
  }
};

export const getSupportedAssets = async (
  deviceId: string,
  accountId: number,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IAssetDTO[]> => {
  try {
    const supportedAssets = await rootStore?.fireblocksSDKStore.fireblocksEW.getSupportedAssets();
    console.log('getSupportedAssets supportedAssets: ', supportedAssets);
    if (supportedAssets) {
      // return supportedAssets?.data ?? [];
      return supportedAssets?.data?.map((asset) => ({
        ...asset,
        iconUrl: asset?.url ?? '',
        rate: asset?.rate ?? '',
        algorithm: '',
      }));
    } else {
      console.log('getSupportedAssets, supportedAssets returned null or undefined');
      return [];
    }
  } catch (e) {
    console.error('getSupportedAssets error: ', e);
    return [];
  }
};

export const getAddress = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IAssetAddressDTO> => {
  try {
    const response = await this._rootStore.embeddedWalletSDKStore.sdkInstance.getAddresses(accountId, assetId);
    const address = response.data[0];
    return {
      accountName: address.accountName,
      accountId: address.accountId,
      asset: address.asset,
      address: address.address,
      addressType: address.addressType,
      addressDescription: address.addressDescription,
      tag: address.tag,
      addressIndex: address.addressIndex,
      legacyAddress: address.legacyAddress
    };
  } catch (e) {
    console.error('getSupportedAssets error: ', e);
    return null;
  }
};

export const getBalance = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IAssetBalanceDTO> => {
  try {
    const balance = await rootStore?.fireblocksSDKStore.fireblocksEW.getBalance(accountId, assetId);
    return {
      id: balance?.id,
      total: balance?.total,
      lockedAmount: balance?.lockedAmount,
      available: balance?.available,
      pending: balance?.pending,
      selfStakedCPU: balance?.selfStakedCPU,
      selfStakedNetwork: balance?.selfStakedNetwork,
      pendingRefundCPU: balance?.pendingRefundCPU,
      pendingRefundNetwork: balance?.pendingRefundNetwork,
      totalStakedCPU: balance?.totalStakedCPU,
      totalStakedNetwork: balance?.totalStakedNetwork,
      blockHeight: balance?.blockHeight,
      blockHash: balance?.blockHash
    };
  } catch (e) {
    console.error('getSupportedAssets error: ', e);
    return null;
  }
};
