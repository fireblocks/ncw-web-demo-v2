import React, { useEffect, useState } from 'react';
import { CreateNcwConnectionRequestFeeLevelEnum } from '@fireblocks/ts-sdk/models/create-ncw-connection-request.ts';
import { LoadingPage, Typography, styled } from '@foundation';
import { useStores } from '@store';
import { ENV_CONFIG } from 'env_config';
import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { EmptyPage } from '../common/EmptyPage';
import { AmountsStyled, HeadingAmount } from '../common/HeadingAmount';
import { AddConnectionDialog } from './AddConnectionDialog/AddConnectionDialog';
import { DAppDetailsDialog } from './DAppDetailsDialog/DAppDetailsDialog';
import { Connection, Web3List } from './Web3List';
import { preloadAllImages } from './Web3ListItem';
import { mapSessionDTOsToConnections, mapSessionDTOToConnection } from './mappers';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
}));

const HeadingStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(2, 0, 8, 0),
}));

// Mock data for Web3 connections when not using the embedded wallet SDK
const mockConnections = [
  {
    id: '1',
    name: 'Metamask',
    description: 'A crypto wallet & gateway to blockchain apps',
    website: 'https://metamask.io',
    connectionDate: new Date('2023-01-01T10:21:00'),
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
  },
  {
    id: '2',
    name: 'Uniswap',
    description: 'Swap, earn, and build on the leading decentralized crypto trading protocol',
    website: 'https://uniswap.org',
    connectionDate: new Date('2023-02-15T14:30:00'),
    icon: '../../assets/images/uniswap.png',
  },
  {
    id: '3',
    name: 'Opensea',
    description: "The world's first and largest NFT marketplace",
    website: 'https://opensea.io',
    connectionDate: new Date('2023-03-20T09:45:00'),
    icon: 'https://opensea.io/static/images/logos/opensea.svg',
  },
  {
    id: '4',
    name: 'Magic Eden',
    description: 'The leading cross-chain NFT platform',
    website: 'https://magiceden.io',
    connectionDate: new Date('2023-04-10T16:15:00'),
    icon: 'https://seeklogo.com/images/M/magic-eden-logo-F5E54454C5-seeklogo.com.png',
  },
];

