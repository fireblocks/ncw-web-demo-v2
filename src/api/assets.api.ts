import { ENV_CONFIG } from '../env_config.ts';
import { getCall, postCall } from './utils.api';

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
): Promise<IAssetAddressDTO> => {
  const response = await postCall(`api/devices/${deviceId}/accounts/${accountId.toString()}/assets/${assetId}`, token);
  return response;
};

export const getAsset = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
): Promise<IAssetDTO> => {
  const response = await getCall(`api/devices/${deviceId}/accounts/${accountId.toString()}/assets/${assetId}`, token);
  return response.json();
};

export const getAssets = async (deviceId: string, accountId: number, token: string): Promise<IAssetDTO[]> => {
  const response = await getCall(`api/devices/${deviceId}/accounts/${accountId.toString()}/assets`, token);
  return response.json();
};

export const getAssetsSummary = async (
  deviceId: string,
  accountId: number,
  token: string,
): Promise<IAssetsSummaryDTO[]> => {
  const response = await getCall(`api/devices/${deviceId}/accounts/${accountId.toString()}/assets/summary`, token);
  const assetsMap = await response.json();
  return Object.values(assetsMap);
};

export const getSupportedAssets = async (deviceId: string, accountId: number, token: string): Promise<IAssetDTO[]> => {
  const response = await getCall(
    `api/devices/${deviceId}/accounts/${accountId.toString()}/assets/supported_assets`,
    token,
  );
  return response.json();
};

export const getAddress = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
): Promise<IAssetAddressDTO> => {
  const response = await getCall(
    `api/devices/${deviceId}/accounts/${accountId.toString()}/assets/${assetId}/address`,
    token,
  );
  return response.json();
};

export const getBalance = async (
  deviceId: string,
  accountId: number,
  assetId: string,
  token: string,
): Promise<IAssetBalanceDTO> => {
  const response = await getCall(
    `api/devices/${deviceId}/accounts/${accountId.toString()}/assets/${assetId}/balance`,
    token,
  );
  return response.json();
};

export const getCryptoIconUrl = (symbol: string) => {
  const normalizedSymbol = symbol.toLowerCase().replace(/(?:_?test\d*$)|(?:test\d*$)/i, '');
  return normalizedSymbol?.length && cryptoIconNamesLocally.includes(normalizedSymbol)
    ? `${String(ENV_CONFIG.VITE_BASE_FOLDER)}/icons/crypto-icons/${normalizedSymbol}.png`
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

const _coinSymbolToIdMap = {
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

const _coinsUsdRate = [
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
