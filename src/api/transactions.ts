import { getCall, postCall } from './utils';

export type TTransactionStatus =
  | 'PENDING_SIGNATURE'
  | 'SUBMITTED'
  | 'FAILED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'CONFIRMING'
  | 'QUEUED'
  | 'CANCELLING';

export type TFeeLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type TNewTransactionType = 'TYPED_MESSAGE' | 'TRANSFER';

export type TNewTransactionMode = 'SEND' | 'RECEIVE' | null;

export interface ITransferPeerDTO {
  id: string;
  type: string;
  name?: string;
  walletId?: string;
}

export interface IAmountInfoDTO {
  amount?: string;
  requestedAmount?: string;
  netAmount?: string;
  amountUSD?: string;
}

export interface IFeeInfoDTO {
  networkFee?: string;
  serviceFee?: string;
  gasPrice?: string;
}

export interface ITransactionDetailsDTO {
  id: string; //	ID of the transaction.
  assetId: string; //	Transaction asset.
  source: ITransferPeerDTO; //	Source of the transaction.
  destination: ITransferPeerDTO; //	Fireblocks supports multiple destinations for UTXO-based blockchains. For other blockchains, this array will always be composed of one element.
  requestedAmount: number; //	The amount requested by the user.
  amountInfo: IAmountInfoDTO; //	Details of the transaction's amount in string format.
  feeInfo: IFeeInfoDTO; //	Details of the transaction's fee in string format.
  amount: number; //	If the transfer is a withdrawal from an exchange, the actual amount that was requested to be transferred. Otherwise, the requested amount.
  netAmount: number; //	The net amount of the transaction, after fee deduction.
  amountUSD: number; //	The USD value of the requested amount.
  serviceFee: number; //	The total fee deducted by the exchange from the actual requested amount (serviceFee = amount - netAmount).
  treatAsGrossAmount: boolean; //	For outgoing transactions, if true, the network fee is deducted from the requested amount.
  networkFee: number; //	The fee paid to the network.
  createdAt: number; //	Unix timestamp.
  lastUpdated: number; //	Unix timestamp.
  status: string; //		The current status of the transaction.
  txHash: string; //	Blockchain hash of the transaction.
  index: number; //[optional] For UTXO based assets this is the vOut, for Ethereum based, this is the index of the event of the contract call.
  subStatus: string; //		More detailed status of the transaction.
  sourceAddress: string; //For account based assets only, the source address of the transaction. (Note: This parameter will be empty for transactions that are not: CONFIRMING, COMPLETED, or REJECTED/FAILED after passing CONFIRMING status.)
  destinationAddress: string; //Address where the asset were transferred.
  destinationAddressDescription: string; //Description of the address.
  destinationTag: string; //Destination tag for XRP, used as memo for EOS/XLM, or Bank Transfer Description for the fiat providers: Signet (by Signature), SEN (by Silvergate), or BLINC (by BCB Group).
  signedBy: string[]; // Signers of the transaction.
  createdBy: string; //Initiator of the transaction.
  rejectedBy: string; //User ID of the user that rejected the transaction (in case it was rejected).
  addressType: string; //[ ONE_TIME, WHITELISTED ].
  note: string; //Custom note of the transaction.
  exchangeTxId: string; //If the transaction originated from an exchange, this is the exchange tx ID.
  feeCurrency: string; //The asset which was taken to pay the fee (ETH for ERC-20 tokens, BTC for Tether Omni).
  operation: string; //	Default operation is "TRANSFER".
  numOfConfirmations: number; //The number of confirmations of the transaction. The number will increase until the transaction will be considered completed according to the confirmation policy.
  extraParameters: any; // JSON object	Protocol / operation specific parameters.
}

export interface ITransactionDTO {
  id: string;
  status: TTransactionStatus;
  createdAt?: number;
  lastUpdated?: number;
  details?: ITransactionDetailsDTO;
}

export interface INewTransactionDTO {
  note: string;
  accountId: string;
  assetId: string;
  amount: string;
  destAddress: string;
  feeLevel: TFeeLevel;
  estimateFee: boolean;
}

export const TX_POLL_INTERVAL = 5000;

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const getTransactions = async (deviceId: string, startDate: number, token: string): Promise<Response> => {
  const response = await getCall(
    `api/devices/${deviceId}/transactions?poll=true&startDate=${startDate.toString()}&details=true`,
    token,
  );
  return response;
};

export const createTransaction = async (
  deviceId: string,
  token: string,
  dataToSend?: INewTransactionDTO,
): Promise<ITransactionDTO> => {
  const createTxResponse = await postCall(`api/devices/${deviceId}/transactions`, token, dataToSend);
  return createTxResponse;
};

export const cancelTransaction = async (deviceId: string, token: string, txId: string): Promise<void> => {
  const response = await postCall(`api/devices/${deviceId}/transactions/${txId}/cancel`, token);
  return response;
};
