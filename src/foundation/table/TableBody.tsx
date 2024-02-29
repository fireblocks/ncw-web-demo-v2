import { ReactElement } from 'react';
import { styled } from '@foundation';
import AutoSizer from 'react-virtualized-auto-sizer';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
}));

export const TableBody: React.FC<{ children: ReactElement | ReactElement[] }> = ({ children }) => (
  <RootStyled>
    <AutoSizer>
      {({ height, width }) => (
        <div style={{ height: `${height}px`, width: ` ${width}px`, overflowY: 'scroll' }}>{children}</div>
      )}
    </AutoSizer>
  </RootStyled>
);
