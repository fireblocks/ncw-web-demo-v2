import React from 'react';
import {
  Skeleton,
  Table,
  TableBalanceCell,
  TableBody,
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
  gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr 1fr 1fr',
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
          <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.CHANGE_24H')} />
          <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.MARKET_CAP')} />
          <TableHeaderCell title={t('ASSETS.TABLE.HEADERS.VOLUME_24H')} />
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
              <TableBalanceCell balance={a.rate} balanceInUsd={a.rate} />
              <TableTextCell text={a.rate} />
              <TableTextCell mode="POSITIVE" text="+ 1%" />
              <TableTextCell text={a.rate} />
              {hoveredLine === a.id ? <TableTransferCell /> : <TableTextCell text={a.rate} />}
            </RowStyled>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
});
