import React from 'react';
import { Typography, styled } from '@foundation';
import { NFTTokenStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

export const CARD_HEIGHT = 410;
export const CARD_WIDTH = 360;

const RowStyled = styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  backgroundColor: theme.palette.primary.light,
  border: `1px solid ${theme.palette.secondary.main}`,
  borderTop: 0,
  cursor: 'pointer',
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: theme.palette.secondary.main,
  },
  display: 'flex',
  justifyContent: 'center',
}));

const ContentStyled = styled('div')(({ theme }) => ({
  paddingTop: theme.spacing(7),
}));

const ImgStyled = styled('img')(() => ({
  width: 224,
  height: 224,
}));

const TextWrapperStyled = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const TokenNameStyled = styled(Typography)(({ theme }) => ({
  fontSize: 24,
  fontWeight: 600,
  marginBottom: theme.spacing(1.5),
}));

interface IProps {
  filteredTokens: NFTTokenStore[];
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
}

export const NFTCard: React.FC<IProps> = observer(function NFTCard({ filteredTokens, columnIndex, rowIndex, style }) {
  const { t } = useTranslation();

  const token = filteredTokens[columnIndex * rowIndex + columnIndex];

  return (
    <RowStyled style={style}>
      <ContentStyled>
        <ImgStyled src={token.imageUrl || ''} alt={token.name} />
        <TextWrapperStyled>
          <TokenNameStyled variant="h5" color="text.primary">
            {token.name}
          </TokenNameStyled>
          <Typography variant="h6" color="text.secondary">
            {`${t('NFT.TOKEN_ID')} ${token.tokenId}`}
          </Typography>
        </TextWrapperStyled>
      </ContentStyled>
    </RowStyled>
  );
});
