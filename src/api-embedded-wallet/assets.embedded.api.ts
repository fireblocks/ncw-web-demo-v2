import { RootStore } from '@store';

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
  rootStore: RootStore | null = null,
): Promise<IAssetAddressDTO> => {
  if (!rootStore?.fireblocksSDKStore?.fireblocksEW) {
    throw new Error('Embedded wallet SDK is not initialized');
  }
  
  try {
    const response = await rootStore.fireblocksSDKStore.fireblocksEW.addAsset(accountId, assetId);
    if (!response) {
      throw new Error('Failed to add asset');
    }
    console.log('[EmbeddedWallet] Added asset:', response);
    return response;
  } catch (error) {
    console.error('addAsset error:', error);
    throw error;
  }
};

export const getAsset = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IAssetDTO> => {
  if (!rootStore?.fireblocksSDKStore?.fireblocksEW) {
    throw new Error('Embedded wallet SDK is not initialized');
  }

  try {
    const asset = await rootStore.fireblocksSDKStore.fireblocksEW.getAsset(accountId, assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }
    
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
      iconUrl: getCryptoIconUrl(asset.symbol),
      rate: asset.rate || 0,
      algorithm: asset.algorithm || '',
    };
  } catch (error) {
    console.error('getAsset error:', error);
    throw error;
  }
};

export const getEmbeddedWalletAssets = async (rootStore: RootStore, accountId: number): Promise<IAssetDTO[]> => {
  const response = await rootStore.fireblocksSDKStore.fireblocksEW.getAssets(accountId);
  return response.data.map((asset) => ({
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
    iconUrl: getCryptoIconUrl(asset.symbol),
    rate: asset?.rate || 0,
    algorithm: asset?.algorithm || '',
  }));
};

export const getEmbeddedWalletAsset = async (rootStore: RootStore, assetId: string, accountId: number): Promise<IAssetDTO> => {
  const asset = await rootStore.fireblocksSDKStore.fireblocksEW.getAsset(accountId, assetId);
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
    iconUrl: getCryptoIconUrl(asset.symbol),
    rate: asset?.rate || 0,
    algorithm: asset?.algorithm || '',
  };
};

export const getAssets = async (
  deviceId: string,
  accountId: number,
  token: string,
  rootStore: RootStore | null = null,
): Promise<Promise<IAssetDTO>[]> => {
  console.log('[EmbeddedWallet] Getting assets');

  if (!rootStore?.fireblocksSDKStore.fireblocksEW) {
    console.error('[EmbeddedWallet] Embedded wallet SDK is not initialized');
    return [];
  }
  try {
    const response = await rootStore.fireblocksSDKStore.fireblocksEW.getAssets(accountId);
    return response.data.map((asset) => getEmbeddedWalletAsset(rootStore, asset.id, accountId));
  } catch (error) {
    console.log('[EmbeddedWallet] Error getting assets:', error);
    return [];
  }
};

