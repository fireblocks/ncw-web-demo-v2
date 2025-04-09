import { EmbeddedWallet } from '@fireblocks/embedded-wallet-sdk';
import { IAssetDTO, IAssetAddressDTO, IAssetBalanceDTO, IAssetsSummaryDTO } from './assets.api';
import { RootStore } from '../store/Root.store';
import { ITransactionDTO, ITransactionDetailsDTO, INewTransactionDTO, TTransactionStatus } from './transactions.api';

export const getEmbeddedWalletAssets = async (sdk: EmbeddedWallet): Promise<IAssetDTO[]> => {
  const response = await sdk.getAssets({ limit: 100 });
  return response.items.map((asset) => ({
    id: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    decimals: asset.decimals,
    networkProtocol: asset.networkProtocol,
    testnet: asset.testnet,
    hasFee: asset.hasFee,
    type: asset.type,
    baseAsset: asset.baseAsset,
    ethNetwork: asset.ethNetwork,
    ethContractAddress: asset.ethContractAddress,
    issuerAddress: asset.issuerAddress,
    blockchainSymbol: asset.blockchainSymbol,
    deprecated: asset.deprecated,
    coinType: asset.coinType,
    blockchain: asset.blockchain,
    blockchainDisplayName: asset.blockchainDisplayName,
    blockchainId: asset.blockchainId,
    iconUrl: asset.iconUrl || '',
    rate: asset.rate || 0,
    algorithm: asset.algorithm || '',
  }));
};

export const getEmbeddedWalletAsset = async (sdk: EmbeddedWallet, assetId: string): Promise<IAssetDTO> => {
  const asset = await sdk.getAsset(assetId, {});
  return {
    id: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    decimals: asset.decimals,
    networkProtocol: asset.networkProtocol,
    testnet: asset.testnet,
    hasFee: asset.hasFee,
    type: asset.type,
    baseAsset: asset.baseAsset,
    ethNetwork: asset.ethNetwork,
    ethContractAddress: asset.ethContractAddress,
    issuerAddress: asset.issuerAddress,
    blockchainSymbol: asset.blockchainSymbol,
    deprecated: asset.deprecated,
    coinType: asset.coinType,
    blockchain: asset.blockchain,
    blockchainDisplayName: asset.blockchainDisplayName,
    blockchainId: asset.blockchainId,
    iconUrl: asset.iconUrl || '',
    rate: asset.rate || 0,
    algorithm: asset.algorithm || '',
  };
};

export const getEmbeddedWalletAddress = async (sdk: EmbeddedWallet, assetId: string): Promise<IAssetAddressDTO> => {
  const response = await sdk.getAddresses({ assetId });
  const address = response.items[0];
  return {
    accountName: address.accountName,
    accountId: address.accountId,
    asset: address.asset,
    address: address.address,
    addressType: address.addressType,
    addressDescription: address.addressDescription,
    tag: address.tag,
    addressIndex: address.addressIndex,
    legacyAddress: address.legacyAddress,
  };
};

export const getEmbeddedWalletBalance = async (sdk: EmbeddedWallet, assetId: string): Promise<IAssetBalanceDTO> => {
  const balance = await sdk.getBalance(assetId, {});
  return {
    id: balance.id,
    total: balance.total,
    lockedAmount: balance.lockedAmount,
    available: balance.available,
    pending: balance.pending,
    selfStakedCPU: balance.selfStakedCPU,
    selfStakedNetwork: balance.selfStakedNetwork,
    pendingRefundCPU: balance.pendingRefundCPU,
    pendingRefundNetwork: balance.pendingRefundNetwork,
    totalStakedCPU: balance.totalStakedCPU,
    totalStakedNetwork: balance.totalStakedNetwork,
    blockHeight: balance.blockHeight,
    blockHash: balance.blockHash,
  };
};

