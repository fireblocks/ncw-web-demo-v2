import { styled } from '@foundation';
import { observer } from 'mobx-react';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '#eeeeee',
}));

export const SettingsPage = observer(function SettingsPage() {
  return <RootStyled>Hello im SettingsPage</RootStyled>;
});
