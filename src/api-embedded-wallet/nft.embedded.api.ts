import { CollectionOwnership, Token } from 'fireblocks-sdk';
import { EmbeddedWallet } from '@fireblocks/embedded-wallet-sdk';
import { TokenOwnershipResponse } from '@fireblocks/ts-sdk';

export const getNFTTokens = async (fireblocksEW: EmbeddedWallet): Promise<TokenOwnershipResponse[]> => {
  // todo: is this the right operation?
  try {
    const NFTtokens = await fireblocksEW.getOwnedNFTs();
    return NFTtokens?.data ?? [];
  } catch (e) {
    console.error('nft.embedded.api.ts - getNFTTokens err: ', e);
    return [];
  }
};

export const getNFTCollections = async (deviceId: string, token: string): Promise<CollectionOwnership[]> => {
  // todo: it seems that on ncw-web-demo there is no NFT usage from embedded wallet and no example on that

  // const response = await getCall(`api/devices/${deviceId}/nfts/ownership/collections`, token);
  // return response.json();
};

export const getNFTAssets = async (deviceId: string, token: string): Promise<Token[]> => {
  // todo: it seems that on ncw-web-demo there is no NFT usage from embedded wallet and no example on that

  // const response = await getCall(`api/devices/${deviceId}/nfts/ownership/assets`, token);
  // return response.json();
};
