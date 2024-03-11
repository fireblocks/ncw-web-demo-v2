import { useContext } from 'react';
import { MobXProviderContext } from 'mobx-react';
import { AccountsStore } from './Accounts.store';
import { AssetsStore } from './Assets.store';
import { DeviceStore } from './Device.store';
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

export function useFireblocksSDKStore() {
  const rootStore = useRootStore();
  return rootStore.fireblocksSDKStore;
}

export function useNFTStore() {
  const rootStore = useRootStore();
  return rootStore.nftStore;
}
