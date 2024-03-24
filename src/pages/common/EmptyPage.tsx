import React from 'react';
import { ActionButton, Skeleton, Typography, styled } from '@foundation';
import IconEmptyPage from '@icons/empty_page.svg';
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
  marginTop: theme.spacing(7),
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
  height: 500,
  boxSizing: 'border-box',
}));

const HeadingTextStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  gap: theme.spacing(3),
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
  page: 'ASSETS' | 'NFT' | 'TRANSACTIONS';
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

  return (
    <RootStyled>
      <HeadingStyled>
        <PageNameStyled>{t(`${page}.TITLE`)}</PageNameStyled>
        <img width={72} height={72} src={IconEmptyPage} alt={page} />
        <HeadingTextStyled>
          <Typography color="text.primary" variant="h2" component="h2">
            {t(`${page}.EMPTY_PAGE_TITLE`)}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {t(`${page}.EMPTY_PAGE_DESCRIPTION`)}
          </Typography>
          {onAddAsset && <ActionButton onClick={onAddAsset} caption={t('ASSETS.ADD_ASSET')} />}
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
