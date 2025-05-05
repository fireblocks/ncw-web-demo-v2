import { styled } from '@foundation';
import IconCancel from '@icons/unlink.svg';
import { useTranslation } from 'react-i18next';
import { IconButton } from '../../IconButton';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
}));

const UnlinkButtonStyled = styled(IconButton)(() => ({
  width: 68,
  height: 52,
  marginLeft: 20,
  backgroundColor: 'black',
  '&:hover': {
    backgroundColor: 'black',
  },
  '& img': {
    width: 17,
    height: 17,
  },
}));

interface IProps {
  onUnlink?: () => void;
}

export const TableUnlinkCell: React.FC<IProps> = ({ onUnlink }) => {
  const { t } = useTranslation();

  return (
    <RootStyled>
      {onUnlink && (
        <UnlinkButtonStyled tooltip={t('WEB3.UNLINK')} onClick={onUnlink}>
          <img src={IconCancel} />
        </UnlinkButtonStyled>
      )}
    </RootStyled>
  );
};
