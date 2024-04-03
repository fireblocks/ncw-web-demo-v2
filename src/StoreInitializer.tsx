import React from 'react';
import {
  useAccountsStore,
  useAssetsStore,
  useDeviceStore,
  useFireblocksSDKStore,
  useNFTStore,
  useTransactionsStore,
  useUserStore,
} from '@store';
import { observer } from 'mobx-react';

export const StoreInitializer: React.FC = observer(function StoreInitializer() {
  const deviceStore = useDeviceStore();
  const assetsStore = useAssetsStore();
  const accountsStore = useAccountsStore();
  const userStore = useUserStore();
  const fireblocksSDKStore = useFireblocksSDKStore();
  const transactionsStore = useTransactionsStore();
  const NFTStore = useNFTStore();

  // Load device and accounts data -------------------
  React.useEffect(() => {
    if (userStore.userId) {
      deviceStore.init();
    }

    const fetchData = async () => {
      await deviceStore.assignDeviceToNewWallet();
      await accountsStore.init();
    };

    if (userStore.accessToken && deviceStore.deviceId && userStore.userId && deviceStore.automaticMode) {
      fetchData().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userStore.accessToken, deviceStore.deviceId, userStore.userId]);

  // Initialize Fireblocks SDK -------------------
  React.useEffect(() => {
    const fetchAssets = async () => {
      await fireblocksSDKStore.init();
    };

    if (accountsStore.currentAccount && deviceStore.automaticMode) {
      fetchAssets().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountsStore.currentAccount]);

  // Load assets and NFTs when sdk is ready -------------------
  React.useEffect(() => {
    const fetchAssets = async () => {
      await assetsStore.init();
      await NFTStore.init();
    };

    if (fireblocksSDKStore.keysAreReady) {
      fetchAssets().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fireblocksSDKStore.keysAreReady]);

  React.useEffect(
    () => () => {
      transactionsStore.dispose();
    },
    [transactionsStore],
  );

  return null;
});
