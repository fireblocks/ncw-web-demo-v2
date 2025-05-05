import React, { useMemo, useEffect, useState } from 'react';
import { TableCell, TableRow, TableTextCell, TableUnlinkCell, styled } from '@foundation';
import { observer } from 'mobx-react';
import { Connection } from './Web3List';

export const RowStyled = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '1.5fr 2fr 1fr 1fr',
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
}));

// Global image cache to prevent reloading on hover
const imageCache: Record<string, HTMLImageElement> = {};

// Preload all images for the connections
export const preloadAllImages = (connections: Connection[]) => {
  connections.forEach(connection => {
    if (!imageCache[connection.icon]) {
      const img = new Image();
      img.src = connection.icon;
      img.onload = () => {
        imageCache[connection.icon] = img;
      };
    }
  });
};

// Get image from cache or load it
const getImage = (url: string): HTMLImageElement | null => {
  return imageCache[url] || null;
};

// Custom TableTitleCell with white background for the icon
const DAppTitleCell: React.FC<{ title: string; subtitle?: string; iconUrl: string }> = ({
  title,
  subtitle,
  iconUrl,
}) => {
  // Use a ref to store the image element
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  // Track if the image is loaded
  const [isLoaded, setIsLoaded] = useState<boolean>(!!getImage(iconUrl));

  // Get the image URL - either from cache or the original
  const imageUrl = React.useMemo(() => {
    const cachedImage = getImage(iconUrl);
    return cachedImage ? cachedImage.src : iconUrl;
  }, [iconUrl]);

  // Handle image load event
  const handleImageLoad = React.useCallback(() => {
    setIsLoaded(true);

    // Store in cache if not already there
    if (!getImage(iconUrl)) {
      const img = new Image();
      img.src = iconUrl;
      img.onload = () => {
        imageCache[iconUrl] = img;
      };
    }
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
}

export const Web3ListItem: React.FC<IProps> = observer(function Web3ListItem({
  index,
  style,
  filteredConnections,
  selectedConnectionId,
  setSelectedConnectionId,
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
                    // Handle unlink action here
                    console.log(`Unlink connection: ${connection.id}`);
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
