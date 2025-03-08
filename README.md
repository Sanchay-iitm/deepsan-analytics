# DeepSan Analytics - Hive Blockchain Analytics Platform

## Overview

DeepSan Analytics is a modern web application that provides comprehensive analytics and insights for Hive blockchain accounts. Built with cutting-edge technologies, it offers users detailed analytics, account statistics, and premium features for in-depth blockchain analysis.

## Features

### Core Features
- **Account Analytics**: Detailed statistics and metrics for Hive accounts
- **Real-time Data**: Live updates of account information and blockchain data
- **Interactive Dashboard**: User-friendly interface with multiple data views
- **Secure Authentication**: Integration with Hive Keychain and HiveSigner

### Dashboard Sections
1. **Overview**
   - Account statistics
   - Voting power metrics
   - Account reputation
   - Creation date

2. **Wallet**
   - HIVE balance tracking
   - HBD (Hive Backed Dollars) balance
   - Estimated account value
   - Recent transactions

3. **Delegations**
   - Active delegations
   - Delegation history
   - Vesting shares tracking

4. **Premium Features**
   - Advanced reward analytics
   - Historical data visualization
   - Extended search capabilities
   - Detailed transaction analysis

## Technical Stack

### Frontend Technologies
- **React 18.3.1**: Core framework for building the user interface
- **TypeScript**: For type-safe code and better development experience
- **Vite**: Modern build tool for fast development and optimized production builds
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Recharts**: For data visualization and charts
- **Lucide React**: For modern, customizable icons

### Backend & Database
- **Supabase**: Backend-as-a-Service for:
  - User data storage
  - Premium membership management
  - Payment processing
  - Analytics storage

### Blockchain Integration
- **@hiveio/dhive**: Official Hive blockchain JavaScript library
- **Hive Keychain**: For secure blockchain interactions
- **HiveSigner**: Alternative authentication method

### Payment Integration
- Multiple payment methods supported:
  - Credit/Debit Cards
  - UPI (India)
  - Hive cryptocurrency
  - Other cryptocurrencies (BTC, ETH, USDT)

## Architecture

### Component Structure
```
src/
├── components/
│   ├── Dashboard.tsx       # Main dashboard component
│   ├── HiveLogin.tsx      # Authentication component
│   └── PaymentReceipt.tsx # Payment receipt handling
├── lib/
│   ├── hive.ts           # Hive blockchain interactions
│   ├── hiveAuth.ts       # Authentication logic
│   ├── payments.ts       # Payment processing
│   └── supabase.ts       # Database configuration
└── main.tsx             # Application entry point
```

### Data Flow
1. User Authentication
   - Hive Keychain or HiveSigner authentication
   - Secure session management
   - User state persistence

2. Data Fetching
   - Real-time blockchain data retrieval
   - Cached data management
   - Error handling and retry mechanisms

3. Premium Features
   - Subscription management
   - Payment processing
   - Feature access control

## Security Features

1. **Authentication Security**
   - Secure blockchain-based authentication
   - No password storage
   - Session management

2. **Payment Security**
   - Secure payment processing
   - Transaction verification
   - Payment receipt generation

3. **Data Protection**
   - Row Level Security (RLS) in Supabase
   - Encrypted data transmission
   - Secure API endpoints

## Premium Membership

### Plans
1. **Monthly Plan**
   - ₹799/month
   - Full access to premium features
   - Cancel anytime

2. **Yearly Plan**
   - ₹7,999/year
   - 17% savings compared to monthly
   - Premium support

### Payment Methods
- UPI (India)
- Credit/Debit Cards
- Hive cryptocurrency
- Other cryptocurrencies (BTC, ETH, USDT, USDC)

## Development Setup

1. **Prerequisites**
   ```bash
   Node.js 18+ required
   npm or yarn package manager
   ```

2. **Installation**
   ```bash
   git clone [repository-url]
   cd deepsan-analytics
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Create .env file with:
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

4. **Development**
   ```bash
   npm run dev
   ```

5. **Build**
   ```bash
   npm run build
   ```

## Deployment

The application is deployed on Netlify with continuous deployment from the main branch. The production URL is: https://deepsan.netlify.app

## Future Enhancements

1. **Analytics Enhancement**
   - Advanced data visualization
   - Custom report generation
   - Export functionality

2. **Integration Plans**
   - Additional blockchain metrics
   - More payment gateways
   - Enhanced API capabilities

3. **User Experience**
   - Mobile application
   - Notification system
   - Customizable dashboards

## Contributors

- **Deepak Singh**: Lead Developer
- **Sanchay Naresh Gupta**: Developer

## License

This project is licensed under the MIT License - see the LICENSE file for details.