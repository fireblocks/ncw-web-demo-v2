import { useContext } from 'react';
import { MobXProviderContext } from 'mobx-react';
import { AccountsStore } from './Accounts.store';
import { AssetsStore } from './Assets.store';
import { BackupStore } from './Backup.store';
import { DeviceStore } from './Device.store';
import { FireblocksSDKStore } from './FireblocksSDK.store';
import { NFTStore } from './NFT.store';
import { RootStore } from './Root.store';
import { TransactionsStore } from './Transactions.store';
import { UserStore } from './User.store';

export function useRootStore(): RootStore {
  const stores = useContext(MobXProviderContext);
  return stores['rootStore'];
}

export function useUserStore(): UserStore {
  const rootStore = useRootStore();
  return rootStore.userStore;
}

export function useDeviceStore(): DeviceStore {
  const rootStore = useRootStore();
  return rootStore.deviceStore;
}

export function useAssetsStore(): AssetsStore {
  const rootStore = useRootStore();
  return rootStore.assetsStore;
}

export function useTransactionsStore(): TransactionsStore {
  const rootStore = useRootStore();
  return rootStore.transactionsStore;
}

export function useAccountsStore(): AccountsStore {
  const rootStore = useRootStore();
  return rootStore.accountsStore;
}

export function useFireblocksSDKStore(): FireblocksSDKStore {
  const rootStore = useRootStore();
  return rootStore.fireblocksSDKStore;
}

export function useNFTStore(): NFTStore {
  const rootStore = useRootStore();
  return rootStore.nftStore;
}

export function useBackupStore(): BackupStore {
  const rootStore = useRootStore();
  return rootStore.backupStore;
}
