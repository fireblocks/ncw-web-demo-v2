import { Typography, styled } from '@foundation';
import { Tooltip } from '@mui/material';

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

  // Convert the text to string to ensure it works with both string and number types
  const textContent = String(text);

  return (
    <RootStyled>
      {textContent && textContent !== '--' ? (
        <Tooltip title={textContent} arrow placement="top">
          <TypographyStyled variant="body1" color={color}>
            {textContent}
          </TypographyStyled>
        </Tooltip>
      ) : (
        <TypographyStyled variant="body1" color={color}>
          {textContent}
        </TypographyStyled>
      )}
    </RootStyled>
  );
};
