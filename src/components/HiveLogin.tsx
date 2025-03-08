import React, { useState, useEffect } from 'react';
import { LogIn, Key, ExternalLink, User, LogOut } from 'lucide-react';
import { 
  loginWithKeychain, 
  loginWithHiveSigner, 
  isKeychainAvailable, 
  isLoggedIn,
  getCurrentUsername,
  logout,
  handleHiveSignerCallback
} from '../lib/hiveAuth';

interface HiveLoginProps {
  onLoginSuccess?: (username: string) => void;
  onLogout?: () => void;
}

const HiveLogin: React.FC<HiveLoginProps> = ({ onLoginSuccess, onLogout }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [keychainAvailable, setKeychainAvailable] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    if (isLoggedIn()) {
      setLoggedInUser(getCurrentUsername());
    }

    // Check if Hive Keychain is available
    setKeychainAvailable(isKeychainAvailable());

    // Check for HiveSigner callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      handleHiveSignerCallback(code)
        .then(username => {
          setLoggedInUser(username);
          if (onLoginSuccess) onLoginSuccess(username);
          
          // Clean up the URL
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(err => {
          setError('Failed to authenticate with HiveSigner');
          console.error(err);
        });
    }
  }, [onLoginSuccess]);

  const handleKeychainLogin = async () => {
    if (!username) {
      setError('Please enter your Hive username');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await loginWithKeychain(username);
      setLoggedInUser(username);
      if (onLoginSuccess) onLoginSuccess(username);
    } catch (error: any) {
      setError(error.message || 'Failed to login with Hive Keychain');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHiveSignerLogin = () => {
    const loginUrl = loginWithHiveSigner();
    window.location.href = loginUrl;
  };

  const handleLogout = () => {
    logout();
    setLoggedInUser(null);
    setShowDropdown(false);
    if (onLogout) onLogout();
  };

  if (loggedInUser) {
    return (
      <div className="relative">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-full hover:bg-indigo-50 transition-all border border-indigo-200"
        >
          <User size={18} />
          <span>{loggedInUser}</span>
        </button>
        
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 py-2">
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-indigo-50 flex items-center gap-2"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex gap-2 mb-4">
        {keychainAvailable ? (
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Hive username"
                className="w-full px-4 py-2 rounded-lg border border-indigo-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <button
                onClick={handleKeychainLogin}
                disabled={isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-1"
              >
                <Key size={16} />
                <span className="hidden sm:inline">Keychain</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => window.open('https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep', '_blank')}
            className="flex-1 px-4 py-2 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 flex items-center justify-center gap-2"
          >
            <Key size={18} />
            <span>Install Hive Keychain</span>
          </button>
        )}
        
        <button
          onClick={handleHiveSignerLogin}
          disabled={isLoading}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2"
        >
          <ExternalLink size={18} />
          <span>HiveSigner</span>
        </button>
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default HiveLogin;