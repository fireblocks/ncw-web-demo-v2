import React from 'react';
import { Dialog } from '@foundation';
import { observer } from 'mobx-react';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAssetDialog: React.FC<IProps> = observer(function AddAssetDialog({ isOpen, onClose }) {
  return <Dialog isOpen={isOpen} onClose={onClose} />;
});
