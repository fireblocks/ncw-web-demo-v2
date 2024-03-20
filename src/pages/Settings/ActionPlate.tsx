import { Typography, styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(12, 0, 0, 8),
  cursor: 'pointer',
  backgroundColor: theme.palette.secondary.light,
  borderRadius: 4,
  boxSizing: 'border-box',
  '&:hover .IconStyled': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const IconStyled = styled('div')(({ theme }) => ({
  width: 56,
  height: 56,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.primary.light,
  borderRadius: 4,
  marginBottom: theme.spacing(4),
  transition: 'background-color 0.3s',
}));

const TextStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

interface IProps {
  onClick: () => void;
  caption: string;
  description?: string;
  iconSrc: string;
}

export const ActionPlate: React.FC<IProps> = ({ onClick, caption, description, iconSrc }) => (
  <RootStyled onClick={onClick}>
    <IconStyled className="IconStyled">
      <img src={iconSrc} width={16} />
    </IconStyled>
    <TextStyled>
      <Typography variant="h2" color="text.primary">
        {caption}
      </Typography>
      {description && (
        <Typography variant="h5" color="text.secondary">
          {description}
        </Typography>
      )}
    </TextStyled>
  </RootStyled>
);
