import { RootStore } from '@store';
import { ENV_CONFIG } from '../env_config';

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
  _deviceId: string,
  accountId: number,
  assetId: string,
  _token: string,
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
    return response;
  } catch (error) {
    console.error('addAsset error:', error);
    throw error;
  }
};

export const getAsset = async (
  _deviceId: string,
  accountId: number,
  assetId: string,
  _token: string,
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
      ethNetwork: asset.ethNetwork ? Number(asset.ethNetwork) : undefined,
      ethContractAddress: asset.ethContractAddress,
      issuerAddress: asset.issuerAddress,
      blockchainSymbol: asset.blockchainSymbol,
      deprecated: asset.deprecated,
      coinType: asset.coinType,
      blockchain: asset.blockchain,
      blockchainDisplayName: asset.blockchainDisplayName,
      blockchainId: asset.blockchainId,
      iconUrl: getCryptoIconUrl(asset.symbol),
      rate: coinsUsdRate.find((item) => item.symbol.toLowerCase() === asset.symbol.toLowerCase())?.price || 0,
      algorithm: asset.algorithm || '',
    };
  } catch (error) {
    console.error('getAsset error:', error);
    throw error;
  }
};

export const getEmbeddedWalletAssets = async (rootStore: RootStore, accountId: number): Promise<IAssetDTO[]> => {
  if (!rootStore.fireblocksSDKStore.fireblocksEW) {
    throw new Error('Embedded wallet SDK is not initialized');
  }

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
    ethNetwork: asset.ethNetwork ? Number(asset.ethNetwork) : undefined,
    ethContractAddress: asset.ethContractAddress,
    issuerAddress: asset.issuerAddress,
    blockchainSymbol: asset.blockchainSymbol,
    deprecated: asset.deprecated,
    coinType: asset.coinType,
    blockchain: asset.blockchain,
    blockchainDisplayName: asset.blockchainDisplayName,
    blockchainId: asset.blockchainId,
    iconUrl: getCryptoIconUrl(asset.symbol),
    rate: coinsUsdRate.find((item) => item.symbol.toLowerCase() === asset.symbol.toLowerCase())?.price || 0,
    algorithm: asset?.algorithm || '',
  }));
};

export const getEmbeddedWalletAsset = async (
  rootStore: RootStore,
  assetId: string,
  accountId: number,
): Promise<IAssetDTO> => {
  if (!rootStore.fireblocksSDKStore.fireblocksEW) {
    throw new Error('Embedded wallet SDK is not initialized');
  }

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
    ethNetwork: asset.ethNetwork ? Number(asset.ethNetwork) : undefined,
    ethContractAddress: asset.ethContractAddress,
    issuerAddress: asset.issuerAddress,
    blockchainSymbol: asset.blockchainSymbol,
    deprecated: asset.deprecated,
    coinType: asset.coinType,
    blockchain: asset.blockchain,
    blockchainDisplayName: asset.blockchainDisplayName,
    blockchainId: asset.blockchainId,
    iconUrl: getCryptoIconUrl(asset.symbol),
    rate: coinsUsdRate.find((item) => item.symbol.toLowerCase() === asset.symbol.toLowerCase())?.price || 0,
    algorithm: asset?.algorithm || '',
  };
};

export const getAssets = async (
  _deviceId: string,
  accountId: number,
  _token: string,
  rootStore: RootStore | null = null,
): Promise<Promise<IAssetDTO>[]> => {
  if (!rootStore?.fireblocksSDKStore.fireblocksEW) {
    console.error('[EmbeddedWallet] Embedded wallet SDK is not initialized');
    return [];
  }
  try {
    const response = await rootStore.fireblocksSDKStore.fireblocksEW.getAssets(accountId);
    return response.data.map((asset) => getEmbeddedWalletAsset(rootStore, asset.id, accountId));
  } catch (error) {
    return [];
  }
};

