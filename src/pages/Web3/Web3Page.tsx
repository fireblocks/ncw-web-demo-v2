import React, { useEffect } from 'react';
import { LoadingPage, Typography, styled } from '@foundation';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { EmptyPage } from '../common/EmptyPage';
import { AmountsStyled, HeadingAmount } from '../common/HeadingAmount';
import { AddConnectionDialog } from './AddConnectionDialog/AddConnectionDialog';
import { DAppDetailsDialog } from './DAppDetailsDialog/DAppDetailsDialog';
import { Connection, Web3List } from './Web3List';
import { preloadAllImages } from './Web3ListItem';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
}));

const HeadingStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(2, 0, 8, 0),
}));

// Mock data for Web3 connections
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

export const Web3Page: React.FC = observer(function Web3Page() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [isAddConnectionDialogOpen, setIsAddConnectionDialogOpen] = React.useState(false);
  const [isDAppDetailsDialogOpen, setIsDAppDetailsDialogOpen] = React.useState(false);
  const [selectedConnection, setSelectedConnection] = React.useState<Connection | null>(null);
  const [connections, setConnections] = React.useState(mockConnections);
  const [isLoading, setIsLoading] = React.useState(false);

  // Preload all images when component mounts
  useEffect(() => {
    // Preload images for all connections at the highest level
    preloadAllImages(mockConnections);
  }, []);

  // Preload the image for the selected connection when it changes
  useEffect(() => {
    if (selectedConnection && selectedConnection.icon) {
      preloadAllImages([selectedConnection]);
    }
  }, [selectedConnection]);

  // Set the visited page in localStorage
  localStorage.setItem('VISITED_PAGE', 'web3');

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
  const handleRemoveConnection = (connectionId: string) => {
    setConnections(connections.filter(conn => conn.id !== connectionId));
    enqueueSnackbar(t('WEB3.DETAILS_DIALOG.CONNECTION_REMOVED'), { variant: 'success' });
  };

  if (isLoading) {
    return <LoadingPage />;
  }

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
              <HeadingAmount
                title={t('WEB3.CONNECTIONS')}
                titleColor="text.secondary"
                value={connections.length.toString()}
              />
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
        onAddConnection={(connection) => {
          setConnections([...connections, connection]);
          setIsAddConnectionDialogOpen(false);
        }}
      />
      <DAppDetailsDialog
        isOpen={isDAppDetailsDialogOpen}
        onClose={() => {
          setIsDAppDetailsDialogOpen(false);
          setSelectedConnection(null);
        }}
        connection={selectedConnection}
        onRemoveConnection={handleRemoveConnection}
      />
    </RootStyled>
  );
});
