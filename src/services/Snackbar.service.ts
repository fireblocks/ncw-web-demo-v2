import { VariantType } from 'notistack';

// Define the options interface for the snackbar service
interface SnackbarOptions {
  variant?: VariantType;
  autoHideDuration?: number | null;
}

// Define the interface for the snackbar service
interface ISnackbarService {
  enqueueSnackbar: (message: string, options?: SnackbarOptions) => void;
  closeSnackbar: (key?: string | number) => void;
}

// Create a singleton class for the snackbar service
class SnackbarService implements ISnackbarService {
  private static instance: SnackbarService;
  private _enqueueSnackbar: (message: string, options?: SnackbarOptions) => void = () => {};
  private _closeSnackbar: (key?: string | number) => void = () => {};

  private constructor() {}

  // Get the singleton instance
  public static getInstance(): SnackbarService {
    if (!SnackbarService.instance) {
      SnackbarService.instance = new SnackbarService();
    }
    return SnackbarService.instance;
  }

  // Set the enqueueSnackbar function from notistack
  public setEnqueueSnackbar(enqueueSnackbar: (message: string, options?: SnackbarOptions) => void): void {
    this._enqueueSnackbar = enqueueSnackbar;
  }

  // Set the closeSnackbar function from notistack
  public setCloseSnackbar(closeSnackbar: (key?: string | number) => void): void {
    this._closeSnackbar = closeSnackbar;
  }

  // Show a snackbar
  public enqueueSnackbar(message: string, options?: SnackbarOptions): void {
    // For error snackbars, set a longer autoHideDuration if not explicitly provided
    if (options?.variant === 'error' && options.autoHideDuration === undefined) {
      options.autoHideDuration = 6000;
    }

    this._enqueueSnackbar(message, options);
  }

  // Close a snackbar
  public closeSnackbar(key?: string | number): void {
    this._closeSnackbar(key);
  }
}

// Export the singleton instance
export const snackbarService = SnackbarService.getInstance();
