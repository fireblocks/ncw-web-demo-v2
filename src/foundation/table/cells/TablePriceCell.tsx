import { Typography, styled } from '@foundation';
import { Tooltip } from '@mui/material';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

const TypographyStyled = styled(Typography)(() => ({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

interface IProps {
  price: string;
}

export const TablePriceCell: React.FC<IProps> = ({ price }) => {
  return (
    <RootStyled>
      <Tooltip title={price} arrow placement="top">
        <TypographyStyled component="p" color="text.primary" variant="body1">
          {price}
        </TypographyStyled>
      </Tooltip>
    </RootStyled>
  );
};
