/**
 * Type definitions for the AddNewDeviceDialog components
 */

// Request decoded data type
export type TRequestDecodedData = { 
  email: string; 
  requestId: string; 
  platform: string 
};

// Base props for all dialog components
export interface IDialogProps {
  onClose: () => void;
}

// Props for the main AddNewDeviceDialog component
export interface IAddNewDeviceDialogProps extends IDialogProps {
  isOpen: boolean;
}

// Props for the RequestIdEntry component
export interface IRequestIdEntryProps {
  requestId: string;
  setRequestId: (value: string) => void;
  handleCheckRequestId: () => void;
  isQrScannerActive: boolean;
  toggleQrScanner: () => void;
  onScanError?: () => void; // Optional callback for when scanning fails
}

// Props for the QrScanner component
export interface IQrScannerProps {
  onScan: (result: string | null) => void;
  toggleQrScanner: () => void;
  onScanError?: () => void; // Optional callback for when scanning fails
}

// Props for the DeviceInfo component
export interface IDeviceInfoProps {
  decodedData: TRequestDecodedData;
  addDevice: () => Promise<void>;
  onCancel: () => void;
}

// Props for the Success component
export interface ISuccessProps {
  // No specific props needed for success component
}

// Props for the Error component
export interface IErrorProps {
  tryAgain: () => void;
}
