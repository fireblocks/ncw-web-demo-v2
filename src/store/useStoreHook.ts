import { useContext } from 'react';
import { MobXProviderContext } from 'mobx-react';
import { RootStore } from './Root.store';
import { UserStore } from './User.store';
import { DeviceStore } from './Device.store';

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