// Add cache for asset summaries
let assetSummaryCache: {
  data: IAssetsSummaryDTO[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 30000; // Changed from 5000 to 30000 (30 seconds)

export const getEmbeddedWalletAssetsSummary = async (
  rootStore: RootStore,
  accountId: number,
): Promise<IAssetsSummaryDTO[]> => {
  if (!rootStore.fireblocksSDKStore.fireblocksEW) {
    throw new Error('Embedded wallet SDK is not initialized');
  }
  const response = await rootStore.fireblocksSDKStore.fireblocksEW.getAssets(accountId);

  // Batch all address and balance requests
  const promises = response.data.map(async (asset) => {
    // Store reference to fireblocksEW to ensure it's not null
    const fireblocksEW = rootStore.fireblocksSDKStore.fireblocksEW;
    if (!fireblocksEW) {
      throw new Error('Embedded wallet SDK is not initialized');
    }

    const [addressResponse, balance] = await Promise.all([
      fireblocksEW.getAddresses(accountId, asset.id),
      fireblocksEW.getBalance(accountId, asset.id),
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
        ethNetwork: asset.ethNetwork ? Number(asset.ethNetwork) : undefined,
        ethContractAddress: asset.ethContractAddress,
        issuerAddress: asset.issuerAddress,
        blockchainSymbol: asset.blockchainSymbol,
        deprecated: asset.deprecated,
        coinType: asset.coinType,
        blockchain: asset.blockchain,
        blockchainDisplayName: asset.blockchainDisplayName,
        blockchainId: asset.blockchainId,
        iconUrl: getCryptoIconUrl(asset.symbol),
        rate: coinsUsdRate.find((item) => item.symbol.toLowerCase() === asset.symbol)?.price || 0,
        algorithm: asset?.algorithm || '',
      },
      address: addressResponse.data[0],
      balance: balance,
    };
  });

  const summaries = await Promise.all(promises);

  // Update cache
  assetSummaryCache = {
    data: summaries,
    timestamp: Date.now(),
  };

  return summaries;
};

export const getAssetsSummary = async (
  _deviceId: string,
  accountId: number,
  _token: string,
  rootStore: RootStore | null = null,
): Promise<IAssetsSummaryDTO[]> => {
  try {
    if (!rootStore) {
      throw new Error('Embedded wallet SDK is not initialized');
    }
    return await getEmbeddedWalletAssetsSummary(rootStore, accountId);
  } catch (error) {
    throw new Error('[EmbeddedWallet] Error getting assets summary:');
  }
};

export const getSupportedAssets = async (
  _deviceId: string,
  _accountId: number,
  _token: string,
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

    return supportedAssets.data.map((asset) => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      decimals: asset.decimals || 0,
      networkProtocol: asset.networkProtocol,
      testnet: asset.testnet || false,
      hasFee: asset.hasFee || false,
      type: asset.type,
      baseAsset: asset.baseAsset,
      ethNetwork: asset.ethNetwork ? Number(asset.ethNetwork) : undefined,
      ethContractAddress: asset.ethContractAddress,
      issuerAddress: asset.issuerAddress,
      blockchainSymbol: asset.blockchainSymbol,
      deprecated: asset.deprecated || false,
      coinType: asset.coinType,
      blockchain: asset.blockchain,
      blockchainDisplayName: asset.blockchainDisplayName,
      blockchainId: asset.blockchainId,
      iconUrl: getCryptoIconUrl(asset.symbol),
      rate: coinsUsdRate.find((item) => item.symbol.toLowerCase() === asset.symbol)?.price || 0,
      algorithm: asset?.algorithm || '',
    }));
  } catch (error) {
    console.error('getSupportedAssets error:', error);
    throw error;
  }
};

export const getAddress = async (
  _deviceId: string,
  accountId: number,
  assetId: string,
  _token: string,
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
      legacyAddress: address?.data[0].legacyAddress,
    };
  } catch (error) {
    console.error('getAddress error:', error);
    throw error;
  }
};

export const getBalance = async (
  _deviceId: string,
  accountId: number,
  assetId: string,
  _token: string,
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
      blockHash: balance.blockHash,
    };
  } catch (error) {
    console.error('getBalance error:', error);
    throw error;
  }
};

/**
 * A map of coin symbols to their corresponding IDs
 * @example { "BTC": "bitcoin", "ETH": "ethereum" }
 */
interface CoinSymbolToIdMap {
  [symbol: string]: string;
}

/**
 * Represents the rate information for a coin
 */
interface CoinRate {
  coinType: string;
  rate: number | null;
}

/**
 * Fetches current USD rates for multiple cryptocurrencies
 * @param coinSymbolToIdMap Map of coin symbols to their CoinGecko IDs
 * @returns Promise with an array of coin rates
 */
