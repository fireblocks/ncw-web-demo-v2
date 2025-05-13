import React from 'react';
import { BlueButton, Skeleton, Typography, styled } from '@foundation';
import IconEmptyPageNoAssets from '@icons/empty_page_no_assets.svg';
import IconEmptyPageNoNft from '@icons/empty_page_no_nft.svg';
import IconEmptyPageNoTx from '@icons/empty_page_no_tx.svg';
import IconEmptyPageNoWeb3 from '@icons/web3-main-icon.svg';
import IconPlus from '@icons/plus-icon.svg';
import { useTranslation } from 'react-i18next';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  flex: 1,
}));

const SkeletonStyled = styled(Skeleton)(() => ({
  borderRadius: 2,
}));

const PageNameStyled = styled(Typography)(({ theme }) => ({
  width: '100%',
  textAlign: 'left',
  color: theme.palette.text.primary,
  fontSize: 16,
  fontWeight: 600,
  textTransform: 'uppercase',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(10),
  lineHeight: '20px',
}));

const HeadingStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  alignItems: 'center',
  textAlign: 'center',
  gap: theme.spacing(3),
  height: 350,
  boxSizing: 'border-box',
}));

const HeadingTextStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  gap: theme.spacing(1),
}));

const TableStyled = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginTop: theme.spacing(10),
  padding: theme.spacing(0, 6),
}));

const PictureCellWrapperStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  alignItems: 'center',
}));

const TextCellStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const TableRowStyled = styled('div')(({ theme }) => ({
  display: 'grid',
  width: '100%',
  gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr 1fr',
  height: 64,
  alignItems: 'center',
  margin: theme.spacing(3, 0),
}));

const TableHeaderRowStyled = styled('div')(({ theme }) => ({
  display: 'grid',
  width: '100%',
  gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr 1fr',
  alignItems: 'center',
  margin: theme.spacing(5, 0, 2, 0),
}));

interface IProps {
  page: 'ASSETS' | 'NFT' | 'TRANSACTIONS' | 'WEB3';
  onAddAsset?: () => void;
}

const TableHeaderCell: React.FC = () => (
  <div>
    <SkeletonStyled variant="rectangular" width={100} height={8} animation={false} />
  </div>
);

const TablePictureCell: React.FC = () => (
  <PictureCellWrapperStyled>
    <SkeletonStyled variant="rectangular" width={64} height={64} animation={false} />
    <TextCellStyled>
      <SkeletonStyled variant="rectangular" width={104} height={16} animation={false} />
      <SkeletonStyled variant="rectangular" width={64} height={16} animation={false} />
    </TextCellStyled>
  </PictureCellWrapperStyled>
);

const TableTextCell: React.FC = () => (
  <TextCellStyled>
    <SkeletonStyled variant="rectangular" width={64} height={16} animation={false} />
    <SkeletonStyled variant="rectangular" width={104} height={16} animation={false} />
  </TextCellStyled>
);

export const EmptyPage: React.FC<IProps> = ({ page, onAddAsset }) => {
  const { t } = useTranslation();

  let icon = '';

  switch (page) {
    case 'ASSETS':
      icon = IconEmptyPageNoAssets;
      break;
    case 'NFT':
      icon = IconEmptyPageNoNft;
      break;
    case 'TRANSACTIONS':
      icon = IconEmptyPageNoTx;
      break;
    case 'WEB3':
      icon = IconEmptyPageNoWeb3;
      break;
    default:
      icon = IconEmptyPageNoTx;
      break;
  }

  return (
    <RootStyled>
      <HeadingStyled>
        <PageNameStyled>{t(`${page}.TITLE`)}</PageNameStyled>
        <img width={72} height={72} src={icon} alt={page} />
        <HeadingTextStyled>
          <Typography color="text.primary" variant="h5" component="h5">
            {t(`${page}.EMPTY_PAGE_TITLE`)}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {t(`${page}.EMPTY_PAGE_DESCRIPTION`)}
          </Typography>
          {onAddAsset && (
            <BlueButton
              onClick={onAddAsset}
              icon={IconPlus}
              caption={page === 'WEB3' ? t('WEB3.ADD_CONNECTION') : t('ASSETS.ADD_ASSET')}
            />
          )}
        </HeadingTextStyled>
      </HeadingStyled>
      <TableStyled>
        <TableHeaderRowStyled>
          <TableHeaderCell />
          <TableHeaderCell />
          <TableHeaderCell />
          <TableHeaderCell />
          <TableHeaderCell />
          <TableHeaderCell />
        </TableHeaderRowStyled>
        <TableRowStyled>
          <TablePictureCell />
          <TableTextCell />
          <TableTextCell />
          <TableTextCell />
          <TableTextCell />
          <TableTextCell />
        </TableRowStyled>
        <TableRowStyled>
          <TablePictureCell />
          <TableTextCell />
          <TableTextCell />
          <TableTextCell />
          <TableTextCell />
          <TableTextCell />
        </TableRowStyled>
        <TableRowStyled>
          <TablePictureCell />
          <TableTextCell />
          <TableTextCell />
          <TableTextCell />
          <TableTextCell />
          <TableTextCell />
        </TableRowStyled>
        <TableRowStyled>
          <TablePictureCell />
          <TableTextCell />
          <TableTextCell />
          <TableTextCell />
          <TableTextCell />
          <TableTextCell />
        </TableRowStyled>
        <TableRowStyled>
          <TablePictureCell />
          <TableTextCell />
          <TableTextCell />
          <TableTextCell />
          <TableTextCell />
          <TableTextCell />
        </TableRowStyled>
        <TableRowStyled>
          <TablePictureCell />
          <TableTextCell />
          <TableTextCell />
          <TableTextCell />
          <TableTextCell />
          <TableTextCell />
        </TableRowStyled>
      </TableStyled>
    </RootStyled>
  );
};
