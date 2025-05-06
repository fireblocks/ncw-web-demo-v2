import { Typography, styled } from '@foundation';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  overflow: 'hidden',
  width: '100%',
  maxWidth: '100%',
}));

const TypographyStyled = styled(Typography)(() => ({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

interface IProps {
  text: string | number;
  mode?: 'REGULAR' | 'POSITIVE' | 'NEGATIVE';
}

export const TableTextCell: React.FC<IProps> = ({ text, mode = 'REGULAR' }) => {
  let color = '';

  switch (mode) {
    case 'POSITIVE':
      color = 'success.main';
      break;
    case 'NEGATIVE':
      color = 'error.main';
      break;
    default:
      color = 'text.primary';
  }

  return (
    <RootStyled>
      <TypographyStyled component="p" variant="body1" color={color}>
        {text}
      </TypographyStyled>
    </RootStyled>
  );
};
