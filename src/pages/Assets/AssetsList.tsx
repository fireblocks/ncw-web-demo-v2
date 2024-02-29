import React from 'react';
import {
  CopyText,
  Skeleton,
  Table,
  TableBalanceCell,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableTextCell,
  TableTitleCell,
  TableTransferCell,
  styled,
} from '@foundation';
import { useAssetsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

const RowStyled = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr 0.7fr 1fr 1fr',
}));

export const AssetsList: React.FC = observer(function AssetsList() {
  const assetsStore = useAssetsStore();
  const { t } = useTranslation();
  const [hoveredLine, setHoveredLine] = React.useState<string | null>(null);

  if (assetsStore.isLoading && !assetsStore.myAssets.length) {
    return (
      <Table>
        <Skeleton mode="TABLE" />
      </Table>
    );
  }

  return (
    <Table>
      <TableHead>
        <RowStyled>
          <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.CURRENCY')} />
          <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.BALANCE')} />
          <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.PRICE')} />
          <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.ADDRESS')} />
          <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.BASE_ASSET')} />
        </RowStyled>
      </TableHead>
      <TableBody>
        {assetsStore.myAssets.map((a) => (
          <TableRow key={a.id}>
            <RowStyled
              onMouseEnter={() => {
                setHoveredLine(a.id);
              }}
              onMouseLeave={() => {
                setHoveredLine(null);
              }}
            >
              <TableTitleCell title={a.name} subtitle={a.symbol} iconUrl={a.iconUrl} />
              <TableBalanceCell balance={a.availableBalance} balanceInUsd={a.availableBalanceInUSD} />
              <TableTextCell text={a.rate} />
              <TableCell>
                <CopyText text={a.address} />
              </TableCell>
              {hoveredLine === a.id ? <TableTransferCell /> : <TableTextCell text={a.baseAsset} />}
            </RowStyled>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
});
