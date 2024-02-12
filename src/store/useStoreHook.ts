import { useContext } from 'react';
import { MobXProviderContext } from 'mobx-react';
import { RootStore } from './Root.store';
import { UserStore } from './User.store';

export function useRootStore(): RootStore {
  const stores = useContext(MobXProviderContext);
  return stores['rootStore'];
}

export function useUserStore(): UserStore {
  const rootStore = useRootStore();
  return rootStore.userStore;
}
