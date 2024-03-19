import { IconButton, styled } from '@foundation';
import IconCancel from '@icons/cancel.svg';
import IconSign from '@icons/sign.svg';
import { useTranslation } from 'react-i18next';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  width: '100%',
  gap: theme.spacing(2),
}));

interface IProps {
  isSigning?: boolean;
  onSign: () => void;
  onCancel: () => void;
}

export const TableSignCell: React.FC<IProps> = ({ isSigning, onSign, onCancel }) => {
  const { t } = useTranslation();

  return (
    <RootStyled>
      <IconButton tooltip={t('TRANSACTIONS.TABLE.CANCEL')} large onClick={onCancel}>
        <img src={IconCancel} />
      </IconButton>
      <IconButton disabled={isSigning} tooltip={t('TRANSACTIONS.TABLE.SIGN')} large onClick={onSign}>
        <img src={IconSign} />
      </IconButton>
    </RootStyled>
  );
};
