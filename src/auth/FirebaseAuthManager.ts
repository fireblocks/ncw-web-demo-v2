import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, AuthProvider, GoogleAuthProvider, OAuthProvider, User, getAuth, signInWithPopup } from 'firebase/auth';
import { IAuthManager, IUser } from './IAuthManager';
import { getUserGoogleDriveProvider } from './providers';

const firebaseConfig = {
  apiKey: 'AIzaSyA2E5vK3fhxvftpfS02T8eIC3SrXnIUjrs',
  authDomain: 'fireblocks-sdk-demo.firebaseapp.com',
  projectId: 'fireblocks-sdk-demo',
  storageBucket: 'fireblocks-sdk-demo.appspot.com',
  messagingSenderId: '127498444203',
  appId: '1:127498444203:web:31ff24e7a4c6bfa92e46ee',
};

export class FirebaseAuthManager implements IAuthManager {
  private readonly _auth: Auth;
  private _loggedUser: User | null = null;

  constructor() {
    console.log('[Firebase] Initializing FirebaseAuthManager');
    const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
    this._auth = getAuth(firebaseApp);
    this._loggedUser = this._auth.currentUser;
    console.log('[Firebase] Current user on init:', this._loggedUser ? `${this._loggedUser.displayName} (${this._loggedUser.email})` : 'None');
    this._auth.onAuthStateChanged((user) => {
      console.log('[Firebase] Auth state changed:', user ? `${user.displayName} (${user.email})` : 'Logged out');
      this._loggedUser = user;
    });
  }

  public async getGoogleDriveCredentials() {
    const provider = getUserGoogleDriveProvider(this._auth.currentUser!.email!);
    const result = await signInWithPopup(this._auth, provider);
    // TODO: persist credential from original firebase login
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    if (!token) {
      throw new Error('Failed to retrieve token');
    }
    return token;
  }

  public async login(provider: 'GOOGLE' | 'APPLE'): Promise<void> {
    console.log(`[Firebase] Attempting login with ${provider}`);
    let authProvider: AuthProvider;
    const googleProvider = new GoogleAuthProvider();

    switch (provider) {
      case 'GOOGLE':
        console.log('[Firebase] Setting up Google provider');
        googleProvider.setCustomParameters({ prompt: 'select_account' });
        authProvider = googleProvider;
        break;
      case 'APPLE':
        console.log('[Firebase] Setting up Apple provider');
        authProvider = new OAuthProvider('apple.com');
        break;
      default:
        console.error('[Firebase] Unsupported provider:', provider);
        throw new Error('Unsupported provider');
    }

    const unsubscribe = this._auth.onAuthStateChanged((user) => {
      console.log('[Firebase] Auth state changed during login:', user ? 'User logged in' : 'No user');
      this._loggedUser = user;
      unsubscribe();
    });

    try {
      console.log('[Firebase] Opening sign-in popup');
      const result = await signInWithPopup(this._auth, authProvider);
      console.log('[Firebase] Sign-in popup completed successfully');
      this._loggedUser = result.user;
    } catch (error) {
      console.error('[Firebase] Error during sign-in popup:', error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    console.log('[Firebase] Attempting logout');
    await this._auth.signOut();
    console.log('[Firebase] Logout completed');
    this._loggedUser = null;
  }

  public async getAccessToken(): Promise<string> {
    console.log('[Firebase] Getting access token');
    if (this._loggedUser) {
      try {
        const token = await this._loggedUser.getIdToken();
        console.log('[Firebase] Successfully retrieved access token');
        return token;
      } catch (error) {
        console.error('[Firebase] Error getting access token:', error);
        throw error;
      }
    }

    console.error('[Firebase] Cannot get access token - no user logged in');
    throw new Error('User is not authenticated');
  }

  public get loggedUser(): IUser | null {
    return this._loggedUser;
  }

  public onUserChanged(callback: (user: IUser | null) => void): () => void {
    return this._auth.onAuthStateChanged(callback);
  }
}
