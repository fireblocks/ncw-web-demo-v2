import React, { useMemo } from 'react';
import { ActionButton, Progress, TableCell, TableRow, styled } from '@foundation';
import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { Connection } from '../Web3List';

const RowStyled = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '1fr 130px',
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
}));

// Custom TableTitleCell with white background for the icon
const DAppTitleCell: React.FC<{ title: string; subtitle?: string; iconUrl: string }> = ({ 
  title, 
  subtitle, 
  iconUrl 
}) => {
  return (
    <TableCell>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <DAppIconStyled>
          <DAppIconImageStyled src={iconUrl} alt={title} />
        </DAppIconStyled>
        <div>
          <div style={{ fontWeight: 'bold' }}>{title}</div>
          {subtitle && <div style={{ opacity: 0.7 }}>{subtitle}</div>}
        </div>
      </div>
    </TableCell>
  );
};

interface IProps {
  index: number;
  filteredConnections: Connection[];
  style: React.CSSProperties;
  onDialogClose: () => void;
  onAddConnection: (connection: Connection) => void;
}

export const ConnectionListItem: React.FC<IProps> = observer(function ConnectionListItem({
  index,
  style,
  filteredConnections,
  onDialogClose,
  onAddConnection,
}) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [hoveredLine, setHoveredLine] = React.useState<string | null>(null);
  const [isAddingConnection, setIsAddingConnection] = React.useState(false);

  const connection = filteredConnections[index];

  const handleAddConnection = (connection: Connection) => {
    setIsAddingConnection(true);
    
    // Simulate an API call with a timeout
    setTimeout(() => {
      try {
        // Set the connection date to now
        const newConnection = {
          ...connection,
          connectionDate: new Date(),
        };
        
        onAddConnection(newConnection);
        onDialogClose();
        setIsAddingConnection(false);
        enqueueSnackbar(t('WEB3.ADD_DIALOG.SUCCESS_MESSAGE'), { variant: 'success' });
      } catch (error) {
        setIsAddingConnection(false);
        enqueueSnackbar(t('WEB3.ADD_DIALOG.ERROR_MESSAGE'), { variant: 'error' });
      }
    }, 500); // Simulate a delay
  };

  return (
    <div
      style={style}
      key={connection.id}
      onMouseEnter={() => {
        setHoveredLine(connection.id);
      }}
      onMouseLeave={() => {
        setHoveredLine(null);
      }}
    >
      <TableRow>
        <RowStyled>
          <DAppTitleCell 
            title={connection.name} 
            subtitle={connection.description}
            iconUrl={connection.icon} 
          />
          <TableCell>
            {hoveredLine === connection.id ? (
              <>
                {isAddingConnection ? (
                  <Progress size="small" />
                ) : (
                  <ActionButton
                    isDialog
                    caption={t('WEB3.ADD_CONNECTION')}
                    onClick={() => {
                      handleAddConnection(connection);
                    }}
                  />
                )}
              </>
            ) : null}
          </TableCell>
        </RowStyled>
      </TableRow>
    </div>
  );
});
