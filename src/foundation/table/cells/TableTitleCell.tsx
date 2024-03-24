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
  minWidth: 56,
  minHeight: 56,
  maxWidth: 56,
  maxHeight: 56,
  overflow: 'hidden',
  backgroundColor: theme.palette.secondary.main,
  borderRadius: 12,
}));

const TextStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
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
      <Typography component="p" color="text.primary" variant="subtitle2">
        {title}
      </Typography>
      <Typography component="p" color="text.secondary" variant="body1">
        {subtitle}
      </Typography>
    </TextStyled>
  </RootStyled>
);
