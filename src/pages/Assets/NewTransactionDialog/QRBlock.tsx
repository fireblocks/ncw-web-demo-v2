import { styled } from '@foundation';
import QRCode from 'react-qr-code';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignContent: 'center',
  alignItems: 'center',
  justifyContent: 'space-between',
  border: `2px solid ${theme.palette.secondary.main}`,
  borderRadius: 8,
  padding: theme.spacing(0, 3),
  marginTop: theme.spacing(2),
}));

interface IProps {
  value: string;
}

export const QRBlock: React.FC<IProps> = ({ value }) => {
  return (
    <RootStyled>
      <QRCode value={value} style={{ width: '500px', height: '500px' }} />
    </RootStyled>
  );
};
