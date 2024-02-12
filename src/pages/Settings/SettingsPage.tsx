import { Typography, styled } from '@foundation';
import { observer } from 'mobx-react';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

export const SettingsPage = observer(function SettingsPage() {
  return (
    <RootStyled>
      <Typography variant="h4" color="text.primary">
        Hello im SettingsPage
      </Typography>
    </RootStyled>
  );
});
