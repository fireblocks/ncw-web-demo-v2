import React from 'react';
import { styled } from '@foundation';
import { observer } from 'mobx-react';
import { useAssetsStore } from '@store';

const RootStyled = styled('div')(() => ({
  display: 'block',
}));

export const AssetsList: React.FC = observer(function AssetsList() {
  const assetsStore = useAssetsStore();

  return (
    <RootStyled>
      {assetsStore.myAssets.map((a) => (
        <div key={a.id}>{a.name}</div>
      ))}
    </RootStyled>
  );
});
