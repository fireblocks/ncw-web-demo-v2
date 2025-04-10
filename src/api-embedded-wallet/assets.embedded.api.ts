import { EmbeddedWallet, IPaginatedResponse } from '@fireblocks/embedded-wallet-sdk';
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
  fireblocksEW: EmbeddedWallet,
  accountId: number,
  assetId: string,
): Promise<NCW.WalletAssetAddress> => {
  try {
    const asset = await fireblocksEW.addAsset(accountId, assetId);
    return asset;
  } catch (e) {
    console.error('addAsset error: ', e);
    return null;
  }
};

export const getAsset = async (
  fireblocksEW: EmbeddedWallet,
  accountId: number,
  assetId: string,
): Promise<NCW.WalletAssetResponse> => {
  try {
    const asset = await fireblocksEW.getAsset(accountId, assetId);
    return asset;
  } catch (e) {
    console.error('getAsset error: ', e);
    return null;
  }
};

export const getAssets = async (
  accountId: number,
  fireblocksEW: EmbeddedWallet,
): Promise<NCW.WalletAssetResponse[]> => {
  try {
    const assets: IPaginatedResponse<NCW.WalletAssetResponse> = await fireblocksEW.getAssets(accountId);
    return assets?.data ?? [];
  } catch (e) {
    console.error('getAssets error: ', e)
    return [];
  }
};

export const getAssetsSummary = async (

): Promise<IAssetsSummaryDTO[]> => {
    // todo: not currently in the SDK api, so need to figure out where to take it from
};

export const getSupportedAssets = async (fireblocksEW: EmbeddedWallet): Promise<NCW.WalletAssetResponse[]> => {
  try {
    const supportedAssets = await fireblocksEW.getSupportedAssets();
    return supportedAssets?.data ?? [];
  } catch (e) {
    console.error('getSupportedAssets error: ', e);
    return [];
  }
};

export const getAddress = async (
  fireblocksEW: EmbeddedWallet,
  accountId: number,
  assetId: string,
): Promise<NCW.WalletAssetAddress[]> => {
  try {
    const addresses = await fireblocksEW.getAddresses(accountId, assetId);
    return addresses?.data ?? [];
  } catch (e) {
    console.error('getSupportedAssets error: ', e);
    return [];
  }
};

export const getBalance = async (
  fireblocksEW: EmbeddedWallet,
  accountId: number,
  assetId: string,
): Promise<AssetResponse> => {
  try {
    const balance = await fireblocksEW.getBalance(accountId, assetId);
    return balance;
  } catch (e) {
    console.error('getSupportedAssets error: ', e);
    return null;
  }
};
