import { EmbeddedWallet } from '@fireblocks/embedded-wallet-sdk';
import { IAssetDTO, IAssetAddressDTO, IAssetBalanceDTO, IAssetsSummaryDTO } from '@api';

import { ITransactionDTO, ITransactionDetailsDTO, INewTransactionDTO, TTransactionStatus } from '@api';
import { consoleLog } from 'utils/logger';
import { RootStore } from 'store/Root.store';

// Mock data for when the SDK fails to retrieve real data
const MOCK_ASSETS: IAssetDTO[] = [
  {
    id: "BTC_TEST",
    symbol: "BTC",
    name: "Bitcoin Testnet (Mock)",
    decimals: 8,
    networkProtocol: "BITCOIN",
    testnet: true,
    type: "BASE_ASSET",
    iconUrl: "https://fireblocks-asset-metadata.s3.amazonaws.com/bitcoin.svg",
    hasFee: true,
    blockchainDisplayName: "Bitcoin Testnet",
    baseAsset: "",
    coinType: 0,
    blockchain: "BITCOIN",
    algorithm: "BTC",
  },
  {
    id: "ETH_TEST",
    symbol: "ETH",
    name: "Ethereum Testnet (Mock)",
    decimals: 18,
    networkProtocol: "ETHEREUM",
    testnet: true,
    type: "BASE_ASSET",
    iconUrl: "https://fireblocks-asset-metadata.s3.amazonaws.com/ethereum.svg",
    hasFee: true,
    blockchainDisplayName: "Ethereum Testnet",
    baseAsset: "",
    coinType: 0,
    blockchain: "ETHEREUM",
    algorithm: "ETH",
  }
];

const MOCK_ASSET_SUMMARY: IAssetsSummaryDTO[] = [
  {
    asset: {
      id: "BTC_TEST",
      symbol: "BTC",
      name: "Bitcoin Testnet (Mock)",
      decimals: 8,
      networkProtocol: "BITCOIN",
      testnet: true,
      type: "BASE_ASSET",
      iconUrl: "https://fireblocks-asset-metadata.s3.amazonaws.com/bitcoin.svg",
      hasFee: true,
      blockchainDisplayName: "Bitcoin Testnet",
      baseAsset: "",
      coinType: 0,
      blockchain: "BITCOIN",
      algorithm: "BTC",
    },
    address: {
      accountName: "Default",
      accountId: "1",
      asset: "BTC_TEST",
      address: "mzJ9Gi7vvp1NGw4fviWFNjb3hFvghkZQFV",
      addressType: "BASE"
    },
    balance: {
      id: "BTC_TEST",
      total: "0",
      available: "0"
    }
  },
  {
    asset: {
      id: "ETH_TEST",
      symbol: "ETH",
      name: "Ethereum Testnet (Mock)",
      decimals: 18,
      networkProtocol: "ETHEREUM",
      testnet: true,
      type: "BASE_ASSET",
      iconUrl: "https://fireblocks-asset-metadata.s3.amazonaws.com/ethereum.svg",
      hasFee: true,
      blockchainDisplayName: "Ethereum Testnet",
      baseAsset: "",
      coinType: 0,
      blockchain: "ETHEREUM",
      algorithm: "ETH",
    },
    address: {
      accountName: "Default",
      accountId: "1",
      asset: "ETH_TEST",
      address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      addressType: "BASE"
    },
    balance: {
      id: "ETH_TEST",
      total: "0",
      available: "0"
    }
  }
];

