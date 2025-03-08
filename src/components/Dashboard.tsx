import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Search, Activity, Users, Award, Calendar, TrendingUp, BarChart2, Wallet, Gift, Power, Share2, LogIn, CreditCard, Bitcoin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  getAccountInfo, 
  getRewardHistory, 
  getDelegations, 
  getWalletHistory,
  calculateVotingPower,
  getEstimatedAccountValue
} from '../lib/hive';
import HiveLogin from './HiveLogin';
import { isLoggedIn, getCurrentUsername } from '../lib/hiveAuth';
import PaymentReceipt from './PaymentReceipt';
import { createPremiumMembership, verifyUPIPayment } from '../lib/payments';

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, className }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md animate-fade-in ${className}`}>
    <div className="flex items-center gap-4">
      <div className="p-3 bg-indigo-100 rounded-full">
        <Icon className="w-6 h-6 text-indigo-600" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

interface TabButtonProps {
  name: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  premium?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({ name, icon: Icon, label, isActive, onClick, premium }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      isActive 
        ? 'bg-indigo-600 text-white' 
        : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
    {premium && (
      <span className="ml-2 px-2 py-0.5 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full">
        Premium
      </span>
    )}
  </button>
);

const CardPaymentForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ cardNumber, expiry, cvv, name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Card Number</label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
          placeholder="1234 5678 9012 3456"
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Expiry (MM/YY)</label>
          <input
            type="text"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="MM/YY"
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">CVV</label>
          <input
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
            placeholder="123"
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Cardholder Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700"
      >
        Pay Now
      </button>
    </form>
  );
};

const CryptoPaymentForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [selectedCrypto, setSelectedCrypto] = useState('hive');
  const cryptoAddresses = {
    hive: 'deepsan',
    btc: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    eth: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ cryptoType: selectedCrypto, address: cryptoAddresses[selectedCrypto] });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Select Cryptocurrency</label>
        <select
          value={selectedCrypto}
          onChange={(e) => setSelectedCrypto(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        >
          <option value="hive">HIVE</option>
          <option value="btc">Bitcoin</option>
          <option value="eth">Ethereum</option>
        </select>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700">Send payment to:</p>
        <p className="mt-2 font-mono text-sm break-all">{cryptoAddresses[selectedCrypto]}</p>
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700"
      >
        Confirm Payment
      </button>
    </form>
  );
};

const UPIPaymentForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [upiId, setUpiId] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ upiId, transactionId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-sm font-medium text-gray-700">Pay to UPI ID:</p>
        <p className="mt-2 text-lg font-semibold text-indigo-600">deepsan@upi</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Your UPI ID</label>
        <input
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="yourname@upi"
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">UPI Transaction ID</label>
        <input
          type="text"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          placeholder="Enter transaction ID after payment"
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700"
      >
        Verify Payment
      </button>
    </form>
  );
};

const PremiumModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'crypto' | 'upi'>('card');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentReceipt, setShowPaymentReceipt] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const plans = {
    monthly: { price: 799, period: 'month' },
    yearly: { price: 7999, period: 'year', savings: '17%' }
  };

  const handlePayment = async (paymentData: any) => {
    setProcessing(true);
    setError('');

    try {
      const payment = await createPremiumMembership({
        amount: plans[selectedPlan].price,
        currency: 'INR',
        planType: selectedPlan,
        paymentMethod: selectedPayment,
        ...paymentData
      });
      
      setPaymentDetails(payment);
      setShowPaymentReceipt(true);
    } catch (error: any) {
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentForm = () => {
    switch (selectedPayment) {
      case 'card':
        return <CardPaymentForm onSubmit={handlePayment} />;
      case 'crypto':
        return <CryptoPaymentForm onSubmit={handlePayment} />;
      case 'upi':
        return <UPIPaymentForm onSubmit={handlePayment} />;
      default:
        return null;
    }
  };

  if (showPaymentReceipt && paymentDetails) {
    return <PaymentReceipt payment={paymentDetails} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Upgrade to Premium</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {Object.entries(plans).map(([plan, details]) => (
            <div 
              key={plan}
              onClick={() => setSelectedPlan(plan as 'monthly' | 'yearly')}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPlan === plan 
                  ? 'border-indigo-600 bg-indigo-50' 
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <h3 className="text-xl font-semibold capitalize">{plan} Plan</h3>
              <p className="text-3xl font-bold mt-2">₹{details.price}</p>
              <p className="text-gray-600">per {details.period}</p>
              {details.savings && (
                <p className="text-green-600 mt-2">Save {details.savings}</p>
              )}
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'card', label: 'Card', icon: CreditCard },
              { id: 'crypto', label: 'Crypto', icon: Bitcoin },
              { id: 'upi', label: 'UPI', icon: CreditCard }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedPayment(id as 'card' | 'crypto' | 'upi')}
                className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                  selectedPayment === id 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <Icon size={24} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Form */}
        <div className="mb-6">
          {renderPaymentForm()}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {processing && (
          <div className="text-center text-gray-600">
            Processing your payment...
          </div>
        )}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [username, setUsername] = useState('');
  const [accountData, setAccountData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [delegationsData, setDelegationsData] = useState<any>(null);
  const [rewardsData, setRewardsData] = useState<any>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  useEffect(() => {
    setIsUserLoggedIn(isLoggedIn());
  }, []);

  useEffect(() => {
    if (accountData?.name) {
      fetchTabData();
    }
  }, [accountData, activeTab]);

  const fetchTabData = async () => {
    try {
      switch (activeTab) {
        case 'wallet':
          const walletHistory = await getWalletHistory(accountData.name);
          const accountValue = getEstimatedAccountValue(accountData);
          setWalletData({ history: walletHistory, value: accountValue });
          break;
        case 'delegations':
          const delegations = await getDelegations(accountData.name);
          setDelegationsData(delegations);
          break;
        case 'rewards':
          if (isPremiumUser) {
            const rewards = await getRewardHistory(accountData.name);
            setRewardsData(rewards);
          }
          break;
      }
    } catch (err) {
      console.error('Error fetching tab data:', err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await getAccountInfo(username);
      if (!data) {
        throw new Error('Account not found');
      }
      setAccountData(data);
      setActiveTab('overview');
    } catch (err: any) {
      setError(err.message || 'Error fetching account data');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Account Activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={[
                  { date: '2024-01', posts: 45, engagement: 75 },
                  { date: '2024-02', posts: 52, engagement: 82 },
                  { date: '2024-03', posts: 38, engagement: 91 }
                ]}>
                  <defs>
                    <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="posts" stroke="#4F46E5" fillOpacity={1} fill="url(#colorPosts)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Engagement Metrics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={[
                  { date: '2024-01', engagement: 75, reach: 120 },
                  { date: '2024-02', engagement: 82, reach: 150 },
                  { date: '2024-03', engagement: 91, reach: 180 }
                ]}>
                  <defs>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="engagement" stroke="#7C3AED" fillOpacity={1} fill="url(#colorEngagement)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'wallet':
        return walletData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Wallet Balance</h3>
              <div className="grid grid-cols-2 gap-4">
                <StatCard 
                  icon={Bitcoin} 
                  title="HIVE Balance" 
                  value={`${walletData.value.hive.toFixed(3)} HIVE`}
                />
                <StatCard 
                  icon={CreditCard} 
                  title="HBD Balance" 
                  value={`${walletData.value.hbd.toFixed(3)} HBD`}
                />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              <div className="space-y-4">
                {walletData.history.slice(0, 5).map((tx: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{tx[1].op[0]}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx[1].timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{tx[1].op[1].amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">Loading wallet data...</div>
        );

      case 'delegations':
        return delegationsData ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Active Delegations</h3>
            <div className="space-y-4">
              {delegationsData.length > 0 ? (
                delegationsData.map((delegation: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{delegation.delegatee}</p>
                      <p className="text-sm text-gray-500">
                        Since: {new Date(delegation.min_delegation_time).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{delegation.vesting_shares}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No active delegations found
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">Loading delegation data...</div>
        );

      case 'rewards':
        if (!isPremiumUser) {
          return (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold mb-4">Premium Feature</h3>
              <p className="text-gray-600 mb-4">
                Upgrade to Premium to access detailed reward analytics
              </p>
              <button
                onClick={() => setShowPremiumModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full"
              >
                Upgrade Now
              </button>
            </div>
          );
        }
        return rewardsData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Reward Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={rewardsData.map((reward: any) => ({
                  date: new Date(reward[1].timestamp).toLocaleDateString(),
                  amount: parseFloat(reward[1].op[1].reward.split(' ')[0])
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#4F46E5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">Loading reward data...</div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1 animate-fade-in">
            <h1 className="text-5xl font-bold text-gradient mb-4 animate-gradient-text">
              DeepSan Analytics
            </h1>
            <p className="text-gray-600 text-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Dive deep into Hive blockchain analytics with precision and clarity
            </p>
            <div className="mt-4 text-sm text-gray-500 developer-credit animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Developed with ❤️ by{' '}
              <span className="font-medium text-indigo-600">Deepak Singh</span> and{' '}
              <span className="font-medium text-purple-600">Sanchay Naresh Gupta</span>
            </div>
          </div>
          
          <div className="ml-4">
            {isUserLoggedIn ? (
              <HiveLogin onLogout={() => {
                setIsUserLoggedIn(false);
                setAccountData(null);
              }} />
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2 transition-all duration-300"
              >
                <LogIn size={20} />
                Login with Hive
              </button>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="mb-12 animate-slide-in">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Hive username"
                className="w-full px-6 py-4 rounded-full border-2 border-indigo-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-lg transition-all duration-300 pr-40"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2 transition-all duration-300"
              >
                <Search size={20} />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-center mt-4 animate-fade-in">{error}</p>
            )}
          </div>
        </form>

        {accountData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                icon={Users} 
                title="Account Name" 
                value={accountData.name}
                className="delay-100" 
              />
              <StatCard 
                icon={Activity} 
                title="Post Count" 
                value={accountData.post_count}
                className="delay-200" 
              />
              <StatCard 
                icon={Award} 
                title="Voting Power" 
                value={`${calculateVotingPower(accountData).toFixed(2)}%`}
                className="delay-300"  tsx
                className="delay-300" 
              />
              <StatCard 
                icon={Calendar} 
                title="Created" 
                value={new Date(accountData.created).toLocaleDateString()}
                className="delay-400" 
              />
            </div>

            <div className="glass-effect rounded-xl p-4 mb-8">
              <div className="flex space-x-4 overflow-x-auto pb-2">
                <TabButton 
                  name="overview"
                  icon={TrendingUp}
                  label="Overview"
                  isActive={activeTab === 'overview'}
                  onClick={() => setActiveTab('overview')}
                />
                <TabButton 
                  name="wallet"
                  icon={Wallet}
                  label="Wallet"
                  isActive={activeTab === 'wallet'}
                  onClick={() => setActiveTab('wallet')}
                />
                <TabButton 
                  name="delegations"
                  icon={Share2}
                  label="Delegations"
                  isActive={activeTab === 'delegations'}
                  onClick={() => setActiveTab('delegations')}
                />
                <TabButton 
                  name="rewards"
                  icon={Gift}
                  label="Rewards"
                  isActive={activeTab === 'rewards'}
                  onClick={() => setActiveTab('rewards')}
                  premium
                />
              </div>
            </div>

            <div className="animate-fade-in">
              {renderContent()}
            </div>
          </>
        )}

        {showLoginModal && (
          <HiveLogin onLoginSuccess={(username) => {
            setIsUserLoggedIn(true);
            setShowLoginModal(false);
            setUsername(username);
            handleSearch(new Event('submit'));
          }} />
        )}

        {showPremiumModal && (
          <PremiumModal onClose={() => setShowPremiumModal(false)} />
        )}
      </div>
    </div>
  );
}