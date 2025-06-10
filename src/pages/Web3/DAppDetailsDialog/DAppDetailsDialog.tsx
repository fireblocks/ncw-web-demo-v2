import React, { useState, useEffect } from 'react';
import { styled, Typography, Dialog, CopyText } from '@foundation';
import IconNoAsset from '@icons/no_asset_image.svg';
import IconUnlink from '@icons/unlink.svg';
import { Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { Connection } from '../Web3List';
import { failedUrlsCache, preloadAllImages, imageCache } from '../Web3ListItem';

// Container for the entire dialog content
const ContentContainerStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(4, 8),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

// Header section with DApp icon and name
const HeaderStyled = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
}));

// Custom styled component for the DApp icon with white background
const DAppIconStyled = styled('div')(({ theme }) => ({
  width: 56,
  height: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

// Icon image styling
const DAppIconImageStyled = styled('img')(() => ({
  width: 38,
  height: 38,
  objectFit: 'contain',
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  transform: 'translateZ(0)',
  WebkitFontSmoothing: 'antialiased',
  imageRendering: 'auto',
}));

// Text container for the header
const HeaderTextStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

// Connected dapp label
const ConnectedDappLabelStyled = styled(Typography)(() => ({
  color: '#6B7280',
  fontSize: '12px',
}));

// DApp name
const DAppNameStyled = styled(Typography)(() => ({
  color: 'white',
  fontSize: '36px',
}));

// Row for information items (Description, URL, etc.)
const InfoRowStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

// Label styling
const LabelStyled = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '14px',
  fontWeight: 600,
}));

// Value styling
const ValueStyled = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: '14px',
}));

// Blockchain logos container
const BlockchainLogosStyled = styled('div')(() => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
}));

// Single blockchain logo row
const BlockchainLogoRowStyled = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginRight: '16px',
}));

// Blockchain logo
const BlockchainLogoStyled = styled('img')(() => ({
  width: 24,
  height: 25,
}));

// Fireblocks ID container with max width
const FireblocksIdContainerStyled = styled('div')(() => ({
  maxWidth: '136px',
}));

// Remove connection button at the bottom
const RemoveButtonStyled = styled(Button)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: 'white',
  textTransform: 'none',
  padding: theme.spacing(1),
  marginTop: theme.spacing(2),
  alignSelf: 'flex-start',
  '&:hover': {
    backgroundColor: 'black',
  },
}));

// Mock data for supported blockchains
const mockBlockchains = [
  {
    id: '1',
    name: 'Ethereum',
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  {
    id: '2',
    name: 'Polygon',
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
  },
  {
    id: '3',
    name: 'Solana',
    logo: 'https://cryptologos.cc/logos/solana-sol-logo.svg',
  },
];

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  connection: Connection | null;
  onRemoveConnection: (connectionId: string) => void;
}

