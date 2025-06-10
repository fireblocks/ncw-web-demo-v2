import React, { useEffect } from 'react';
import { CreateNcwConnectionRequestFeeLevelEnum } from '@fireblocks/ts-sdk/models/create-ncw-connection-request.ts';
import { Dialog, TextInput, ActionButton, styled } from '@foundation';
import { Button } from '@mui/material';
import { useStores } from '@store';
import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { Connection } from '../Web3List';
import { preloadAllImages, failedUrlsCache } from '../Web3ListItem';
import { mapSessionDTOToConnection } from '../mappers';
import { ConnectionConfirmation } from './ConnectionConfirmation';

const FormContainerStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const ButtonsContainerStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onAddConnection: (connection: Connection) => void;
}

export const AddConnectionDialog: React.FC<IProps> = observer(({ isOpen, onClose, onAddConnection }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { web3Store, accountsStore, deviceStore } = useStores();
  const [connectionLink, setConnectionLink] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isConfirmationScreen, setIsConfirmationScreen] = React.useState(false);
  const [connectionDetails, setConnectionDetails] = React.useState<Connection | null>(null);
  const [connectionId, setConnectionId] = React.useState<string | null>(null);

  // Default icon URL used for new connections
  const defaultIconUrl = 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg';

  // Preload the default icon when component mounts
  useEffect(() => {
    // Skip if already in failed cache
    if (failedUrlsCache.has(defaultIconUrl)) {
      return;
    }

    const img = new Image();
    img.src = defaultIconUrl;
    img.onerror = () => {
      // Mark as failed if it doesn't load
      failedUrlsCache.add(defaultIconUrl);
    };
  }, []);

  const handleDialogExited = () => {
    setConnectionLink('');
    setIsConfirmationScreen(false);
    setConnectionDetails(null);
    setConnectionId(null);
  };

  // Preload the connection details icon when it changes
  useEffect(() => {
    if (connectionDetails && connectionDetails.icon) {
      // Skip if already in failed cache
      if (failedUrlsCache.has(connectionDetails.icon)) {
        return;
      }

      const img = new Image();
      img.src = connectionDetails.icon;
      img.onerror = () => {
        // Mark as failed if it doesn't load
        failedUrlsCache.add(connectionDetails.icon);
      };
    }
  }, [connectionDetails]);

  // Preload all icons when dialog is opened
  useEffect(() => {
    if (isOpen) {
      // Create a mock connection with the default icon to preload it
      const mockConnections: Connection[] = [
        {
          id: 'default',
          name: 'Default',
          description: '',
          website: '',
          connectionDate: new Date(),
          icon: defaultIconUrl,
        },
      ];

      // Add the current connection details if available
      if (connectionDetails) {
        mockConnections.push(connectionDetails);
      }

      // Preload all icons
      preloadAllImages(mockConnections);
    }
  }, [isOpen, connectionDetails, defaultIconUrl]);

  const handleContinue = async () => {
    if (!connectionLink) return;

    setIsLoading(true);

    try {
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
        uri: connectionLink, // The WalletConnect uri provided by the dapp
        chainIds: [], // Optional array of blockchain network IDs
      };

      const response: any = await web3Store.createConnection(payload);

      if (response && response.id) {
        // Store the connection ID for later use
        setConnectionId(response.id);

        // Create a new connection object from the API response
        let newConnection: Connection;

        // Check if we got a response with sessionMetadata
        if (response.sessionMetadata) {
          // Use the mapSessionDTOToConnection function to map the response to a Connection
          newConnection = mapSessionDTOToConnection(response);
          newConnection.connectionLink = connectionLink || '';
        } else {
          // Fallback to a basic connection object
          newConnection = {
            id: response.id,
            name: response?.name || 'Custom Connection',
            description: response?.description || connectionLink,
            website: response?.url || connectionLink,
            connectionLink: connectionLink || '',
            connectionDate: new Date(),
            icon: response?.icon || defaultIconUrl,
          };
        }

        setConnectionDetails(newConnection);
        setIsConfirmationScreen(true);
      } else {
        throw new Error('Failed to create connection: Invalid response');
      }
    } catch (error: any) {
      console.error('[AddConnectionDialog] Error in handleContinue:', error);
      enqueueSnackbar(error.message || t('WEB3.ADD_DIALOG.ERROR_MESSAGE'), { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (connection: Connection) => {
    if (!connectionId) {
      enqueueSnackbar('Connection ID is missing. Please try again.', { variant: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      // Create a payload for the submitConnection API
      const payload = {
        approve: true, // Approve the connection
      };

      await web3Store.submitConnection(connectionId, payload);

      // Refresh the connections list
      await web3Store.getConnections(false);

      // Call the parent component's onAddConnection function to update the UI
      onAddConnection(connection);

      // Close the dialog
      onClose();
    } catch (error: any) {
      console.error('[AddConnectionDialog] Error in handleConnect:', error);
      enqueueSnackbar(error.message || t('WEB3.ADD_DIALOG.ERROR_MESSAGE'), { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog
      title={isConfirmationScreen ? t('WEB3.ADD_DIALOG.CONFIRM_TITLE') : t('WEB3.ADD_DIALOG.TITLE')}
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      onExited={handleDialogExited}
    >
      {isConfirmationScreen && connectionDetails ? (
        <ConnectionConfirmation
          connection={connectionDetails}
          onCancel={handleCancel}
          onConnect={(conn) => {
            void handleConnect(conn);
          }}
          isLoading={isLoading}
        />
      ) : (
        <FormContainerStyled>
          <TextInput
            label={t('WEB3.ADD_DIALOG.CONNECTION_LINK')}
            value={connectionLink}
            setValue={setConnectionLink}
            placeholder="Enter the connection link"
            disabled={isLoading}
          />

          <ButtonsContainerStyled>
            <Button
              onClick={handleCancel}
              sx={{
                textTransform: 'none',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                lineHeight: 1.43,
                letterSpacing: '0.01071em',
              }}
            >
              {t('WEB3.ADD_DIALOG.CANCEL')}
            </Button>

            <ActionButton
              caption={t('WEB3.ADD_DIALOG.CONTINUE')}
              onClick={() => {
                void handleContinue();
              }}
              disabled={!connectionLink || isLoading}
              isDialog={true}
            />
          </ButtonsContainerStyled>
        </FormContainerStyled>
      )}
    </Dialog>
  );
});
