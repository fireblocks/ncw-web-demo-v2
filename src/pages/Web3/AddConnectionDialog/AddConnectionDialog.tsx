import React, { useEffect } from 'react';
import { Dialog, SearchInput, Table, TableBody, styled, LoadingPage } from '@foundation';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import { EmptySearch } from '../../common/EmptySearch';
import { Connection } from '../Web3List';
import { ConnectionListItem } from './ConnectionListItem';
import { preloadAllImages } from '../Web3ListItem';

const TABLE_ROW_HEIGHT = 114;

const TableWrapperStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: 340,
}));

const SearchWrapperStyled = styled('div')(({ theme }) => ({
  borderBottom: `2px solid ${theme.palette.secondary.main}`,
  backgroundColor: theme.palette.background.paper,
}));

// Mock data for available connections
const availableConnections: Connection[] = [
  {
    id: '1',
    name: 'Metamask',
    description: 'A crypto wallet & gateway to blockchain apps',
    website: 'https://metamask.io',
    connectionDate: new Date(),
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
  },
  {
    id: '2',
    name: 'Uniswap',
    description: 'Swap, earn, and build on the leading decentralized crypto trading protocol',
    website: 'https://uniswap.org',
    connectionDate: new Date(),
    icon: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
  },
  {
    id: '3',
    name: 'Opensea',
    description: 'The world\'s first and largest NFT marketplace',
    website: 'https://opensea.io',
    connectionDate: new Date(),
    icon: 'https://opensea.io/static/images/logos/opensea.svg',
  },
  {
    id: '4',
    name: 'Magic Eden',
    description: 'The leading cross-chain NFT platform',
    website: 'https://magiceden.io',
    connectionDate: new Date(),
    icon: 'https://seeklogo.com/images/M/magic-eden-logo-F5E54454C5-seeklogo.com.png',
  },
  {
    id: '5',
    name: 'Aave',
    description: 'Open Source Liquidity Protocol',
    website: 'https://aave.com',
    connectionDate: new Date(),
    icon: 'https://cryptoicons.org/api/icon/aave/200',
  },
  {
    id: '6',
    name: 'Compound',
    description: 'Algorithmic, autonomous interest rate protocol',
    website: 'https://compound.finance',
    connectionDate: new Date(),
    icon: 'https://cryptoicons.org/api/icon/comp/200',
  },
];

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
  const [query, setQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // Preload all images when component mounts
  useEffect(() => {
    if (isOpen) {
      // Preload images for all available connections
      preloadAllImages(availableConnections);
    }
  }, [isOpen]);

  const filteredConnections = availableConnections.filter(
    (connection) => 
      connection.name.toLowerCase().includes(query.toLowerCase()) || 
      connection.description.toLowerCase().includes(query.toLowerCase()) ||
      connection.website.toLowerCase().includes(query.toLowerCase())
  );

  const handleDialogExited = () => {
    setQuery('');
  };

  return (
    <Dialog
      title={t('WEB3.ADD_DIALOG.TITLE')}
      description={t('WEB3.ADD_DIALOG.DESCRIPTION')}
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      onExited={handleDialogExited}
    >
      <div>
        {isLoading ? (
          <LoadingPage />
        ) : (
          <>
            <SearchWrapperStyled>
              <SearchInput query={query} setQuery={setQuery} placeholder={t('WEB3.ADD_DIALOG.SEARCH')} />
            </SearchWrapperStyled>
            <TableWrapperStyled>
              <Table>
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
                            <ConnectionListItem
                              filteredConnections={filteredConnections}
                              index={index}
                              style={style}
                              onDialogClose={onClose}
                              onAddConnection={onAddConnection}
                            />
                          )}
                        </FixedSizeList>
                      );
                    }}
                  </AutoSizer>
                </TableBody>
              </Table>
            </TableWrapperStyled>
          </>
        )}
      </div>
    </Dialog>
  );
});
