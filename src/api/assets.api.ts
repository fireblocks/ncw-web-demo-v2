import { getCall, postCall } from './utils.api';
import { EmbeddedWallet } from '@fireblocks/embedded-wallet-sdk';
import { ENV_CONFIG } from '../env_config.ts';
import { NCW } from 'fireblocks-sdk';

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
  embeddedWalletSDK: EmbeddedWallet | undefined,
): Promise<IAssetAddressDTO | NCW.WalletAssetAddress> => {
  if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK && embeddedWalletSDK) {
    const re: Promise<NCW.WalletAssetAddress> = await embeddedWalletSDK?.addAsset(accountId, assetId);
    return re;
  }
  const response = await postCall(`api/devices/${deviceId}/accounts/${accountId.toString()}/assets/${assetId}`, token);
  return response;
};

export const getAsset = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
  embeddedWalletSDK: EmbeddedWallet | undefined,
): Promise<IAssetDTO | NCW.WalletAssetResponse> => {
  if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK && embeddedWalletSDK) {
    const re: Promise<NCW.WalletAssetResponse> = await embeddedWalletSDK?.getAsset(accountId, assetId);
    return re;
  }
  const response = await getCall(`api/devices/${deviceId}/accounts/${accountId.toString()}/assets/${assetId}`, token);
  return response.json();
};

export const getAssets = async (
  deviceId: string,
  accountId: number,
  token: string,
  embeddedWalletSDK: EmbeddedWallet | undefined,
): Promise<IAssetDTO[]> => {
  if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK && embeddedWalletSDK) {
    const re: Promise<any> = await embeddedWalletSDK?.getAssets(accountId);
    return re;
  }
  const response = await getCall(`api/devices/${deviceId}/accounts/${accountId.toString()}/assets`, token);
  return response.json();
};

export const getAssetsSummary = async (
  deviceId: string,
  accountId: number,
  token: string,
  embeddedWalletSDK: EmbeddedWallet | undefined,
): Promise<IAssetsSummaryDTO[]> => {
  if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK && embeddedWalletSDK) {
    const re: Promise<any> = await embeddedWalletSDK?.getAssets(accountId);
    return re;
  }
  const response = await getCall(`api/devices/${deviceId}/accounts/${accountId.toString()}/assets/summary`, token);
  const assetsMap = await response.json();
  return Object.values(assetsMap);
};

export const getSupportedAssets = async (
  deviceId: string,
  accountId: number,
  token: string,
  embeddedWalletSDK: EmbeddedWallet | undefined,
): Promise<IAssetDTO[]> => {
  if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK && embeddedWalletSDK) {
    const re: Promise<any> = await embeddedWalletSDK?.getSupportedAssets();
    return re;
  }
  const response = await getCall(
    `api/devices/${deviceId}/accounts/${accountId.toString()}/assets/supported_assets`,
    token,
  );
  return response.json();
};

export const getAddress = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
  embeddedWalletSDK: EmbeddedWallet | undefined,
): Promise<IAssetAddressDTO> => {
  if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK && embeddedWalletSDK) {
    const re: Promise<any> = await embeddedWalletSDK?.getAddresses(accountId, assetId);
    return re;
  }
  const response = await getCall(
    `api/devices/${deviceId}/accounts/${accountId.toString()}/assets/${assetId}/address`,
    token,
  );
  return response.json();
};

export const getBalance = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
  embeddedWalletSDK: EmbeddedWallet | undefined,
): Promise<IAssetBalanceDTO> => {
  if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK && embeddedWalletSDK) {
    const re: Promise<any> = await embeddedWalletSDK?.getBalance(accountId, assetId);
    return re;
  }
  const response = await getCall(
    `api/devices/${deviceId}/accounts/${accountId.toString()}/assets/${assetId}/balance`,
    token,
  );
  return response.json();
};