export const DAppDetailsDialog: React.FC<IProps> = ({ isOpen, onClose, connection, onRemoveConnection }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoveConfirmation, setIsRemoveConfirmation] = useState(false);

  // Initialize error state from the global cache
  const [hasImageError, setHasImageError] = useState(connection ? failedUrlsCache.has(connection.icon) : false);

  // Track if the image is loaded
  const [isLoaded, setIsLoaded] = useState(false);

  // Track which blockchain icons have failed to load
  const [failedBlockchainIcons, setFailedBlockchainIcons] = useState<Record<string, boolean>>({});

  // Preload the image when the connection changes
  useEffect(() => {
    if (connection) {
      // If the connection has an icon and it's not in the failed cache
      if (connection.icon && !failedUrlsCache.has(connection.icon)) {
        // Check if the image is already in the cache
        if (imageCache[connection.icon]) {
          setIsLoaded(true);
          setHasImageError(false);
        } else {
          // Preload the image
          const img = new Image();
          img.src = connection.icon;
          img.onload = () => {
            imageCache[connection.icon] = img;
            setIsLoaded(true);
            setHasImageError(false);
          };
          img.onerror = () => {
            failedUrlsCache.add(connection.icon);
            setHasImageError(true);
            setIsLoaded(true); // Set as loaded so it's visible
          };
        }
      } else if (connection.icon && failedUrlsCache.has(connection.icon)) {
        setHasImageError(true);
        setIsLoaded(true); // Set as loaded so it's visible
      }
    }
  }, [connection]);

  // Preload the image when the dialog is opened
  useEffect(() => {
    if (isOpen && connection) {
      // If we have a connection and the dialog is open, preload the image
      if (connection.icon && !failedUrlsCache.has(connection.icon)) {
        // Create a mock array with just this connection
        const mockConnections = [connection];
        // Use the preloadAllImages function to preload the image
        preloadAllImages(mockConnections);
      }
    } else if (!isOpen) {
      // Reset the loading state when the dialog is closed
      setIsLoaded(false);
    }
  }, [isOpen, connection]);

  // Format the connection date
  const formattedDate = connection
    ? connection.connectionDate.toISOString().split('T')[0] +
      ', ' +
      connection.connectionDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  // Check if URL is valid
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Use the actual connection ID from the API response
  const fireblocksConnectionId = connection ? connection.id : '';

  const handleShowRemoveConfirmation = () => {
    setIsRemoveConfirmation(true);
  };

  const handleCancelRemove = () => {
    setIsRemoveConfirmation(false);
    onClose();
  };

  const handleConfirmRemove = () => {
    if (!connection) return;

    setIsLoading(true);

    // Simulate an API call with a timeout
    setTimeout(() => {
      try {
        onRemoveConnection(connection.id);
        onClose();
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        enqueueSnackbar(t('WEB3.DETAILS_DIALOG.ERROR_REMOVING'), { variant: 'error' });
      }
    }, 500); // Simulate a delay
  };

  if (!connection) return null;

  // Reset isRemoveConfirmation when dialog is closed
  const handleClose = () => {
    setIsRemoveConfirmation(false);
    onClose();
  };

  return (
    <Dialog
      title={isRemoveConfirmation ? t('WEB3.DETAILS_DIALOG.REMOVE_CONFIRMATION_TITLE') : t('WEB3.DETAILS_DIALOG.TITLE')}
      isOpen={isOpen}
      onClose={handleClose}
      size="small"
    >
      {isRemoveConfirmation ? (
        <ContentContainerStyled>
          <Typography variant="body1" style={{ paddingBottom: '48px' }}>
            {t('WEB3.DETAILS_DIALOG.REMOVE_CONFIRMATION_TEXT', { dappName: connection.name })}
          </Typography>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <Button
              onClick={handleCancelRemove}
              sx={{
                textTransform: 'none',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                lineHeight: 1.43,
                letterSpacing: '0.01071em',
              }}
            >
              {t('WEB3.DETAILS_DIALOG.CANCEL')}
            </Button>

            <Button
              onClick={handleConfirmRemove}
              disabled={isLoading}
              sx={{
                textTransform: 'none',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                lineHeight: 1.43,
                letterSpacing: '0.01071em',
                backgroundColor: 'black',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
            >
              <img src={IconUnlink} alt="Unlink" width={17} height={17} />
              {t('WEB3.DETAILS_DIALOG.REMOVE_CONNECTION')}
            </Button>
          </div>
        </ContentContainerStyled>
      ) : (
        <ContentContainerStyled>
          {/* Header with DApp icon and name */}
          <HeaderStyled>
            <DAppIconStyled>
              <DAppIconImageStyled
                src={hasImageError ? IconNoAsset : imageCache[connection.icon]?.src || connection.icon}
                alt={connection.name}
                onError={() => {
                  setHasImageError(true);
                  // Add to global failed cache
                  failedUrlsCache.add(connection.icon);
                }}
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transition: 'opacity 0.2s ease-in-out',
                }}
              />
            </DAppIconStyled>
            <HeaderTextStyled>
              <ConnectedDappLabelStyled>{t('WEB3.DETAILS_DIALOG.CONNECTED_DAPP')}</ConnectedDappLabelStyled>
              <DAppNameStyled>{connection.name}</DAppNameStyled>
            </HeaderTextStyled>
          </HeaderStyled>

          {/* Description */}
          <InfoRowStyled>
            <LabelStyled>{t('WEB3.ADD_DIALOG.DESCRIPTION_LABEL')}</LabelStyled>
            <ValueStyled>{connection.description || t('WEB3.ADD_DIALOG.NA')}</ValueStyled>
          </InfoRowStyled>

          {/* URL */}
          <InfoRowStyled>
            <LabelStyled>{t('WEB3.ADD_DIALOG.URL_LABEL')}</LabelStyled>
            <ValueStyled>
              {(() => {
                if (!connection.website) {
                  return t('WEB3.ADD_DIALOG.NA');
                }

                if (isValidUrl(connection.website)) {
                  return (
                    <a
                      href={connection.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'white', textDecoration: 'none' }}
                    >
                      {connection.website}
                    </a>
                  );
                }

                return connection.website;
              })()}
            </ValueStyled>
          </InfoRowStyled>

          {/* Connection Date */}
          <InfoRowStyled>
            <LabelStyled>{t('WEB3.DETAILS_DIALOG.CONNECTION_DATE')}</LabelStyled>
            <ValueStyled>{formattedDate}</ValueStyled>
          </InfoRowStyled>

          {/* Supported Blockchains */}
          <InfoRowStyled>
            <LabelStyled>{t('WEB3.DETAILS_DIALOG.SUPPORTED_BLOCKCHAINS')}</LabelStyled>
            <BlockchainLogosStyled>
              {mockBlockchains.map((blockchain) => (
                <BlockchainLogoRowStyled key={blockchain.id}>
                  <BlockchainLogoStyled
                    src={failedBlockchainIcons[blockchain.id] ? IconNoAsset : blockchain.logo}
                    alt={blockchain.name}
                    onError={() => {
                      // Update the failedBlockchainIcons state when an icon fails to load
                      setFailedBlockchainIcons((prev) => ({
                        ...prev,
                        [blockchain.id]: true,
                      }));
                    }}
                  />
                  <ValueStyled>{blockchain.name}</ValueStyled>
                </BlockchainLogoRowStyled>
              ))}
            </BlockchainLogosStyled>
          </InfoRowStyled>

          {/* Fireblocks Connection ID */}
          <InfoRowStyled>
            <LabelStyled>{t('WEB3.DETAILS_DIALOG.FIREBLOCKS_CONNECTION_ID')}</LabelStyled>
            <FireblocksIdContainerStyled>
              <CopyText text={fireblocksConnectionId} />
            </FireblocksIdContainerStyled>
          </InfoRowStyled>

          {/* Remove Connection Button */}
          <RemoveButtonStyled onClick={handleShowRemoveConfirmation} disabled={isLoading}>
            <img src={IconUnlink} alt="Unlink" width={17} height={17} />
            {t('WEB3.DETAILS_DIALOG.REMOVE_CONNECTION')}
          </RemoveButtonStyled>
        </ContentContainerStyled>
      )}
    </Dialog>
  );
};
