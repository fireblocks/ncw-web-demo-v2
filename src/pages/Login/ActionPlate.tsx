import { Typography, styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(4, 3),
  cursor: 'pointer',
  borderRadius: 4,
  backgroundColor: theme.palette.primary.light,
  boxSizing: 'border-box',
  '&:hover .IconStyled': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const IconStyled = styled('div')(({ theme }) => ({
  width: 32,
  height: 32,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.secondary.main,
  borderRadius: 4,
  marginBottom: theme.spacing(2),
  transition: 'background-color 0.3s',
}));

const TextStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
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
      <Typography variant="body2" color="text.primary">
        {caption}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      )}
    </TextStyled>
  </RootStyled>
);
