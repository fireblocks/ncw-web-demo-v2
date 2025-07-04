import { IGetTransactionsParams, ITransactionRequest } from '@fireblocks/embedded-wallet-sdk';
import { RootStore } from '@store';
import { TransactionResponse } from 'ethers';

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

export type TTransactionOperation = 'TYPED_MESSAGE' | 'TRANSFER';

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
  operation: TTransactionOperation;
  note: string;
  accountId: string;
  assetId: string;
  amount: string;
  destAddress: string;
  feeLevel: TFeeLevel;
  estimateFee: boolean;
}

export const TX_POLL_INTERVAL = 30000;

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
    const response = await rootStore?.fireblocksSDKStore?.fireblocksEW?.getTransactions(filter);
    pageCursor = response?.paging?.next ?? null;
    if (response?.data) {
      transactions.push(...(response.data as any));
    }
  } while (pageCursor);

  return transactions;
};

export const getTransactions = async (
  _deviceId: string,
  _startDate: number,
  _token: string,
  rootStore: RootStore | null = null,
): Promise<ITransactionDTO[]> => {
  if (!rootStore?.fireblocksSDKStore.fireblocksEW) {
    console.error('[EmbeddedWallet] Embedded wallet SDK is not initialized');
    // Return an empty array instead of throwing
    return [];
  }

  try {
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
        id: tx.id!,
        status: tx.status as TTransactionStatus,
        createdAt: tx.createdAt,
        lastUpdated: tx.lastUpdated,
        details: tx as unknown as ITransactionDetailsDTO,
      }));
    } catch (sdkError) {
      // Log SDK error but don't throw
      console.error('[EmbeddedWallet] Error fetching transactions from SDK:', sdkError);
      return [];
    }
  } catch (error) {
    console.error('[EmbeddedWallet] Error in getTransactions:', error);
    return [];
  }
};

export const createTransaction = async (
  _deviceId: string,
  _token: string,
  dataToSend: INewTransactionDTO,
  rootStore: RootStore | null = null,
): Promise<ITransactionDTO> => {
  try {
    if (!rootStore?.fireblocksSDKStore.fireblocksEW) {
      console.error('[EmbeddedWallet] Embedded wallet SDK is not initialized');
      throw new Error('Embedded wallet SDK is not initialized');
    }

    const assetId = dataToSend?.assetId;
    const destAddress = dataToSend?.destAddress ?? '';
    const amount = dataToSend?.amount || '0.00000001';

    let params: ITransactionRequest;
    switch (dataToSend?.operation) {
      case 'TYPED_MESSAGE':
        params = {
          operation: 'TYPED_MESSAGE',
          assetId,
          source: {
            id: dataToSend.accountId || '0',
          },
          extraParameters: {
            rawMessageData: {
              messages: [
                {
                  type: 'EIP712',
                  content: buildTypedData(),
                },
              ],
            },
          },
          note: dataToSend.note,
        };
        break;
      case 'TRANSFER':
        params = {
          operation: 'TRANSFER',
          assetId,
          source: {
            id: dataToSend.accountId || '0',
          },
          destination: {
            type: 'ONE_TIME_ADDRESS' as any,
            oneTimeAddress: {
              address: destAddress,
            },
          },
          amount,
          feeLevel: dataToSend?.feeLevel || 'MEDIUM',
          note: dataToSend.note,
        };
        break;
      default:
        console.error('transactions.embedded.api.ts - createTransaction: Invalid operation type');
        throw new Error('Invalid operation type');
    }
    const createdTrans = await rootStore?.fireblocksSDKStore.fireblocksEW.createTransaction(params);
    return transactionResponseToTransactionData(createdTrans);
  } catch (e) {
    console.error('transactions.embedded.api.ts - createTransaction err: ', e);
    throw new Error('Transactions creation failed');
  }
};

export const cancelTransaction = async (
  _deviceId: string,
  _token: string,
  txId: string,
  rootStore: RootStore | null = null,
): Promise<any> => {
  if (!rootStore?.fireblocksSDKStore.fireblocksEW) {
    console.error('[EmbeddedWallet] Cannot cancel transaction - Embedded wallet SDK is not initialized');
    throw new Error('Embedded wallet SDK is not initialized');
  }

  try {
    await rootStore.fireblocksSDKStore.fireblocksEW.cancelTransaction(txId);
  } catch (error) {
    console.error(`[EmbeddedWallet] Error cancelling transaction ${txId}:`, error);
    throw error;
  }
};

export const buildTypedData = (
  chainId = 42,
  fromAddress = '0x9EE5e175D09895b8E1E28c22b961345e1dF4B5aE',
  spender = '0xE1B48CddD97Fa4b2F960Ca52A66CeF8f1f8A58A5',
  nonce = 1,
) => ({
  types: {
    EIP712Domain: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'version',
        type: 'string',
      },
      {
        name: 'chainId',
        type: 'uint256',
      },
      {
        name: 'verifyingContract',
        type: 'address',
      },
    ],
    Permit: [
      {
        name: 'holder',
        type: 'address',
      },
      {
        name: 'spender',
        type: 'address',
      },
      {
        name: 'nonce',
        type: 'uint256',
      },
      {
        name: 'expiry',
        type: 'uint256',
      },
      {
        name: 'allowed',
        type: 'bool',
      },
    ],
  },
  primaryType: 'Permit',
  domain: {
    name: 'Dai Stablecoin',
    version: '1',
    chainId,
    verifyingContract: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
  },
  message: {
    holder: fromAddress,
    spender,
    nonce,
    expiry: Math.trunc((Date.now() + 60_000) / 1000),
    allowed: true,
  },
});
