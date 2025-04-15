import { TokenResponse } from '@fireblocks/ts-sdk/models/token-response.ts';
import { RootStore } from '@store';
import { CollectionOwnership, Token, TokenWithBalance } from 'fireblocks-sdk';

export const getNFTTokens = async (
  deviceId: string,
  accountId: number,
  token: string,
  rootStore: RootStore | null = null,
): Promise<TokenWithBalance[]> => {
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
  try {
    const NFTtokens = await rootStore?.fireblocksSDKStore.fireblocksEW.getOwnedNFTs();
    return NFTtokens?.data ?? [];
  } catch (e) {
    console.error('nft.embedded.api.ts - getNFTTokens err: ', e);
    return [];
  }
};

export const getNFTAssets = async (
  deviceId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<Token[] | undefined> => {
  // todo: it seems that on ncw-web-demo there is no NFT usage from embedded wallet and no example on that

  // const response = await getCall(`api/devices/${deviceId}/nfts/ownership/assets`, token);
  // return response.json();
  try {
    // todo: id is assetId
    const NFTtokens: TokenResponse | undefined = await rootStore?.fireblocksSDKStore.fireblocksEW.getNFT({
      id: deviceId,
    });
    if (NFTtokens) {
      return {
        id: NFTtokens.id,
        tokenId: NFTtokens.tokenId,
        standard: NFTtokens.standard,
        blockchainDescriptor: NFTtokens.blockchainDescriptor as string,
        description: NFTtokens.description,
        name: NFTtokens.name,
        metadataURI: NFTtokens.metadataURI,
        cachedMetadataURI: NFTtokens.cachedMetadataURI,
        // Type conversions for the nested objects
        media: NFTtokens.media ? NFTtokens.media.map(convertToMediaEntity) : undefined,
        collection: NFTtokens.collection ? convertToNFTCollection(NFTtokens.collection) : undefined,
        spam: NFTtokens.spam ? convertToNFTSpamTokenResponse(NFTtokens.spam) : undefined,
      };
    } else {
      return undefined;
    }
  } catch (e) {
    console.error('nft.embedded.api.ts - getNFTTokens err: ', e);
    return [];
  }
};

// helper for internal use

/**
 * Converts a MediaEntityResponse to MediaEntity
 */
const convertToMediaEntity = (media) => {
  // Implement conversion logic based on differences between types
  // For example:
  return {
    url: media.url,
    contentType: media.contentType,
    // Add other properties as needed
  };
};

/**
 * Converts a TokenCollectionResponse to NFTCollection
 */
const convertToNFTCollection = (collection) => {
  // Implement conversion logic based on differences between types
  return {
    id: collection.id,
    name: collection.name,
    // Add other properties as needed
  };
}

/**
 * Converts a SpamTokenResponse to NFTSpamTokenResponse
 */
const convertToNFTSpamTokenResponse = (spam) => {
  // Implement conversion logic based on differences between types
  return {
    isSpam: spam.isSpam,
    // Add other properties as needed
  };
};
