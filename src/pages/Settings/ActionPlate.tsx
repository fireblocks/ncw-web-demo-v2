import { Progress, Typography, styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  cursor: 'pointer',
  padding: theme.spacing(15, 3, 3, 8),
  backgroundColor: theme.palette.secondary.light,
  minHeight: 300,
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
  gap: theme.spacing(1),
}));

interface IProps {
  onClick: () => void;
  caption: string;
  description?: string;
  iconSrc: string;
  isLoading?: boolean;
}

export const ActionPlate: React.FC<IProps> = ({ onClick, caption, description, iconSrc, isLoading }) => (
  <RootStyled onClick={onClick}>
    <IconStyled className="IconStyled">
      {isLoading ? <Progress size="small" /> : <img src={iconSrc} width={16} />}
    </IconStyled>
    <TextStyled>
      <Typography variant="h4" color="text.primary">
        {caption}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </TextStyled>
  </RootStyled>
);
