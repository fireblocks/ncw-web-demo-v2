import { getCall, postCall } from './utils';

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

export const addAsset = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
): Promise<IAssetAddressDTO> => {
  const response = await postCall(`api/devices/${deviceId}/accounts/${accountId}/assets/${assetId}`, token);
  return response;
};

export const getAsset = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
): Promise<IAssetDTO> => {
  const response = await getCall(`api/devices/${deviceId}/accounts/${accountId}/assets/${assetId}`, token);
  return response.json();
};

export const getAssets = async (deviceId: string, accountId: number, token: string): Promise<IAssetDTO[]> => {
  const response = await getCall(`api/devices/${deviceId}/accounts/${accountId}/assets`, token);
  return response.json();
};

export const getSupportedAssets = async (deviceId: string, accountId: number, token: string): Promise<IAssetDTO[]> => {
  const response = await getCall(`api/devices/${deviceId}/accounts/${accountId}/assets/supported_assets`, token);
  return response.json();
};

export const getAddress = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
): Promise<IAssetAddressDTO> => {
  const response = await getCall(`api/devices/${deviceId}/accounts/${accountId}/assets/${assetId}/address`, token);
  return response.json();
};

export const getBalance = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
): Promise<IAssetBalanceDTO> => {
  const response = await getCall(`api/devices/${deviceId}/accounts/${accountId}/assets/${assetId}/balance`, token);
  return response.json();
};
