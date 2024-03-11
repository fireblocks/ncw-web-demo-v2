import { getCall } from './utils';

export interface INFTTokenDTO {
  token: string;
  address: string;
}

export interface INFTCollectionDTO {
  collection: string;
  address: string;
}

export interface INFTAssetDTO {
  asset: string;
  address: string;
}

export const getNFTTokens = async (deviceId: string, accountId: number, token: string): Promise<INFTTokenDTO[]> => {
  const response = await getCall(`api/devices/${deviceId}/accounts/${accountId}/nfts/ownership/tokens`, token);
  return response.json();
};

export const getNFTCollections = async (deviceId: string, token: string): Promise<INFTCollectionDTO[]> => {
  const response = await getCall(`api/devices/${deviceId}/nfts/ownership/collections`, token);
  return response.json();
};

export const getNFTAssets = async (deviceId: string, token: string): Promise<INFTAssetDTO[]> => {
  const response = await getCall(`api/devices/${deviceId}/nfts/ownership/assets`, token);
  return response.json();
};
