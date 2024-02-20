import { Typography, styled } from '@foundation';
import { observer } from 'mobx-react';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(6, 0, 0, 5),
  cursor: 'pointer',
}));

interface IProps {
  title: string;
  description: string;
}

export const SettingsItem: React.FC<IProps> = observer(function SettingsItem({ title, description }) {
  return (
    <RootStyled>
      <Typography variant="h4" color="text.primary">
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {description}
      </Typography>
    </RootStyled>
  );
});
