import React, { useMemo, useEffect, useState } from 'react';
import { TableCell, TableRow, TableTextCell, TableUnlinkCell, styled } from '@foundation';
import IconNoAsset from '@icons/no_asset_image.svg';
import { observer } from 'mobx-react';
import { Connection } from './Web3List';

export const RowStyled = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1.5fr 2fr 1fr 1fr',
  columnGap: theme.spacing(2), // Add spacing between columns
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
}));

const DAppIconImageStyled = styled('img')(() => ({
  width: 38,
  height: 38,
  objectFit: 'contain',
  // Prevent flickering during transitions
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  transform: 'translateZ(0)', // Force GPU acceleration
  WebkitFontSmoothing: 'antialiased', // Smooth rendering
  imageRendering: 'auto', // Use browser's default algorithm for image scaling
}));

// Global image cache to prevent reloading on hover
export const imageCache: Record<string, HTMLImageElement> = {};
// Global cache for failed URLs to prevent repeated attempts to load them
export const failedUrlsCache: Set<string> = new Set();

// Preload all images for the connections
export const preloadAllImages = (connections: Connection[]) => {
  // Preload the fallback icon first
  if (!imageCache[IconNoAsset]) {
    const fallbackImg = new Image();
    fallbackImg.src = IconNoAsset;
    fallbackImg.onload = () => {
      imageCache[IconNoAsset] = fallbackImg;
    };
  }

  connections.forEach(connection => {
    // Skip already failed URLs
    if (failedUrlsCache.has(connection.icon)) {
      return;
    }

    if (!imageCache[connection.icon]) {
      const img = new Image();
      img.src = connection.icon;
      img.onload = () => {
        imageCache[connection.icon] = img;
      };
      img.onerror = () => {
        // Mark URL as failed
        failedUrlsCache.add(connection.icon);
        // Don't cache failed images
        delete imageCache[connection.icon];
      };
    }
  });
};

// Get image from cache or load it
const getImage = (url: string): HTMLImageElement | null => {
  return imageCache[url] || null;
};

// Check if URL is in the failed cache
const isFailedUrl = (url: string): boolean => {
  return failedUrlsCache.has(url);
};

// Custom TableTitleCell with white background for the icon
const DAppTitleCell: React.FC<{ title: string; subtitle?: string; iconUrl: string }> = ({
  title,
  subtitle,
  iconUrl,
}) => {
  // Check if URL is already known to fail before any state or effects
  const initiallyFailed = isFailedUrl(iconUrl);

  // Use a ref to store the image element
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  // Track if the image is loaded
  const [isLoaded, setIsLoaded] = useState<boolean>(!!getImage(iconUrl) || initiallyFailed);
  // Track if the image has failed to load - initialize from the global cache
  const [hasError, setHasError] = useState<boolean>(initiallyFailed);

  // Get the image URL - either from cache or the original, or fallback if error
  const imageUrl = React.useMemo(() => {
    // If URL is known to fail, use fallback immediately
    if (initiallyFailed || hasError) {
      return IconNoAsset;
    }
    const cachedImage = getImage(iconUrl);
    return cachedImage ? cachedImage.src : iconUrl;
  }, [iconUrl, hasError, initiallyFailed]);

  // Handle image load event
  const handleImageLoad = React.useCallback(() => {
    // Only update state if not already failed
    if (!failedUrlsCache.has(iconUrl)) {
      setIsLoaded(true);
      setHasError(false);

      // Store in cache if not already there
      if (!getImage(iconUrl)) {
        const img = new Image();
        img.src = iconUrl;
        img.onload = () => {
          imageCache[iconUrl] = img;
        };
        img.onerror = () => {
          // Mark URL as failed globally
          failedUrlsCache.add(iconUrl);
          // Don't cache failed images
          delete imageCache[iconUrl];
        };
      }
    }
  }, [iconUrl]);

  // Handle image error event
  const handleImageError = React.useCallback(() => {
    // Mark URL as failed globally
    failedUrlsCache.add(iconUrl);
    setHasError(true);
    setIsLoaded(true); // Set as loaded so it's visible
    // Remove from cache if it was cached
    delete imageCache[iconUrl];
  }, [iconUrl]);

  return (
    <TableCell>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <DAppIconStyled>
          <DAppIconImageStyled 
            ref={imgRef}
            src={imageUrl} 
            alt={title} 
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ 
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out'
            }}
          />
        </DAppIconStyled>
        <div>
          <div style={{ color: 'white', fontSize: '14px' }}>{title}</div>
          {subtitle && <div style={{ opacity: 0.7, color: 'white', fontSize: '14px' }}>{subtitle}</div>}
        </div>
      </div>
    </TableCell>
  );
};

interface IProps {
  index: number;
  style: React.CSSProperties;
  filteredConnections: Connection[];
  selectedConnectionId: string | null;
  setSelectedConnectionId: (id: string | null) => void;
  onOpenDAppDetailsDialog: (connection: Connection) => void;
}

export const Web3ListItem: React.FC<IProps> = observer(function Web3ListItem({
  index,
  style,
  filteredConnections,
  selectedConnectionId,
  setSelectedConnectionId,
  onOpenDAppDetailsDialog,
}) {
  // Preload all images when component mounts
  useEffect(() => {
    preloadAllImages(filteredConnections);
  }, [filteredConnections]);

  const connection = filteredConnections[index];

  // Format the connection date
  const formattedDate = useMemo(
    () =>
      connection.connectionDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }),
    [connection.connectionDate],
  );

  return (
    <div
      key={connection.id}
      style={style}
      onMouseEnter={() => {
        setSelectedConnectionId(connection.id);
      }}
      onMouseLeave={() => {
        setSelectedConnectionId(null);
      }}
    >
      <TableRow>
        <RowStyled>
          <DAppTitleCell title={connection.name} iconUrl={connection.icon} />
          <TableTextCell text={connection.description} />
          <TableCell>
            <a
              href={connection.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                margin: 0,
                fontSize: '14px',
                lineHeight: '24px',
                fontWeight: 500,
                letterSpacing: '0.5px',
                fontFamily: 'Figtree',
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
                maxWidth: '100%',
              }}
            >
              {connection.website}
            </a>
          </TableCell>
          <TableCell>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <TableTextCell text={formattedDate} />
              {connection.id === selectedConnectionId && (
                <TableUnlinkCell
                  onUnlink={() => {
                    // Open the DApp details dialog
                    onOpenDAppDetailsDialog(connection);
                  }}
                />
              )}
            </div>
          </TableCell>
        </RowStyled>
      </TableRow>
    </div>
  );
});
