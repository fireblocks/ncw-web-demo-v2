import { TTransactionStatus } from '@api';
import { Typography, styled } from '@foundation';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

const statusFormatter = (status: TTransactionStatus) => {
  switch (status) {
    case 'PENDING_SIGNATURE':
      return 'Pending signature';
    case 'SUBMITTED':
      return 'Submitted';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'CANCELLING':
      return 'Cancelling';
    case 'CONFIRMING':
      return 'Confirming';
    case 'QUEUED':
      return 'Queued';
    case 'FAILED':
      return 'Failed';
    default:
      return '';
  }
};

const statusColor = (status: TTransactionStatus) => {
  switch (status) {
    case 'SUBMITTED':
    case 'PENDING_SIGNATURE':
    case 'CONFIRMING':
      return 'primary.dark';

    case 'COMPLETED':
      return 'success.main';

    case 'CANCELLED':
    case 'CANCELLING':
    case 'FAILED':
      return 'error.main';

    case 'QUEUED':
    default:
      return 'text.primary';
  }
};

interface IProps {
  status: TTransactionStatus | null;
}

export const TableStatusCell: React.FC<IProps> = ({ status }) => (
  <RootStyled>
    {status && (
      <Typography component="p" variant="body1" color={statusColor(status)}>
        {statusFormatter(status)}
      </Typography>
    )}
  </RootStyled>
);
