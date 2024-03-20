import { TTransactionStatus } from '@api';
import { Typography, styled } from '@foundation';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

const statusFormatter = (status: TTransactionStatus | 'SIGNING') => {
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
    case 'SIGNING':
      return 'Signing';
    case 'FAILED':
      return 'Failed';
    default:
      return '';
  }
};

const statusColor = (status: TTransactionStatus | 'SIGNING') => {
  switch (status) {
    case 'SUBMITTED':
    case 'PENDING_SIGNATURE':
    case 'CONFIRMING':
    case 'QUEUED':
    case 'SIGNING':
      return 'primary.dark';

    case 'COMPLETED':
      return 'success.main';

    case 'CANCELLED':
    case 'CANCELLING':
    case 'FAILED':
      return 'error.main';

    default:
      return 'text.primary';
  }
};

interface IProps {
  status: TTransactionStatus | null;
  isSigning?: boolean;
}

export const TableStatusCell: React.FC<IProps> = ({ status, isSigning }) => (
  <RootStyled>
    {status && (
      <Typography component="p" variant="body1" color={statusColor(isSigning ? 'SIGNING' : status)}>
        {statusFormatter(isSigning ? 'SIGNING' : status)}
      </Typography>
    )}
  </RootStyled>
);
