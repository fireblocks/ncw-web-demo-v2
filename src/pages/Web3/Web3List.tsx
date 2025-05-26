import React, { useEffect, useState } from 'react';
import {
  ActionButton,
  SearchInput,
  SortableTableHeaderCell,
  Table,
  TableBody,
  TableHead,
  TableHeaderCell,
  SortDirection,
} from '@foundation';
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
  onOpenDAppDetailsDialog: (connection: Connection) => void;
}

export const Web3List: React.FC<IProps> = observer(
  ({ connections, onAddConnectionDialogOpen, onOpenDAppDetailsDialog }) => {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
    const [sortField, setSortField] = useState<string | null>('connectionDate');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Preload all images when component mounts
    useEffect(() => {
      // Preload images for all connections as early as possible
      preloadAllImages(connections);
    }, [connections]);

    // Handle sorting
    const handleSort = (field: string) => {
      if (sortField === field) {
        // Toggle direction if same field
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        // Set new field and default to descending
        setSortField(field);
        setSortDirection('desc');
      }
    };

    // Filter connections based on search query
    const filteredConnections = connections.filter(
      (connection) =>
        connection.name.toLowerCase().includes(query.toLowerCase()) ||
        connection.description.toLowerCase().includes(query.toLowerCase()) ||
        connection.website.toLowerCase().includes(query.toLowerCase()),
    );

    // Sort connections based on sort field and direction
    const sortedConnections = [...filteredConnections].sort((a, b) => {
      if (!sortField) return 0;

      if (sortField === 'connectionDate') {
        const dateA = a.connectionDate.getTime();
        const dateB = b.connectionDate.getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }

      return 0;
    });

    return (
      <>
        <ActionsBoxWrapperStyled>
          <SearchWrapperStyled>
            <SearchInput
              query={query}
              setQuery={setQuery}
              placeholder={
                t('WEB3.SEARCH') + (sortedConnections.length > 0 ? ' (' + String(sortedConnections.length) + ')' : '')
              }
            />
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
              <SortableTableHeaderCell
                title={t('WEB3.TABLE.HEADERS.CONNECTION_DATE')}
                sortField="connectionDate"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </RowStyled>
          </TableHead>
          <TableBody>
            <AutoSizer>
              {({ height, width }) => {
                if (sortedConnections.length === 0) {
                  return <EmptySearch height={height} width={width} />;
                }

                return (
                  <FixedSizeList
                    height={height}
                    width={width}
                    itemCount={sortedConnections.length}
                    itemSize={TABLE_ROW_HEIGHT}
                  >
                    {({ index, style }) => (
                      <Web3ListItem
                        filteredConnections={sortedConnections}
                        index={index}
                        style={style}
                        selectedConnectionId={selectedConnectionId}
                        setSelectedConnectionId={setSelectedConnectionId}
                        onOpenDAppDetailsDialog={onOpenDAppDetailsDialog}
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
  },
);
