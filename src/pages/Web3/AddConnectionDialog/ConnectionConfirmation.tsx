import React, { useState, useEffect } from 'react';
import { styled, Typography, ActionButton } from '@foundation';
import IconNoAsset from '@icons/no_asset_image.svg';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Connection } from '../Web3List';
import { failedUrlsCache } from '../Web3ListItem';

// Container for the entire confirmation screen
const ConfirmationContainerStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

// Row for the DApp icon and name
const DAppRowStyled = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
}));

// Custom styled component for the DApp icon with white background
const DAppIconStyled = styled('div')(({ theme }) => ({
  width: 40,
  height: 40,
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
  width: 26,
  height: 27,
  objectFit: 'contain',
  // Prevent flickering during transitions
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  transform: 'translateZ(0)', // Force GPU acceleration
  WebkitFontSmoothing: 'antialiased', // Smooth rendering
  imageRendering: 'auto', // Use browser's default algorithm for image scaling
}));

// Row for information items (Description, URL)
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

// Buttons container
const ButtonsContainerStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

interface IProps {
  connection: Connection;
  onCancel: () => void;
  onConnect: (connection: Connection) => void;
  isLoading: boolean;
}

export const ConnectionConfirmation: React.FC<IProps> = ({ connection, onCancel, onConnect, isLoading }) => {
  const { t } = useTranslation();
  // Initialize error state from the global cache
  const [hasImageError, setHasImageError] = useState(failedUrlsCache.has(connection.icon));

  // Update error state if the URL is already in the failed cache
  useEffect(() => {
    if (failedUrlsCache.has(connection.icon) && !hasImageError) {
      setHasImageError(true);
    }
  }, [connection.icon, hasImageError]);

  return (
    <ConfirmationContainerStyled>
      {/* DApp Icon and Name */}
      <DAppRowStyled>
        <DAppIconStyled>
          <DAppIconImageStyled
            src={hasImageError ? IconNoAsset : connection.icon}
            alt={connection.name}
            onError={() => {
              setHasImageError(true);
              // Add to global failed cache
              failedUrlsCache.add(connection.icon);
            }}
          />
        </DAppIconStyled>
        <Typography variant="h6" color="text.primary">
          {connection.name}
        </Typography>
      </DAppRowStyled>

      {/* Description */}
      <InfoRowStyled>
        <LabelStyled>{t('WEB3.ADD_DIALOG.DESCRIPTION_LABEL')}</LabelStyled>
        <ValueStyled>{connection.description || t('WEB3.ADD_DIALOG.NA')}</ValueStyled>
      </InfoRowStyled>

      {/* URL */}
      <InfoRowStyled>
        <LabelStyled>{t('WEB3.ADD_DIALOG.URL_LABEL')}</LabelStyled>
        <ValueStyled>{connection.website || t('WEB3.ADD_DIALOG.NA')}</ValueStyled>
      </InfoRowStyled>

      {/* Buttons */}
      <ButtonsContainerStyled>
        <Button
          onClick={onCancel}
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
          caption={t('WEB3.ADD_DIALOG.CONNECT')}
          onClick={() => {
            onConnect(connection);
          }}
          disabled={isLoading}
          isDialog={true}
        />
      </ButtonsContainerStyled>
    </ConfirmationContainerStyled>
  );
};
