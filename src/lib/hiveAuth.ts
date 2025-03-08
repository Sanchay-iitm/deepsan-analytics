import { Client } from '@hiveio/dhive';
import hivesigner from 'hivesigner';

// Initialize dhive client
const client = new Client(['https://api.hive.blog', 'https://api.hivekings.com', 'https://anyx.io']);

// Initialize HiveSigner
const hivesignerClient = new hivesigner.Client({
  app: 'deepsan-analytics',
  callbackURL: window.location.origin,
  scope: ['vote', 'comment']
});

// Check if Hive Keychain is available
export const isKeychainAvailable = (): boolean => {
  return typeof window !== 'undefined' && 'hive_keychain' in window;
};

// Login with Hive Keychain
export const loginWithKeychain = (username: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!isKeychainAvailable()) {
      reject(new Error('Hive Keychain is not installed'));
      return;
    }

    const memo = `Login to DeepSan Analytics: ${new Date().toISOString()}`;
    
    // @ts-ignore - hive_keychain is injected by the browser extension
    window.hive_keychain.requestSignBuffer(
      username,
      memo,
      'Posting',
      (response: any) => {
        if (response.success) {
          // Verify the signature on the server side in a real app
          localStorage.setItem('hive_username', username);
          localStorage.setItem('hive_auth_method', 'keychain');
          resolve(true);
        } else {
          reject(new Error(response.message));
        }
      }
    );
  });
};

// Login with HiveSigner
export const loginWithHiveSigner = (): string => {
  // Use direct URL construction to avoid CORS issues
  const baseUrl = 'https://hivesigner.com/oauth2/authorize';
  const clientId = 'deepsan-analytics';
  const redirectUri = encodeURIComponent(window.location.origin);
  const scope = encodeURIComponent('vote,comment');
  
  return `${baseUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
};

// Handle HiveSigner callback
export const handleHiveSignerCallback = async (code: string): Promise<string> => {
  try {
    // In a real app, you would exchange the code for an access token via your backend
    // For demo purposes, we'll simulate a successful login
    const username = `hivesigner_user_${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('hive_username', username);
    localStorage.setItem('hive_auth_method', 'hivesigner');
    localStorage.setItem('hive_access_token', 'simulated_token');
    return username;
  } catch (error) {
    console.error('Error handling HiveSigner callback:', error);
    throw error;
  }
};

// Logout
export const logout = (): void => {
  localStorage.removeItem('hive_username');
  localStorage.removeItem('hive_auth_method');
  localStorage.removeItem('hive_access_token');
};

// Check if user is logged in
export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem('hive_username');
};

// Get current username
export const getCurrentUsername = (): string | null => {
  return localStorage.getItem('hive_username');
};

// Get auth method
export const getAuthMethod = (): string | null => {
  return localStorage.getItem('hive_auth_method');
};