export const Web3Page: React.FC = observer(() => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { web3Store, accountsStore, deviceStore } = useStores();

  const [isAddConnectionDialogOpen, setIsAddConnectionDialogOpen] = useState(false);
  const [isDAppDetailsDialogOpen, setIsDAppDetailsDialogOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useMockData, setUseMockData] = useState(!ENV_CONFIG.USE_EMBEDDED_WALLET_SDK);

  // Initialize connections
  useEffect(() => {
    const initConnections = async () => {
      if (useMockData) {
        setConnections(mockConnections);
        preloadAllImages(mockConnections);
      } else {
        setIsLoading(true);
        try {
          await web3Store.init();
          const apiConnections = mapSessionDTOsToConnections(web3Store.connections);
          setConnections(apiConnections);
          preloadAllImages(apiConnections);
        } catch (error: any) {
          console.error('Failed to initialize Web3 connections:', error);
          enqueueSnackbar(error.message || 'Failed to load Web3 connections', { variant: 'error' });
          // Fallback to mock data if API fails
          setConnections(mockConnections);
          preloadAllImages(mockConnections);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initConnections();
  }, [web3Store, useMockData, enqueueSnackbar]);

  // Refresh connections when web3Store.connections changes
  useEffect(() => {
    if (!useMockData && !web3Store.isLoading) {
      const apiConnections = mapSessionDTOsToConnections(web3Store.connections);
      setConnections(apiConnections);
    }
  }, [web3Store.connections, web3Store.isLoading, useMockData]);

  // Preload the image for the selected connection when it changes
  useEffect(() => {
    if (selectedConnection && selectedConnection.icon) {
      preloadAllImages([selectedConnection]);
    }
  }, [selectedConnection]);

  // Set the visited page in localStorage
  localStorage.setItem('VISITED_PAGE', 'web3');

  // Toggle between mock data and real API data
  const _toggleDataSource = () => {
    setUseMockData(!useMockData);
  };

  // Handle opening the DApp details dialog
  const handleOpenDAppDetailsDialog = (connection: Connection) => {
    // Preload the image for the selected connection
    if (connection && connection.icon) {
      preloadAllImages([connection]);
    }
    setSelectedConnection(connection);
    setIsDAppDetailsDialogOpen(true);
  };

  // Handle removing a connection
  const handleRemoveConnection = async (connectionId: string) => {
    if (useMockData) {
      // Use mock data
      setConnections(connections.filter((conn) => conn.id !== connectionId));
      enqueueSnackbar(t('WEB3.DETAILS_DIALOG.CONNECTION_REMOVED'), { variant: 'success' });
    } else {
      // Use real API
      try {
        setIsLoading(true);
        await web3Store.removeConnection(connectionId);
        enqueueSnackbar(t('WEB3.DETAILS_DIALOG.CONNECTION_REMOVED'), { variant: 'success' });
      } catch (error: any) {
        console.error('Failed to remove connection:', error);
        enqueueSnackbar(error.message || t('WEB3.DETAILS_DIALOG.ERROR_REMOVING'), { variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  // Handle adding a connection
  const handleAddConnection = async (connection: Connection) => {
    if (useMockData) {
      // Use mock data
      // Check if the connection already exists in the connections array
      const connectionExists = connections.some((conn) => conn.id === connection.id);

      if (!connectionExists) {
        // Only add the connection if it doesn't already exist
        setConnections([...connections, connection]);
      }

      setIsAddConnectionDialogOpen(false);
      enqueueSnackbar(t('WEB3.ADD_DIALOG.SUCCESS_MESSAGE'), { variant: 'success' });
    } else {
      // Use real API
      try {
        setIsLoading(true);

        let response;

        // Check if the connection already has an ID (meaning it was already created in AddConnectionDialog)
        if (connection.id && !connection.id.startsWith('temp_')) {
          // Connection already exists, no need to create it again
          console.log('Connection already exists, skipping creation:', connection.id);
          response = { id: connection.id };
        } else {
          // Get the current account ID
          const currentAccountId = accountsStore.currentAccount?.accountId;

          if (!currentAccountId && currentAccountId !== 0) {
            throw new Error('No account selected. Please select an account first.');
          }

          // Create a payload for the API that matches ICreateNcwConnectionRequest interface
          const payload = {
            ncwId: deviceStore.walletId, // The ID of the Non-Custodial Wallet (walletId)
            ncwAccountId: currentAccountId,
            feeLevel: CreateNcwConnectionRequestFeeLevelEnum.Medium, // Use MEDIUM as the default fee level
            uri: connection.connectionLink || '', // The WalletConnect uri provided by the dapp
            chainIds: [], // Optional array of blockchain network IDs
          };
          // Import the enum if not already imported at the top of the file
          response = await web3Store.createConnection(payload);
        }

        // Manually refresh connections
        await web3Store.getConnections(false);

        // Create a new connection object from the API response
        let newConnection: Connection;

        // Check if we got a 201 response with sessionMetadata
        if (response && response?.id && response?.sessionMetadata) {
          // Use the mapSessionDTOToConnection function to map the response to a Connection
          newConnection = mapSessionDTOToConnection(response);
        } else {
          // Fallback to the original connection object with the current date
          newConnection = {
            id: response?.id || Date.now().toString(),
            name: connection.name,
            description: connection.description,
            website: connection.website,
            connectionDate: new Date(),
            icon: connection.icon,
          };
        }

        // No need to update connections state directly
        // The useEffect hook will update the connections state when web3Store.connections changes

        setIsAddConnectionDialogOpen(false);
        enqueueSnackbar(t('WEB3.ADD_DIALOG.SUCCESS_MESSAGE'), { variant: 'success' });
      } catch (error: any) {
        console.error('Failed to add connection:', error);
        enqueueSnackbar(error.message || t('WEB3.ADD_DIALOG.ERROR_MESSAGE'), { variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <RootStyled>
      {connections.length === 0 && !isLoading ? (
        <EmptyPage
          page="WEB3"
          onAddAsset={() => {
            setIsAddConnectionDialogOpen(true);
          }}
        />
      ) : (
        <>
          <HeadingStyled>
            <Typography variant="h6" color="text.primary">
              {t('WEB3.TITLE')}
            </Typography>
            <AmountsStyled>
              <HeadingAmount title="DAPPS" titleColor="text.secondary" value={connections.length.toString()} />
            </AmountsStyled>
          </HeadingStyled>
          <Web3List
            connections={connections}
            onAddConnectionDialogOpen={() => {
              setIsAddConnectionDialogOpen(true);
            }}
            onOpenDAppDetailsDialog={handleOpenDAppDetailsDialog}
          />
        </>
      )}
      <AddConnectionDialog
        isOpen={isAddConnectionDialogOpen}
        onClose={() => {
          setIsAddConnectionDialogOpen(false);
        }}
        onAddConnection={(conn) => {
          void handleAddConnection(conn);
        }}
      />
      <DAppDetailsDialog
        isOpen={isDAppDetailsDialogOpen}
        onClose={() => {
          setIsDAppDetailsDialogOpen(false);
          setSelectedConnection(null);
        }}
        connection={selectedConnection}
        onRemoveConnection={(id) => {
          void handleRemoveConnection(id);
        }}
      />
    </RootStyled>
  );
});
