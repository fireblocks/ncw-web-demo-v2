import { IconButton, styled } from '@foundation';
import IconReceive from '@icons/receive.svg';
import IconSend from '@icons/send.svg';
import { useTranslation } from 'react-i18next';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

interface IProps {
  totalBalance: number;
  onReceive?: () => void;
  onSend?: () => void;
}

export const TableTransferCell: React.FC<IProps> = ({ totalBalance, onReceive, onSend }) => {
  const { t } = useTranslation();

  return (
    <RootStyled>
      {onReceive && (
        <IconButton tooltip={t('ASSETS.RECEIVE')} large onClick={onReceive}>
          <img src={IconReceive} />
        </IconButton>
      )}
      {onSend && (
        <IconButton disabled={totalBalance === 0} tooltip={t('ASSETS.SEND')} large onClick={onSend}>
          <img src={IconSend} />
        </IconButton>
      )}
    </RootStyled>
  );
};
