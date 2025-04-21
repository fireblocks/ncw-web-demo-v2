import { IGetTransactionsParams, ITransactionRequest } from '@fireblocks/embedded-wallet-sdk';
import { TransactionResponse } from 'ethers';
import { CreateTransactionResponse } from 'fireblocks-sdk';
import { RootStore } from '@store';

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

export const transactionResponseToTransactionData = (tx: any): ITransactionDTO => ({
  id: tx.id,
  status: tx.status,
  createdAt: tx.createdAt,
  lastUpdated: tx.lastUpdated,
  details: {
    id: tx.id,
    assetId: tx.assetId,
    source: tx.source,
    destination: tx.destination,
    requestedAmount: tx.requestedAmount,
    amountInfo: tx.amountInfo!,
    feeInfo: tx.feeInfo!,
    amount: tx.amount,
    netAmount: tx.netAmount,
    amountUSD: tx.amountUSD,
    serviceFee: tx.serviceFee!,
    networkFee: tx.networkFee,
    createdAt: tx.createdAt,
    lastUpdated: tx.lastUpdated,
    status: tx.status,
    txHash: tx.txHash,
    index: tx.index!,
    subStatus: tx.subStatus!,
    sourceAddress: tx.sourceAddress!,
    destinationAddress: tx.destinationAddress,
    destinationAddressDescription: tx.destinationAddressDescription!,
    destinationTag: tx.destinationTag,
    signedBy: tx.signedBy,
    createdBy: tx.createdBy,
    rejectedBy: tx.rejectedBy,
    addressType: tx.addressType,
    note: tx.note,
    exchangeTxId: tx.exchangeTxId,
    feeCurrency: tx.feeCurrency,
    numOfConfirmations: tx.numOfConfirmations!,
    extraParameters: tx.extraParameters,
    operation: tx.operation,
    treatAsGrossAmount: tx.treatAsGrossAmount,
  },
});

export const fetchTransactionsAllPages = async (
  rootStore: RootStore,
  filter: IGetTransactionsParams,
): Promise<TransactionResponse[]> => {
  const transactions: TransactionResponse[] = [];
  let pageCursor: string | null = null;

  do {
    if (pageCursor) {
      filter.pageCursor = pageCursor;
    }
    const response = await rootStore.fireblocksSDKStore.fireblocksEW.getTransactions(filter);
    pageCursor = response.paging?.next ?? null;
    if (response.data) {
      transactions.push(...(response.data as any));
    }
  } while (pageCursor);

  return transactions;
};

export const getTransactions = async (
  deviceId: string,
  startDate: number,
  token: string,
  rootStore: RootStore | null = null,
): Promise<ITransactionDTO[]> => {
  console.log('[EmbeddedWallet] Getting transactions, SDK instance:',
    rootStore?.fireblocksSDKStore.fireblocksEW ? 'exists' : 'missing',
  );

  if (!rootStore?.fireblocksSDKStore.fireblocksEW) {
    console.error('[EmbeddedWallet] Embedded wallet SDK is not initialized');
    // Return empty array instead of throwing
    return [];
  }

  try {
    console.log(
      `[EmbeddedWallet] Fetching transactions for device ${deviceId} since ${new Date(startDate).toISOString()}`,
    );

    // Attempt to fetch transactions from the SDK
    try {
      const transactionsIncoming = await rootStore?.fireblocksSDKStore.fireblocksEW.getTransactions({
        incoming: true,
      });

      const transactionsOutgoing = await rootStore?.fireblocksSDKStore.fireblocksEW.getTransactions({
        outgoing: true,
      });

      const allTransactions = [...(transactionsIncoming.data ?? []), ...(transactionsOutgoing?.data ?? [])];
      return allTransactions.map((tx) => ({
        id: tx.id,
        status: tx.status as TTransactionStatus,
        createdAt: tx.createdAt,
        lastUpdated: tx.lastUpdated,
        details: tx as unknown as ITransactionDetailsDTO,
      }));
    } catch (sdkError) {
      // Log SDK error but don't throw
      console.error('[EmbeddedWallet] Error fetching transactions from SDK:', sdkError);
      // Return empty array to avoid breaking the application
      return [];
    }
  } catch (error) {
    console.error('[EmbeddedWallet] Error in getTransactions:', error);
    return [];
  }
};

export const createTransaction = async (
  deviceId: string,
  token: string,
  dataToSend?: INewTransactionDTO,
  rootStore: RootStore | null = null,
): Promise<CreateTransactionResponse | null> => {
  try {
    console.log('[EmbeddedWallet] Creating transaction dataToSend: ', dataToSend);
    const assetId = dataToSend?.assetId;
    const destAddress = dataToSend?.destAddress ?? '';
    const amount = dataToSend?.amount || '0.00000001';
    const params: ITransactionRequest = {
      assetId,
      source: {
        id: '0',
      },
      destination: {
        type: 'ONE_TIME_ADDRESS' as any,
        oneTimeAddress: {
          address: destAddress,
        },
      },
      amount,
    };
    console.log(`[EmbeddedWallet] Creating transaction for asset ${assetId} with amount ${amount}`);
    const createdTrans = await rootStore?.fireblocksSDKStore.fireblocksEW.createTransaction(params);
    console.log('created transaction res: ', createdTrans);
    return createdTrans;
  } catch (e) {
    console.error('transactions.embedded.api.ts - createTransaction err: ', e);
    return null;
  }
};

export const cancelTransaction = async (
  deviceId: string,
  token: string,
  txId: string,
  rootStore: RootStore | null = null,
): Promise<any> => {
  console.log(`[EmbeddedWallet] Cancelling transaction: ${txId}`);

  if (!rootStore?.fireblocksSDKStore.fireblocksEW) {
    console.error('[EmbeddedWallet] Cannot cancel transaction - Embedded wallet SDK is not initialized');
    throw new Error('Embedded wallet SDK is not initialized');
  }

  try {
    console.log(`[EmbeddedWallet] Sending cancel request for transaction: ${txId}`);
    await rootStore.fireblocksSDKStore.fireblocksEW.cancelTransaction(txId);
    console.log(`[EmbeddedWallet] Transaction ${txId} cancelled successfully`);
  } catch (error) {
    console.error(`[EmbeddedWallet] Error cancelling transaction ${txId}:`, error);
    throw error;
  }
};
