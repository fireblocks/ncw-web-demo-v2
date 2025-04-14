import { TokenOwnershipResponse } from '@fireblocks/ts-sdk';
import { RootStore } from '@store';
import { CollectionOwnership, Token } from 'fireblocks-sdk';

export const getNFTTokens = async (
  deviceId: string,
  accountId: number,
  token: string,
  rootStore: RootStore | null = null,
): Promise<TokenOwnershipResponse[]> => {
  // todo: is this the right operation?
  try {
    const NFTtokens = await rootStore?.fireblocksSDKStore.fireblocksEW.getOwnedNFTs();
    return NFTtokens?.data ?? [];
  } catch (e) {
    console.error('nft.embedded.api.ts - getNFTTokens err: ', e);
    return [];
  }
};

export const getNFTCollections = async (
  deviceId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<CollectionOwnership[]> => {
  // todo: it seems that on ncw-web-demo there is no NFT usage from embedded wallet and no example on that

  // const response = await getCall(`api/devices/${deviceId}/nfts/ownership/collections`, token);
  // return response.json();
};

export const getNFTAssets = async (
  deviceId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<Token[]> => {
  // todo: it seems that on ncw-web-demo there is no NFT usage from embedded wallet and no example on that

  // const response = await getCall(`api/devices/${deviceId}/nfts/ownership/assets`, token);
  // return response.json();
};
