import React from 'react';
import { TableWrapper, Typography, styled } from '@foundation';
import { observer } from 'mobx-react';
import { useAssetsStore } from '@store';

const RootStyled = styled('div')(() => ({
  display: 'block',
}));

export const AssetsList: React.FC = observer(function AssetsList() {
  const assetsStore = useAssetsStore();

  return (
    <TableWrapper>
      <ul>
        {assetsStore.myAssets.map((a) => (
          <li key={a.id}>
            <Typography variant="subtitle1" color="text.primary">
              {a.name}
            </Typography>
          </li>
        ))}
      </ul>
    </TableWrapper>
  );
});
