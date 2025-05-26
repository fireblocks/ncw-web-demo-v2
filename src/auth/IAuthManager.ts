import { User } from 'firebase/auth';

export interface IUser {
  displayName: string | null;
  email: string | null;
  uid: string;
}

export interface IAuthManager {
  getGoogleDriveCredentials(): Promise<string>;
  login(provider: 'GOOGLE' | 'APPLE'): Promise<void>;
  logout(): Promise<void>;
  getAccessToken(): Promise<string>;
  onUserChanged(callback: (user: IUser | null) => void): () => void;
  get loggedUser(): User | null;
}
