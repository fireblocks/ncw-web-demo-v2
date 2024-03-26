import { Typography, styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const ImageStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  minWidth: 64,
  minHeight: 64,
  maxWidth: 64,
  maxHeight: 64,
  overflow: 'hidden',
  backgroundColor: theme.palette.secondary.main,
  borderRadius: 8,
}));

const TextStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

interface IProps {
  title: string;
  subtitle: string;
  iconUrl: string;
}

export const TableTitleCell: React.FC<IProps> = ({ title, subtitle, iconUrl }) => (
  <RootStyled>
    <ImageStyled>
      <img width="24px" height="24px" src={iconUrl} alt={title} />
    </ImageStyled>
    <TextStyled>
      <Typography component="p" color="text.primary" variant="body1">
        {title}
      </Typography>
      <Typography component="p" color="text.secondary" variant="body1">
        {subtitle}
      </Typography>
    </TextStyled>
  </RootStyled>
);