const getAllRatesLive = async (coinSymbolToIdMap: CoinSymbolToIdMap): Promise<CoinRate[]> => {
  const coinIds = Object.values(coinSymbolToIdMap).join(',');
  const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    const result = Object.entries(coinSymbolToIdMap).map(([symbol, id]) => ({
      coinType: symbol,
      rate: data[id]?.usd ?? null,
    }));

    return result;
  } catch (error) {
    console.error('Error fetching coin prices:', error);
    throw error; // Rethrow to let caller handle the error
  }
};

export const getCryptoIconUrl = (symbol: string) => {
  const normalizedSymbol = symbol.toLowerCase().replace(/(?:_?test\d*$)|(?:test\d*$)/i, '');
  return normalizedSymbol?.length && cryptoIconNamesLocally.includes(normalizedSymbol)
    ? `${ENV_CONFIG.VITE_BASE_FOLDER}/icons/crypto-icons/${normalizedSymbol}.png`
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

const coinSymbolToIdMap = {
  btc: 'bitcoin',
  eth: 'ethereum',
  usdt: 'tether',
  bnb: 'binancecoin',
  usdc: 'usd-coin',
  xrp: 'ripple',
  ada: 'cardano',
  doge: 'dogecoin',
  sol: 'solana',
  dot: 'polkadot',
  trx: 'tron',
  shib: 'shiba-inu',
  avax: 'avalanche-2',
  dai: 'dai',
  matic: 'polygon',
  uni: 'uniswap',
  link: 'chainlink',
  etc: 'ethereum-classic',
  ltc: 'litecoin',
  atom: 'cosmos',
  xlm: 'stellar',
  algo: 'algorand',
  near: 'near',
  ftm: 'fantom',
  egld: 'elrond-erd-2',
  xmr: 'monero',
  cake: 'pancakeswap-token',
  axs: 'axie-infinity',
  vet: 'vechain',
  hbar: 'hedera-hashgraph',
  fil: 'filecoin',
  sand: 'the-sandbox',
  mana: 'decentraland',
  xtz: 'tezos',
  theta: 'theta-token',
  aave: 'aave',
  one: 'harmony',
  eos: 'eos',
  grt: 'the-graph',
  ftt: 'ftx-token',
  zec: 'zcash',
  bch: 'bitcoin-cash',
  neo: 'neo',
  bat: 'basic-attention-token',
  enj: 'enjincoin',
  icp: 'internet-computer',
  comp: 'compound-governance-token',
  mkr: 'maker',
  waves: 'waves',
  dash: 'dash',
  crv: 'curve-dao-token',
  yfi: 'yearn-finance',
};

const coinsUsdRate = [
  { symbol: 'BTC', price: 103445.17 },
  { symbol: 'ETH', price: 3929.31 },
  { symbol: 'USDT', price: 1.001 },
  { symbol: 'XRP', price: 2.3449 },
  { symbol: 'SOL', price: 240.93 },
  { symbol: 'BNB', price: 726.94 },
  { symbol: 'DOGE', price: 0.4497 },
  { symbol: 'ADA', price: 1.2065 },
  { symbol: 'USDC', price: 1.0001 },
  { symbol: 'TRX', price: 0.3308 },
  { symbol: 'AVAX', price: 52.64 },
  { symbol: 'SHIB', price: 0.00003189 },
  { symbol: 'TON', price: 6.9704 },
  { symbol: 'DOT', price: 10.7936 },
  { symbol: 'LINK', price: 24.2128 },
  { symbol: 'XLM', price: 0.4891 },
  { symbol: 'SUI', price: 4.3577 },
  { symbol: 'BCH', price: 612.92 },
  { symbol: 'HBAR', price: 0.2936 },
  { symbol: 'LTC', price: 139.36 },
  { symbol: 'NEAR', price: 7.9209 },
  { symbol: 'PEPE', price: 0.0000223 },
  { symbol: 'UNI', price: 15.4836 },
  { symbol: 'LEO', price: 9.3921 },
  { symbol: 'APT', price: 14.2126 },
  { symbol: 'ICP', price: 14.6189 },
  { symbol: 'POL', price: 0.7088 },
  { symbol: 'VET', price: 0.07011 },
  { symbol: 'CRO', price: 0.2124 },
  { symbol: 'ETC', price: 37.0979 },
  { symbol: 'DAI', price: 1.0003 },
];