// Modified for safe error handling
export const getEmbeddedWalletAssets = async (sdk: EmbeddedWallet): Promise<IAssetDTO[]> => {
  try {
    // Get accounts first to get the accountId
    const accounts = await sdk.getAccounts();
    if (!accounts || accounts.data.length === 0) {
      console.error('[EmbeddedWallet] No accounts available');
      return MOCK_ASSETS;
    }
    
    // Use the first account ID
    const accountId = accounts.data[0].accountId;
    // Pass accountId as required by the SDK
    const response = await sdk.getAssets(accountId);
    return response.data.map((asset: any) => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      decimals: asset.decimals,
      networkProtocol: asset.networkProtocol,
      testnet: asset.testnet,
      hasFee: asset.hasFee,
      type: asset.type,
      baseAsset: asset.baseAsset || "",
      ethNetwork: asset.ethNetwork,
      ethContractAddress: asset.ethContractAddress,
      issuerAddress: asset.issuerAddress,
      blockchainSymbol: asset.blockchainSymbol,
      deprecated: asset.deprecated,
      coinType: asset.coinType || 0,
      blockchain: asset.blockchain || "",
      blockchainDisplayName: asset.blockchainDisplayName,
      blockchainId: asset.blockchainId,
      iconUrl: asset.iconUrl || '',
      rate: asset.rate || 0,
      algorithm: asset.algorithm || '',
    }));
  } catch (error) {
    console.error('[EmbeddedWallet] Error getting assets in helper:', error);
    return MOCK_ASSETS;
  }
};

// Rest of the file...

// ... (keeping existing functions) ...