export const getEmbeddedWalletAssetsSummary = async (sdk: EmbeddedWallet): Promise<IAssetsSummaryDTO[]> => {
  const response = await sdk.getAssets({ limit: 100 });
  const summaries: IAssetsSummaryDTO[] = [];

  for (const asset of response.items) {
    const addressResponse = await sdk.getAddresses({ assetId: asset.id });
    const address = addressResponse.items[0];
    const balance = await sdk.getBalance(asset.id, {});

    summaries.push({
      asset: {
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        decimals: asset.decimals,
        networkProtocol: asset.networkProtocol,
        testnet: asset.testnet,
        hasFee: asset.hasFee,
        type: asset.type,
        baseAsset: asset.baseAsset,
        ethNetwork: asset.ethNetwork,
        ethContractAddress: asset.ethContractAddress,
        issuerAddress: asset.issuerAddress,
        blockchainSymbol: asset.blockchainSymbol,
        deprecated: asset.deprecated,
        coinType: asset.coinType,
        blockchain: asset.blockchain,
        blockchainDisplayName: asset.blockchainDisplayName,
        blockchainId: asset.blockchainId,
        iconUrl: asset.iconUrl || '',
        rate: asset.rate || 0,
        algorithm: asset.algorithm || '',
      },
      address: {
        accountName: address.accountName,
        accountId: address.accountId,
        asset: address.asset,
        address: address.address,
        addressType: address.addressType,
        addressDescription: address.addressDescription,
        tag: address.tag,
        addressIndex: address.addressIndex,
        legacyAddress: address.legacyAddress,
      },
      balance: {
        id: balance.id,
        total: balance.total,
        lockedAmount: balance.lockedAmount,
        available: balance.available,
        pending: balance.pending,
        selfStakedCPU: balance.selfStakedCPU,
        selfStakedNetwork: balance.selfStakedNetwork,
        pendingRefundCPU: balance.pendingRefundCPU,
        pendingRefundNetwork: balance.pendingRefundNetwork,
        totalStakedCPU: balance.totalStakedCPU,
        totalStakedNetwork: balance.totalStakedNetwork,
        blockHeight: balance.blockHeight,
        blockHash: balance.blockHash,
      },
    });
  }

  return summaries;
};

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
      // Return empty array instead of throwing an error to prevent app crashes during initialization
      return [];
    }

    try {
      console.log(`[EmbeddedWallet] Fetching transactions for device ${deviceId} since ${new Date(startDate).toISOString()}`);
      const transactions = await this._rootStore.embeddedWalletSDKStore.sdkInstance.getTransactions({
        startDate,
        incoming: true,
        outgoing: true
      });
      
      console.log(`[EmbeddedWallet] Retrieved ${transactions.data.length} transactions`);
      return transactions.data.map(tx => ({
        id: tx.id,
        status: tx.status as TTransactionStatus,
        createdAt: tx.createdAt,
        lastUpdated: tx.lastUpdated,
        details: tx as unknown as ITransactionDetailsDTO
      }));
    } catch (error) {
      console.error('[EmbeddedWallet] Error fetching transactions:', error);
      return [];
    }
  }

  public async createTransaction(deviceId: string, dataToSend: INewTransactionDTO): Promise<ITransactionDTO> {
    console.log('[EmbeddedWallet] Creating transaction:', dataToSend);
    
    if (!this._rootStore.embeddedWalletSDKStore.sdkInstance) {
      console.error('[EmbeddedWallet] Cannot create transaction - Embedded wallet SDK is not initialized');
      throw new Error('Embedded wallet SDK is not initialized');
    }

    try {
      console.log(`[EmbeddedWallet] Creating transaction for asset ${dataToSend.assetId} with amount ${dataToSend.amount}`);
      const transaction = await this._rootStore.embeddedWalletSDKStore.sdkInstance.createTransaction({
        source: {
          accountId: parseInt(dataToSend.accountId),
          assetId: dataToSend.assetId
        },
        destination: {
          address: dataToSend.destAddress
        },
        amount: dataToSend.amount,
        note: dataToSend.note
      });

      console.log(`[EmbeddedWallet] Transaction created successfully with ID: ${transaction.id}`);
      return {
        id: transaction.id,
        status: transaction.status as TTransactionStatus,
        createdAt: transaction.createdAt,
        lastUpdated: transaction.lastUpdated,
        details: transaction as unknown as ITransactionDetailsDTO
      };
    } catch (error) {
      console.error('[EmbeddedWallet] Error creating transaction:', error);
      throw error;
    }
  }

  public async cancelTransaction(deviceId: string, txId: string): Promise<void> {
    console.log(`[EmbeddedWallet] Cancelling transaction: ${txId}`);
    
    if (!this._rootStore.embeddedWalletSDKStore.sdkInstance) {
      console.error('[EmbeddedWallet] Cannot cancel transaction - Embedded wallet SDK is not initialized');
      throw new Error('Embedded wallet SDK is not initialized');
    }

    try {
      console.log(`[EmbeddedWallet] Sending cancel request for transaction: ${txId}`);
      await this._rootStore.embeddedWalletSDKStore.sdkInstance.cancelTransaction(txId);
      console.log(`[EmbeddedWallet] Transaction ${txId} cancelled successfully`);
    } catch (error) {
      console.error(`[EmbeddedWallet] Error cancelling transaction ${txId}:`, error);
      throw error;
    }
  }

  public async getAssets(): Promise<IAssetDTO[]> {
    if (!this._rootStore.embeddedWalletSDKStore.sdkInstance) {
      throw new Error('Embedded wallet SDK is not initialized');
    }

    const response = await this._rootStore.embeddedWalletSDKStore.sdkInstance.getAssets(100);
    return response.data.map(asset => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      decimals: asset.decimals,
      networkProtocol: asset.networkProtocol,
      testnet: asset.testnet,
      hasFee: asset.hasFee,
      type: asset.type,
      baseAsset: asset.baseAsset,
      ethNetwork: asset.ethNetwork,
      ethContractAddress: asset.ethContractAddress,
      issuerAddress: asset.issuerAddress,
      blockchainSymbol: asset.blockchainSymbol,
      deprecated: asset.deprecated,
      coinType: asset.coinType,
      blockchain: asset.blockchain,
      blockchainDisplayName: asset.blockchainDisplayName,
      blockchainId: asset.blockchainId,
      iconUrl: '',
      rate: 0,
      algorithm: ''
    }));
  }

  public async getAsset(assetId: string): Promise<IAssetDTO> {
    if (!this._rootStore.embeddedWalletSDKStore.sdkInstance) {
      throw new Error('Embedded wallet SDK is not initialized');
    }

    const asset = await this._rootStore.embeddedWalletSDKStore.sdkInstance.getAsset(parseInt(assetId));
    return {
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      decimals: asset.decimals,
      networkProtocol: asset.networkProtocol,
      testnet: asset.testnet,
      hasFee: asset.hasFee,
      type: asset.type,
      baseAsset: asset.baseAsset,
      ethNetwork: asset.ethNetwork,
      ethContractAddress: asset.ethContractAddress,
      issuerAddress: asset.issuerAddress,
      blockchainSymbol: asset.blockchainSymbol,
      deprecated: asset.deprecated,
      coinType: asset.coinType,
      blockchain: asset.blockchain,
      blockchainDisplayName: asset.blockchainDisplayName,
      blockchainId: asset.blockchainId,
      iconUrl: '',
      rate: 0,
      algorithm: ''
    };
  }

  public async getAddress(assetId: string): Promise<IAssetAddressDTO> {
    if (!this._rootStore.embeddedWalletSDKStore.sdkInstance) {
      throw new Error('Embedded wallet SDK is not initialized');
    }

    const response = await this._rootStore.embeddedWalletSDKStore.sdkInstance.getAddresses(parseInt(assetId));
    const address = response.data[0];
    return {
      accountName: address.accountName,
      accountId: address.accountId,
      asset: address.asset,
      address: address.address,
      addressType: address.addressType,
      addressDescription: address.addressDescription,
      tag: address.tag,
      addressIndex: address.addressIndex,
      legacyAddress: address.legacyAddress
    };
  }

  public async getBalance(assetId: string): Promise<IAssetBalanceDTO> {
    if (!this._rootStore.embeddedWalletSDKStore.sdkInstance) {
      throw new Error('Embedded wallet SDK is not initialized');
    }

    const balance = await this._rootStore.embeddedWalletSDKStore.sdkInstance.getBalance(parseInt(assetId));
    return {
      id: balance.id,
      total: balance.total,
      lockedAmount: balance.lockedAmount,
      available: balance.available,
      pending: balance.pending,
      selfStakedCPU: balance.selfStakedCPU,
      selfStakedNetwork: balance.selfStakedNetwork,
      pendingRefundCPU: balance.pendingRefundCPU,
      pendingRefundNetwork: balance.pendingRefundNetwork,
      totalStakedCPU: balance.totalStakedCPU,
      totalStakedNetwork: balance.totalStakedNetwork,
      blockHeight: balance.blockHeight,
      blockHash: balance.blockHash
    };
  }

  public async getAssetsSummary(): Promise<IAssetsSummaryDTO[]> {
    if (!this._rootStore.embeddedWalletSDKStore.sdkInstance) {
      throw new Error('Embedded wallet SDK is not initialized');
    }

    const response = await this._rootStore.embeddedWalletSDKStore.sdkInstance.getAssets(100);
    const summaries: IAssetsSummaryDTO[] = [];

    for (const asset of response.data) {
      const addressResponse = await this._rootStore.embeddedWalletSDKStore.sdkInstance.getAddresses(parseInt(asset.id));
      const address = addressResponse.data[0];
      const balance = await this._rootStore.embeddedWalletSDKStore.sdkInstance.getBalance(parseInt(asset.id));

      summaries.push({
        asset: {
          id: asset.id,
          symbol: asset.symbol,
          name: asset.name,
          decimals: asset.decimals,
          networkProtocol: asset.networkProtocol,
          testnet: asset.testnet,
          hasFee: asset.hasFee,
          type: asset.type,
          baseAsset: asset.baseAsset,
          ethNetwork: asset.ethNetwork,
          ethContractAddress: asset.ethContractAddress,
          issuerAddress: asset.issuerAddress,
          blockchainSymbol: asset.blockchainSymbol,
          deprecated: asset.deprecated,
          coinType: asset.coinType,
          blockchain: asset.blockchain,
          blockchainDisplayName: asset.blockchainDisplayName,
          blockchainId: asset.blockchainId,
          iconUrl: '',
          rate: 0,
          algorithm: ''
        },
        address: {
          accountName: address.accountName,
          accountId: address.accountId,
          asset: address.asset,
          address: address.address,
          addressType: address.addressType,
          addressDescription: address.addressDescription,
          tag: address.tag,
          addressIndex: address.addressIndex,
          legacyAddress: address.legacyAddress
        },
        balance: {
          id: balance.id,
          total: balance.total,
          lockedAmount: balance.lockedAmount,
          available: balance.available,
          pending: balance.pending,
          selfStakedCPU: balance.selfStakedCPU,
          selfStakedNetwork: balance.selfStakedNetwork,
          pendingRefundCPU: balance.pendingRefundCPU,
          pendingRefundNetwork: balance.pendingRefundNetwork,
          totalStakedCPU: balance.totalStakedCPU,
          totalStakedNetwork: balance.totalStakedNetwork,
          blockHeight: balance.blockHeight,
          blockHash: balance.blockHash
        }
      });
    }

    return summaries;
  }

  public async addAsset(assetId: string): Promise<void> {
    if (!this._rootStore.embeddedWalletSDKStore.sdkInstance) {
      throw new Error('Embedded wallet SDK is not initialized');
    }

    await this._rootStore.embeddedWalletSDKStore.sdkInstance.addAsset(parseInt(assetId));
  }
} 