// Add cache for asset summaries
let assetSummaryCache: {
  data: IAssetsSummaryDTO[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 30000; // Changed from 5000 to 30000 (30 seconds)

export const getEmbeddedWalletAssetsSummary = async (rootStore: RootStore, accountId: number): Promise<IAssetsSummaryDTO[]> => {
  // Check cache first
  // if (assetSummaryCache && (Date.now() - assetSummaryCache.timestamp) < CACHE_DURATION) {
  //   console.log('[EmbeddedWallet] Returning cached assets summary');
  //   return assetSummaryCache.data;
  // }

  console.log('[EmbeddedWallet] Fetching fresh assets summary');
  const response = await rootStore.fireblocksSDKStore.fireblocksEW.getAssets(accountId);
  
  // Batch all address and balance requests
  const promises = response.data.map(async (asset) => {
    const [addressResponse, balance] = await Promise.all([
      rootStore.fireblocksSDKStore.fireblocksEW.getAddresses(accountId, asset.id),
      rootStore.fireblocksSDKStore.fireblocksEW.getBalance(accountId, asset.id)
    ]);

    return {
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
        iconUrl: getCryptoIconUrl(asset.symbol),
        rate: asset?.rate || 0,
        algorithm: asset?.algorithm || '',
      },
      address: addressResponse.data[0],
      balance: balance
    };
  });

  const summaries = await Promise.all(promises);

  // Update cache
  assetSummaryCache = {
    data: summaries,
    timestamp: Date.now()
  };

  console.log('[EmbeddedWallet] Assets summary:', summaries);
  return summaries;
};

export const getAssetsSummary = async (
  deviceId: string,
  accountId: number,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IAssetsSummaryDTO[]> => {
  console.log('[EmbeddedWallet] Getting assets summary');
  try {
    return await getEmbeddedWalletAssetsSummary(rootStore, accountId);
  } catch (error) {
    console.log('[EmbeddedWallet] Error getting assets summary:', error);
    throw new Error('[EmbeddedWallet] Error getting assets summary:');
  }
};

export const getSupportedAssets = async (
  deviceId: string,
  accountId: number,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IAssetDTO[]> => {
  if (!rootStore?.fireblocksSDKStore?.fireblocksEW) {
    throw new Error('Embedded wallet SDK is not initialized');
  }

  try {
    const supportedAssets = await rootStore.fireblocksSDKStore.fireblocksEW.getSupportedAssets();
    if (!supportedAssets?.data) {
      throw new Error('Failed to get supported assets');
    }
    
    return supportedAssets.data.map(asset => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      decimals: asset.decimals || 0,
      networkProtocol: asset.networkProtocol,
      testnet: asset.testnet || false,
      hasFee: asset.hasFee || false,
      type: asset.type,
      baseAsset: asset.baseAsset,
      ethNetwork: asset.ethNetwork,
      ethContractAddress: asset.ethContractAddress,
      issuerAddress: asset.issuerAddress,
      blockchainSymbol: asset.blockchainSymbol,
      deprecated: asset.deprecated || false,
      coinType: asset.coinType,
      blockchain: asset.blockchain,
      blockchainDisplayName: asset.blockchainDisplayName,
      blockchainId: asset.blockchainId,
      iconUrl: getCryptoIconUrl(asset.symbol),
      rate: asset?.rate || 0,
      algorithm: asset?.algorithm || '',
    }));
  } catch (error) {
    console.error('getSupportedAssets error:', error);
    throw error;
  }
};

export const getAddress = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IAssetAddressDTO> => {
  if (!rootStore?.fireblocksSDKStore?.fireblocksEW) {
    throw new Error('Embedded wallet SDK is not initialized');
  }

  try {
    const address = await rootStore.fireblocksSDKStore.fireblocksEW.getAddresses(accountId, assetId);
    if (!address?.data[0]) {
      throw new Error('Failed to get address');
    }
    
    return {
      accountName: address?.data[0].accountName || '',
      accountId: address?.data[0].accountId || accountId.toString(),
      asset: address?.data[0].asset || assetId,
      address: address?.data[0].address || '',
      addressType: address?.data[0].addressType || '',
      addressDescription: address?.data[0].addressDescription,
      tag: address?.data[0].tag,
      addressIndex: address?.data[0].addressIndex,
      legacyAddress: address?.data[0].legacyAddress
    };
  } catch (error) {
    console.error('getAddress error:', error);
    throw error;
  }
};

export const getBalance = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IAssetBalanceDTO> => {
  if (!rootStore?.fireblocksSDKStore?.fireblocksEW) {
    throw new Error('Embedded wallet SDK is not initialized');
  }

  try {
    const balance = await rootStore.fireblocksSDKStore.fireblocksEW.getBalance(accountId, assetId);
    if (!balance) {
      throw new Error('Failed to get balance');
    }
    
    return {
      id: balance.id || assetId,
      total: balance.total || '0',
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
  } catch (error) {
    console.error('getBalance error:', error);
    throw error;
  }
};

const getCryptoIconUrl = (symbol: string) => {
  const normalizedSymbol = symbol.toLowerCase().replace(/(?:_?test\d*$)|(?:test\d*$)/i, '');
  return normalizedSymbol?.length && cryptoIconNamesLocally.includes(normalizedSymbol)
    ? `src/icons/crypto-icons/${normalizedSymbol}.png`
    : '';
};

// when you add new icons locally inside icons/crypto-icons folder, add the name here.
const cryptoIconNamesLocally = [
  'btc', // Bitcoin
  'eth', // Ethereum
  'usdt', // Tether
  'bnb', // Binance Coin
  'usdc', // USD Coin
  'xrp', // XRP
  'ada', // Cardano
  'doge', // Dogecoin
  'sol', // Solana
  'dot', // Polkadot
  'trx', // TRON
  'shib', // Shiba Inu
  'avax', // Avalanche
  'dai', // DAI
  'matic', // Polygon/Matic
  'uni', // Uniswap
  'link', // Chainlink
  'etc', // Ethereum Classic
  'ltc', // Litecoin
  'atom', // Cosmos
  'xlm', // Stellar
  'algo', // Algorand
  'near', // NEAR Protocol
  'ftm', // Fantom
  'egld', // Elrond
  'xmr', // Monero
  'cake', // PancakeSwap
  'axs', // Axie Infinity
  'vet', // VeChain
  'hbar', // Hedera
  'fil', // Filecoin
  'sand', // The Sandbox
  'mana', // Decentraland
  'xtz', // Tezos
  'theta', // Theta Network
  'aave', // Aave
  'one', // Harmony
  'eos', // EOS
  'grt', // The Graph
  'ftt', // FTX Token
  'zec', // Zcash
  'bch', // Bitcoin Cash
  'neo', // NEO
  'bat', // Basic Attention Token
  'enj', // Enjin Coin
  'icp', // Internet Computer
  'comp', // Compound
  'mkr', // Maker
  'waves', // Waves
  'dash', // Dash
  'crv', // Curve DAO Token
  'yfi', // yearn.finance
];
