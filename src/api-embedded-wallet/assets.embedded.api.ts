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
  if (!rootStore?.fireblocksSDKStore?.fireblocksEW) {
    throw new Error('Embedded wallet SDK is not initialized');
  }
  
  try {
    const response = await rootStore.fireblocksSDKStore.fireblocksEW.addAsset(accountId, assetId);
    if (!response) {
      throw new Error('Failed to add asset');
    }
    return response;
  } catch (error) {
    console.error('addAsset error:', error);
    throw error;
  }
};

export const getAsset = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IAssetDTO> => {
  if (!rootStore?.fireblocksSDKStore?.fireblocksEW) {
    throw new Error('Embedded wallet SDK is not initialized');
  }

  try {
    const asset = await rootStore.fireblocksSDKStore.fireblocksEW.getAsset(accountId, assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }
    
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
      iconUrl: asset.iconUrl || '',
      rate: asset.rate || 0,
      algorithm: asset.algorithm || '',
    };
  } catch (error) {
    console.error('getAsset error:', error);
    throw error;
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
  if (!rootStore?.fireblocksSDKStore?.fireblocksEW) {
    throw new Error('Embedded wallet SDK is not initialized');
  }

  try {
    const supportedAssets = await rootStore.fireblocksSDKStore.fireblocksEW.getSupportedAssets();
    if (!supportedAssets?.data) {
      throw new Error('Failed to get supported assets');
    }
    
    return supportedAssets.data.map(asset => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      decimals: asset.decimals || 0,
      networkProtocol: asset.networkProtocol,
      testnet: asset.testnet || false,
      hasFee: asset.hasFee || false,
      type: asset.type,
      baseAsset: asset.baseAsset,
      ethNetwork: asset.ethNetwork,
      ethContractAddress: asset.ethContractAddress,
      issuerAddress: asset.issuerAddress,
      blockchainSymbol: asset.blockchainSymbol,
      deprecated: asset.deprecated || false,
      coinType: asset.coinType,
      blockchain: asset.blockchain,
      blockchainDisplayName: asset.blockchainDisplayName,
      blockchainId: asset.blockchainId,
      iconUrl: asset.iconUrl || '',
      rate: asset.rate || 0,
      algorithm: asset.algorithm || ''
    }));
  } catch (error) {
    console.error('getSupportedAssets error:', error);
    throw error;
  }
};

export const getAddress = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IAssetAddressDTO> => {
  if (!rootStore?.fireblocksSDKStore?.fireblocksEW) {
    throw new Error('Embedded wallet SDK is not initialized');
  }

  try {
    const address = await rootStore.fireblocksSDKStore.fireblocksEW.getAddress(accountId, assetId);
    if (!address) {
      throw new Error('Failed to get address');
    }
    
    return {
      accountName: address.accountName || '',
      accountId: address.accountId || accountId.toString(),
      asset: address.asset || assetId,
      address: address.address || '',
      addressType: address.addressType || '',
      addressDescription: address.addressDescription,
      tag: address.tag,
      addressIndex: address.addressIndex,
      legacyAddress: address.legacyAddress
    };
  } catch (error) {
    console.error('getAddress error:', error);
    throw error;
  }
};

export const getBalance = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IAssetBalanceDTO> => {
  if (!rootStore?.fireblocksSDKStore?.fireblocksEW) {
    throw new Error('Embedded wallet SDK is not initialized');
  }

  try {
    const balance = await rootStore.fireblocksSDKStore.fireblocksEW.getBalance(accountId, assetId);
    if (!balance) {
      throw new Error('Failed to get balance');
    }
    
    return {
      id: balance.id || assetId,
      total: balance.total || '0',
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
      blockHash: balance.blockHash
    };
  } catch (error) {
    console.error('getBalance error:', error);
    throw error;
  }
};
