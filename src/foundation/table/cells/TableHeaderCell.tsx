import { Typography, styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(2, 0),
}));

interface IProps {
  title: string;
}

export const TableHeaderCell: React.FC<IProps> = ({ title }) => (
  <RootStyled>
    <Typography component="p" variant="caption" color="text.secondary">
      {title}
    </Typography>
  </RootStyled>
);
