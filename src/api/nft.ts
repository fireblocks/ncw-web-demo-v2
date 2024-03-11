import { TokenWithBalance, CollectionOwnership, Token } from 'fireblocks-sdk';
import { getCall } from './utils';

export const getNFTTokens = async (deviceId: string, accountId: number, token: string): Promise<TokenWithBalance[]> => {
  const response = await getCall(`api/devices/${deviceId}/accounts/${accountId}/nfts/ownership/tokens`, token);
  return response.json();
};

export const getNFTCollections = async (deviceId: string, token: string): Promise<CollectionOwnership[]> => {
  const response = await getCall(`api/devices/${deviceId}/nfts/ownership/collections`, token);
  return response.json();
};

export const getNFTAssets = async (deviceId: string, token: string): Promise<Token[]> => {
  const response = await getCall(`api/devices/${deviceId}/nfts/ownership/assets`, token);
  return response.json();
};