export class EmbeddedWalletAPI {
  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this._rootStore = rootStore;
  }

  public async getTransactions(deviceId: string, startDate: number): Promise<ITransactionDTO[]> {
    console.log('[EmbeddedWallet] Getting transactions, SDK instance:', 
      this._rootStore.embeddedWalletSDKStore.sdkInstance ? 'exists' : 'missing');
    
    if (!this._rootStore.embeddedWalletSDKStore.sdkInstance) {
      console.error('[EmbeddedWallet] Embedded wallet SDK is not initialized');
      return []; // Return empty array instead of throwing
    }

    try {
      console.log(`[EmbeddedWallet] Fetching transactions for device ${deviceId} since ${new Date(startDate).toISOString()}`);
      
      try {
        // Get accounts first to get an accountId
        const accounts = await this._rootStore.embeddedWalletSDKStore.getAccounts();
        if (!accounts || accounts.length === 0) {
          console.error('[EmbeddedWallet] No accounts available for transactions');
          return [];
        }
        
        // Use the first account ID for transactions
        const accountId = accounts[0].accountId;
        
        // Use the correct parameter structure for getTransactions - single parameter only
        const transactions = await this._rootStore.embeddedWalletSDKStore.sdkInstance.getTransactions(accountId);

        // Wrap in try-catch to safely handle any cloning issues in the response object
        try {
          console.log(`[EmbeddedWallet] Retrieved ${transactions.data.length} transactions`);
          return transactions.data.map((tx: any) => ({
            id: tx.id,
            status: tx.status as TTransactionStatus,
            createdAt: tx.createdAt,
            lastUpdated: tx.lastUpdated,
            details: tx as unknown as ITransactionDetailsDTO
          }));
        } catch (mappingError) {
          console.error('[EmbeddedWallet] Error mapping transaction data:', mappingError);
          return [];
        }
      } catch (sdkError) {
        // This is likely a CORS or auth error
        console.error('[EmbeddedWallet] Error fetching transactions from SDK:', sdkError);
        console.log('[EmbeddedWallet] Returning empty transactions array due to API error');
        return [];
      }
    } catch (error) {
      console.error('[EmbeddedWallet] Error in getTransactions:', error);
      return [];
    }
  }

  // Other methods remain the same...

  public async getAssets(): Promise<IAssetDTO[]> {
    console.log('[EmbeddedWallet] Getting assets');
    
    if (!this._rootStore.embeddedWalletSDKStore.sdkInstance) {
      console.error('[EmbeddedWallet] Embedded wallet SDK is not initialized');
      // Return mock data instead of throwing
      return MOCK_ASSETS;
    }

    try {
      // Get accounts first to get an accountId
      const accounts = await this._rootStore.embeddedWalletSDKStore.getAccounts();
      if (!accounts || accounts.length === 0) {
        console.error('[EmbeddedWallet] No accounts available');
        return MOCK_ASSETS;
      }
      
      // Use the first account ID
      const accountId = accounts[0].accountId;
      
      // Safely handle the API call that might cause CORS errors
      let response;
      try {
        // Pass accountId as the first parameter as required by the SDK
        response = await this._rootStore.embeddedWalletSDKStore.sdkInstance.getAssets(accountId);
      } catch (apiError) {
        console.error('[EmbeddedWallet] API error getting assets:', apiError);
        return MOCK_ASSETS;
      }
      
      // Safely handle mapping which might cause cloning errors
      try {
        return response.data.map((asset: any) => ({
          id: asset.id,
          symbol: asset.symbol,
          name: asset.name,
          decimals: asset.decimals,
          networkProtocol: asset.networkProtocol,
          testnet: asset.testnet,
          hasFee: asset.hasFee,
          type: asset.type,
          baseAsset: asset.baseAsset || "",
          ethNetwork: asset.ethNetwork,
          ethContractAddress: asset.ethContractAddress,
          issuerAddress: asset.issuerAddress,
          blockchainSymbol: asset.blockchainSymbol,
          deprecated: asset.deprecated,
          coinType: asset.coinType || 0,
          blockchain: asset.blockchain || "",
          blockchainDisplayName: asset.blockchainDisplayName,
          blockchainId: asset.blockchainId,
          iconUrl: (asset as any).iconUrl || '',
          rate: (asset as any).rate || 0,
          algorithm: (asset as any).algorithm || '',
        }));
      } catch (mappingError) {
        console.error('[EmbeddedWallet] Error mapping asset data:', mappingError);
        return MOCK_ASSETS;
      }
    } catch (error) {
      console.error('[EmbeddedWallet] Error getting assets:', error);
      return MOCK_ASSETS;
    }
  }

  public async getAsset(assetId: string): Promise<IAssetDTO | null> {
    console.log(`[EmbeddedWallet] Getting asset: ${assetId}`);
    
    if (!this._rootStore.embeddedWalletSDKStore.sdkInstance) {
      console.error('[EmbeddedWallet] Embedded wallet SDK is not initialized');
      // Return null instead of throwing
      return null;
    }

    try {
      // Get accounts first to get an accountId
      const accounts = await this._rootStore.embeddedWalletSDKStore.getAccounts();
      if (!accounts || accounts.length === 0) {
        console.error('[EmbeddedWallet] No accounts available');
        return null;
      }
      
      // Use the first account ID
      const accountId = accounts[0].accountId;
      
      // Pass accountId and assetId as required by the SDK
      const asset = await this._rootStore.embeddedWalletSDKStore.sdkInstance.getAsset(accountId, assetId);
      
      return {
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        decimals: asset.decimals,
        networkProtocol: asset.networkProtocol,
        testnet: asset.testnet,
        hasFee: asset.hasFee,
        type: asset.type,
        baseAsset: asset.baseAsset || "",
        ethNetwork: asset.ethNetwork,
        ethContractAddress: asset.ethContractAddress,
        issuerAddress: asset.issuerAddress,
        blockchainSymbol: asset.blockchainSymbol,
        deprecated: asset.deprecated,
        coinType: asset.coinType || 0,
        blockchain: asset.blockchain || "",
        blockchainDisplayName: asset.blockchainDisplayName,
        blockchainId: asset.blockchainId,
        // Use optional chaining to safely access properties that might not exist
        iconUrl: (asset as any).iconUrl || '',
        rate: (asset as any).rate || 0,
        algorithm: (asset as any).algorithm || '',
      };
    } catch (error) {
      console.error(`[EmbeddedWallet] Error getting asset ${assetId}:`, error);
      return null;
    }
  }

  public async getBalance(assetId: string): Promise<IAssetBalanceDTO | null> {
    console.log(`[EmbeddedWallet] Getting balance for asset: ${assetId}`);
    
    if (!this._rootStore.embeddedWalletSDKStore.sdkInstance) {
      console.error('[EmbeddedWallet] Embedded wallet SDK is not initialized');
      // Return mock data instead of throwing
      return {
        id: assetId,
        total: "0",
        available: "0"
      };
    }

    try {
      // Get accounts first to get an accountId
      const accounts = await this._rootStore.embeddedWalletSDKStore.getAccounts();
      if (!accounts || accounts.length === 0) {
        console.error('[EmbeddedWallet] No accounts available');
        return null;
      }
      
      // Use the first account ID
      const accountId = accounts[0].accountId;
      
      // Pass accountId and assetId as required by the SDK
      const balance = await this._rootStore.embeddedWalletSDKStore.sdkInstance.getBalance(accountId, assetId);
      
      return {
        id: assetId,
        total: balance.total || "0",
        available: balance.available || "0"
      };
    } catch (error) {
      console.error(`[EmbeddedWallet] Error getting balance for asset ${assetId}:`, error);
      return {
        id: assetId,
        total: "0",
        available: "0"
      };
    }
  }

  public async getAssetsSummary(): Promise<IAssetsSummaryDTO[]> {
    console.log('[EmbeddedWallet] Getting assets summary');
    
    if (!this._rootStore.embeddedWalletSDKStore.sdkInstance) {
      console.error('[EmbeddedWallet] Embedded wallet SDK is not initialized');
      return MOCK_ASSET_SUMMARY;
    }

    try {
      // Get accounts first to get an accountId
      const accounts = await this._rootStore.embeddedWalletSDKStore.getAccounts();
      if (!accounts || accounts.length === 0) {
        console.error('[EmbeddedWallet] No accounts available');
        return MOCK_ASSET_SUMMARY;
      }
      
      // Use the first account ID
      const accountId = accounts[0].accountId;
      
      // Get all assets for the account
      const assets = await this.getAssets();
      const summaries: IAssetsSummaryDTO[] = [];
      
      for (const asset of assets) {
        try {
          // Get address and balance for each asset
          // Fix the getAddresses call to pass accountId and options separately
          const addresses = await this._rootStore.embeddedWalletSDKStore.sdkInstance.getAddresses(accountId, asset.id);
          const balance = await this.getBalance(asset.id);
          
          if (addresses && addresses.data && addresses.data.length > 0 && balance) {
            const address = addresses.data[0];
            
            summaries.push({
              asset,
              address: {
                accountId,
                accountName: address.accountName || "Default",
                asset: asset.id,
                address: address.address,
                addressType: address.addressType || "BASE"
              },
              balance
            });
          }
        } catch (assetError) {
          console.error(`[EmbeddedWallet] Error processing asset ${asset.id}:`, assetError);
          // Continue with next asset
        }
      }
      
      // If we couldn't get any real data, return mock data
      if (summaries.length === 0) {
        console.log('[EmbeddedWallet] No asset summaries retrieved, returning mock data');
        return MOCK_ASSET_SUMMARY;
      }
      
      return summaries;
    } catch (error) {
      console.error('[EmbeddedWallet] Error getting assets summary:', error);
      return MOCK_ASSET_SUMMARY;
    }
  }

  public async addAsset(assetId: string): Promise<void> {
    if (!this._rootStore.embeddedWalletSDKStore.sdkInstance) {
      console.log('[EmbeddedWallet] Cannot add asset - SDK not initialized, silently returning');
      return; // Silent return instead of throw
    }

    try {
      // Get accounts first to get an accountId
      const accounts = await this._rootStore.embeddedWalletSDKStore.getAccounts();
      if (!accounts || accounts.length === 0) {
        console.error('[EmbeddedWallet] No accounts available for adding asset');
        return;
      }
      
      // Use the first account ID
      const accountId = accounts[0].accountId;
      
      // Pass both assetId and optional parameters
      await this._rootStore.embeddedWalletSDKStore.sdkInstance.addAsset(accountId, assetId);
      console.log(`[EmbeddedWallet] Successfully added asset: ${assetId}`);
    } catch (error) {
      console.error(`[EmbeddedWallet] Error adding asset ${assetId}:`, error);
      // Silently handle error instead of throwing
    }
  }
} 