import React from 'react';
import { Typography, styled } from '@foundation';
import IconNoNft from '@icons/no_nft_image.svg';
import { NFTTokenStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

export const CARD_HEIGHT = 410;
export const CARD_WIDTH = 360;
export const COLUMN_COUNT = 4;

const RowStyled = styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  backgroundColor: theme.palette.primary.light,
  border: `1px solid ${theme.palette.background.default}`,
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
  marginBottom: theme.spacing(1),
}));

interface IProps {
  filteredTokens: NFTTokenStore[];
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  setSelectedTokenId: (id: string | null) => void;
  onNewTransactionDialogOpen: () => void;
}

export const NFTCard: React.FC<IProps> = observer(function NFTCard({
  setSelectedTokenId,
  onNewTransactionDialogOpen,
  filteredTokens,
  columnIndex,
  rowIndex,
  style,
}) {
  const { t } = useTranslation();

  const token = filteredTokens[COLUMN_COUNT * rowIndex + columnIndex];

  if (!token) {
    return null;
  }

  return (
    <RowStyled
      style={style}
      onMouseEnter={() => {
        setSelectedTokenId(token.id);
      }}
      onMouseLeave={() => {
        setSelectedTokenId(null);
      }}
      onClick={() => {
        onNewTransactionDialogOpen();
      }}
    >
      <ContentStyled>
        <ImgStyled src={token.imageUrl || IconNoNft} alt={token.name} />
        <TextWrapperStyled>
          <TokenNameStyled variant="h3" color="text.primary">
            {token.name}
          </TokenNameStyled>
          <Typography variant="body2" color="text.secondary">
            {`${t('NFT.TOKEN_ID')} ${token.tokenId}`}
          </Typography>
        </TextWrapperStyled>
      </ContentStyled>
    </RowStyled>
  );
});
