import { ButtonsGroup } from '@foundation';
import { useTranslation } from 'react-i18next';

interface IProps {
  type: string;
  setType: (type: string) => void;
}

export const TxType: React.FC<IProps> = ({ setType, type }) => {
  const { t } = useTranslation();

  const buttons = [
    { value: 'TRANSFER', label: t('ASSETS.NEW_TRANSACTION_DIALOG.TRANSACTION_TYPE.TRANSFER') },
    { value: 'TYPED_MESSAGE', label: t('ASSETS.NEW_TRANSACTION_DIALOG.TRANSACTION_TYPE.TYPED_MESSAGE') },
  ];

  return (
    <ButtonsGroup
      onChange={setType}
      currentValue={type}
      caption={t('ASSETS.NEW_TRANSACTION_DIALOG.TRANSACTION_TYPE.CAPTION')}
      buttons={buttons}
    />
  );
};
