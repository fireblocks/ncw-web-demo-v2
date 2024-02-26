import { IconButton, styled } from '@foundation';
import IconReceive from '@icons/receive.svg';
import IconSend from '@icons/send.svg';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: theme.spacing(2.5),
}));

interface IProps {
  onReceive?: () => void;
  onSend?: () => void;
}

export const TableTransferCell: React.FC<IProps> = ({ onReceive, onSend }) => (
  <RootStyled>
    <IconButton large onClick={onReceive}>
      <img src={IconReceive} />
    </IconButton>
    <IconButton large onClick={onSend}>
      <img src={IconSend} />
    </IconButton>
  </RootStyled>
);
