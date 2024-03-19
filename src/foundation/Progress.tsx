import CircularProgress from '@mui/material/CircularProgress/CircularProgress';

const sizeMap = {
  small: 14,
  medium: 24,
  large: 40,
};

interface IProps {
  size?: 'small' | 'medium' | 'large';
}

export const Progress: React.FC<IProps> = ({ size = 'small' }) => (
  <CircularProgress
    sx={{
      color: (theme) => theme.palette.text.primary,
    }}
    size={sizeMap[size]}
    thickness={6}
  />
);
