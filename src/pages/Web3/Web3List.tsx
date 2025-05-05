import React, { useEffect } from 'react';
import { ActionButton, SearchInput, Table, TableBody, TableHead, TableHeaderCell } from '@foundation';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import { ActionsBoxWrapperStyled, ActionsWrapperStyled, SearchWrapperStyled } from '../common/ActionsBox';
import { EmptySearch } from '../common/EmptySearch';
import { Web3ListItem, RowStyled, preloadAllImages } from './Web3ListItem';

const TABLE_ROW_HEIGHT = 105;

// Define the connection type
export interface Connection {
  id: string;
  name: string;
  description: string;
  website: string;
  connectionDate: Date;
  icon: string;
}

interface IProps {
  connections: Connection[];
  onAddConnectionDialogOpen: () => void;
}

export const Web3List: React.FC<IProps> = observer(function Web3List({ connections, onAddConnectionDialogOpen }) {
  const { t } = useTranslation();
  const [query, setQuery] = React.useState('');
  const [selectedConnectionId, setSelectedConnectionId] = React.useState<string | null>(null);

  // Preload all images when component mounts
  useEffect(() => {
    // Preload images for all connections as early as possible
    preloadAllImages(connections);
  }, [connections]);

  // Filter connections based on search query
  const filteredConnections = connections.filter(
    (connection) => 
      connection.name.toLowerCase().includes(query.toLowerCase()) || 
      connection.description.toLowerCase().includes(query.toLowerCase()) ||
      connection.website.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <ActionsBoxWrapperStyled>
        <SearchWrapperStyled>
          <SearchInput query={query} setQuery={setQuery} placeholder={t('WEB3.SEARCH')} />
        </SearchWrapperStyled>
        <ActionsWrapperStyled>
          <ActionButton onClick={onAddConnectionDialogOpen} caption={t('WEB3.ADD_CONNECTION')} />
        </ActionsWrapperStyled>
      </ActionsBoxWrapperStyled>
      <Table>
        <TableHead>
          <RowStyled>
            <TableHeaderCell title={t('WEB3.TABLE.HEADERS.DAPP')} />
            <TableHeaderCell title={t('WEB3.TABLE.HEADERS.DESCRIPTION')} />
            <TableHeaderCell title={t('WEB3.TABLE.HEADERS.WEBSITE')} />
            <TableHeaderCell title={t('WEB3.TABLE.HEADERS.CONNECTION_DATE')} />
          </RowStyled>
        </TableHead>
        <TableBody>
          <AutoSizer>
            {({ height, width }) => {
              if (filteredConnections.length === 0) {
                return <EmptySearch height={height} width={width} />;
              }

              return (
                <FixedSizeList
                  height={height}
                  width={width}
                  itemCount={filteredConnections.length}
                  itemSize={TABLE_ROW_HEIGHT}
                >
                  {({ index, style }) => (
                    <Web3ListItem 
                      filteredConnections={filteredConnections} 
                      index={index} 
                      style={style} 
                      selectedConnectionId={selectedConnectionId}
                      setSelectedConnectionId={setSelectedConnectionId}
                    />
                  )}
                </FixedSizeList>
              );
            }}
          </AutoSizer>
        </TableBody>
      </Table>
    </>
  );
});
