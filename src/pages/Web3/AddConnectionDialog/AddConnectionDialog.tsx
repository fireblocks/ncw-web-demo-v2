import React, { useEffect } from 'react';
import { Dialog, TextInput, ActionButton, styled } from '@foundation';
import { Button } from '@mui/material';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Connection } from '../Web3List';
import { preloadAllImages, failedUrlsCache } from '../Web3ListItem';
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

export const AddConnectionDialog: React.FC<IProps> = observer(function AddConnectionDialog({ 
  isOpen, 
  onClose,
  onAddConnection 
}) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [connectionLink, setConnectionLink] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isConfirmationScreen, setIsConfirmationScreen] = React.useState(false);
  const [connectionDetails, setConnectionDetails] = React.useState<Connection | null>(null);

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
        }
      ];

      // Add the current connection details if available
      if (connectionDetails) {
        mockConnections.push(connectionDetails);
      }

      // Preload all icons
      preloadAllImages(mockConnections);
    }
  }, [isOpen, connectionDetails, defaultIconUrl]);

  const handleContinue = () => {
    if (!connectionLink) return;

    setIsLoading(true);

    // Simulate an API call with a timeout to get connection details
    setTimeout(() => {
      try {
        // Create a new connection with the link
        const newConnection: Connection = {
          id: Date.now().toString(),
          name: 'Custom Connection',
          description: connectionLink,
          website: connectionLink,
          connectionDate: new Date(),
          icon: defaultIconUrl, // Use the defaultIconUrl variable
        };

        setConnectionDetails(newConnection);
        setIsConfirmationScreen(true);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        enqueueSnackbar(t('WEB3.ADD_DIALOG.ERROR_MESSAGE'), { variant: 'error' });
      }
    }, 500); // Simulate a delay
  };

  const handleConnect = (connection: Connection) => {
    setIsLoading(true);

    // Simulate an API call with a timeout
    setTimeout(() => {
      try {
        onAddConnection(connection);
        onClose();
        setIsLoading(false);
        enqueueSnackbar(t('WEB3.ADD_DIALOG.DAPP_CONNECTED'), { variant: 'success' });
      } catch (error) {
        setIsLoading(false);
        enqueueSnackbar(t('WEB3.ADD_DIALOG.ERROR_MESSAGE'), { variant: 'error' });
      }
    }, 500); // Simulate a delay
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog
      title={isConfirmationScreen ? t('WEB3.ADD_DIALOG.CONFIRM_TITLE') : t('WEB3.ADD_DIALOG.TITLE')}
      description={t('WEB3.ADD_DIALOG.DESCRIPTION')}
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      onExited={handleDialogExited}
    >
      {isConfirmationScreen && connectionDetails ? (
        <ConnectionConfirmation
          connection={connectionDetails}
          onCancel={handleCancel}
          onConnect={handleConnect}
          isLoading={isLoading}
        />
      ) : (
        <FormContainerStyled>
          <TextInput
            label={t('WEB3.ADD_DIALOG.CONNECTION_LINK')}
            value={connectionLink}
            setValue={setConnectionLink}
            placeholder=""
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
              onClick={handleContinue}
              disabled={!connectionLink || isLoading}
              isDialog={true}
            />
          </ButtonsContainerStyled>
        </FormContainerStyled>
      )}
    </Dialog>
  );
});
