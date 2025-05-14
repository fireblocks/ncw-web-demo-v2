import { TokenOwnershipResponse } from '@fireblocks/ts-sdk';
import { RootStore } from '@store';
import { CollectionOwnership, Token, TokenWithBalance } from 'fireblocks-sdk';

/**
 * Retrieves all NFT tokens owned by the user.
 * @param deviceId - The ID of the device
 * @param accountId - The ID of the account
 * @param token - Authentication token
 * @param rootStore - The root store instance containing the Fireblocks SDK
 * @returns Promise resolving to an array of TokenWithBalance objects
 */
export const getNFTTokens = async (
  deviceId: string,
  accountId: number,
  token: string,
  rootStore: RootStore | null = null,
): Promise<TokenWithBalance[]> => {
  try {
    console.log('[getNFTTokens] getNFTTokens embedded wallet: ', deviceId, accountId, token);
    const NFTtokens = await rootStore?.fireblocksSDKStore?.fireblocksEW?.getOwnedNFTs();
    if (!NFTtokens?.data) return [];

    return NFTtokens.data.map((tokenItem: TokenOwnershipResponse) => {
      // First, get the response from the API
      const nftToken = {
        id: tokenItem.id,
        tokenId: tokenItem.tokenId,
        standard: tokenItem.standard,
        blockchainDescriptor: tokenItem.blockchainDescriptor as string,
        description: tokenItem.description,
        name: tokenItem.name,
        metadataURI: tokenItem.metadataURI,
        cachedMetadataURI: tokenItem.cachedMetadataURI,
        ownershipStartTime: tokenItem.ownershipStartTime || 0,
        balance: '1', // NFTs are always owned in quantity of 1
        ownershipLastUpdateTime: tokenItem.ownershipStartTime || Date.now(),
        status: tokenItem.status || 'ACTIVE',
        media: tokenItem.media
          ? tokenItem.media.map((media) => ({
              url: media.url,
              contentType: media.contentType,
            }))
          : undefined,
        collection: tokenItem.collection
          ? {
              id: tokenItem.collection.id,
              name: tokenItem.collection.name,
            }
          : undefined,
        spam: tokenItem.spam
          ? {
              result: tokenItem.spam.result,
              source: tokenItem.spam.source,
            }
          : undefined,
        ncwId: deviceId,
        ncwAccountId: accountId,
      };

      // Cast it to TokenWithBalance to satisfy the type system
      return nftToken as unknown as TokenWithBalance;
    });
  } catch (e) {
    console.error('nft.embedded.api.ts - getNFTTokens err: ', e);
    return [];
  }
};

/**
 * Retrieves all NFT collections owned by the user.
 * @param deviceId - The ID of the device
 * @param token - Authentication token
 * @param rootStore - The root store instance containing the Fireblocks SDK
 * @returns Promise resolving to an array of CollectionOwnership objects
 */
export const getNFTCollections = async (
  deviceId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<CollectionOwnership[]> => {
  try {
    console.log('[getNFTCollections] getNFTCollections embedded wallet: ', deviceId, token);
    const NFTtokens = await rootStore?.fireblocksSDKStore?.fireblocksEW?.getOwnedNFTs();
    if (!NFTtokens?.data) return [];

    // Group tokens by collection
    const collectionsMap = new Map<string, CollectionOwnership>();

    NFTtokens.data.forEach((tokenItem) => {
      if (tokenItem.collection) {
        const collectionId = tokenItem.collection.id;
        if (!collectionsMap.has(collectionId)) {
          collectionsMap.set(collectionId, {
            id: collectionId,
            name: tokenItem.collection.name,
            standard: tokenItem.standard,
            blockchainDescriptor: tokenItem.blockchainDescriptor as string,
          });
        }
      }
    });

    return Array.from(collectionsMap.values());
  } catch (e) {
    console.error('nft.embedded.api.ts - getNFTCollections err: ', e);
    return [];
  }
};

/**
 * Retrieves all NFT assets owned by the user.
 * @param deviceId - The ID of the device
 * @param token - Authentication token
 * @param rootStore - The root store instance containing the Fireblocks SDK
 * @returns Promise resolving to an array of Token objects
 */
export const getNFTAssets = async (
  deviceId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<Token[]> => {
  try {
    console.log('[getNFTAssets] getNFTAssets embedded wallet: ', deviceId, token);
    const NFTtokens = await rootStore?.fireblocksSDKStore?.fireblocksEW?.getOwnedNFTs();
    if (!NFTtokens?.data) return [];

    return NFTtokens.data.map((tokenItem) => ({
      id: tokenItem.id,
      tokenId: tokenItem.tokenId,
      standard: tokenItem.standard,
      blockchainDescriptor: tokenItem.blockchainDescriptor as string,
      description: tokenItem.description,
      name: tokenItem.name,
      metadataURI: tokenItem.metadataURI,
      cachedMetadataURI: tokenItem.cachedMetadataURI,
      media: tokenItem.media
        ? tokenItem.media.map((media) => ({
            url: media.url,
            contentType: media.contentType,
          }))
        : undefined,
      collection: tokenItem.collection
        ? {
            id: tokenItem.collection.id,
            name: tokenItem.collection.name,
          }
        : undefined,
      spam: tokenItem.spam
        ? {
            result: tokenItem.spam.result,
            source: tokenItem.spam.source || 'UNKNOWN',
          }
        : undefined,
    }));
  } catch (e) {
    console.error('nft.embedded.api.ts - getNFTAssets err: ', e);
    return [];
  }
};

/**
 * Retrieves a single NFT asset by its ID.
 * @param assetId - The ID of the NFT to retrieve
 * @param token - Authentication token
 * @param rootStore - The root store instance containing the Fireblocks SDK
 * @returns Promise resolving to a Token object
 * @throws Error if the SDK is not initialized or if the NFT is not found
 */
export const getSingleNFTAsset = async (
  assetId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<Token> => {
  if (!rootStore?.fireblocksSDKStore?.fireblocksEW) {
    throw new Error('Embedded wallet SDK is not initialized');
  }

  try {
    console.log('[getSingleNFTAsset] getSingleNFTAsset embedded wallet: ', assetId, token);
    const nft = await rootStore.fireblocksSDKStore.fireblocksEW.getNFT({ id: assetId });
    if (!nft) {
      throw new Error('NFT not found');
    }

    return {
      id: nft.id,
      tokenId: nft.tokenId,
      standard: nft.standard,
      blockchainDescriptor: nft.blockchainDescriptor as string,
      description: nft.description,
      name: nft.name,
      metadataURI: nft.metadataURI,
      cachedMetadataURI: nft.cachedMetadataURI,
      media: nft.media
        ? nft.media.map((media) => ({
            url: media.url,
            contentType: media.contentType,
          }))
        : undefined,
      collection: nft.collection
        ? {
            id: nft.collection.id,
            name: nft.collection.name,
          }
        : undefined,
      spam: nft.spam
        ? {
            result: nft.spam.result,
          }
        : undefined,
    };
  } catch (error) {
    console.error('getNFTsingleAsset error:', error);
    throw error;
  }
};
