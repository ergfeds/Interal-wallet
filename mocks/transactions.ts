import { Transaction } from '@/types/wallet';

// Mock transactions for demonstration purposes
export const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    fromAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // John's BTC address
    toAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', // Jane's BTC address
    amount: 0.05,
    fee: 0.0001,
    currency: 'btc',
    timestamp: Date.now() - 86400000 * 2, // 2 days ago
    status: 'approved',
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    description: 'Payment for services',
    fromUserId: 'john123',
    toUserId: 'jane456'
  },
  {
    id: 'tx2',
    fromAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // John's ETH address
    toAddress: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72', // Jane's ETH address
    amount: 1.5,
    fee: 0.001,
    currency: 'eth',
    timestamp: Date.now() - 86400000, // 1 day ago
    status: 'approved',
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    description: 'Monthly subscription',
    fromUserId: 'john123',
    toUserId: 'jane456'
  },
  {
    id: 'tx3',
    fromAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', // Jane's BTC address
    toAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // John's BTC address
    amount: 0.02,
    fee: 0.0001,
    currency: 'btc',
    timestamp: Date.now() - 43200000, // 12 hours ago
    status: 'approved',
    hash: '0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef',
    description: 'Refund',
    fromUserId: 'jane456',
    toUserId: 'john123'
  },
  {
    id: 'tx4',
    fromAddress: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72', // Jane's ETH address
    toAddress: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', // Admin's ETH address
    amount: 0.5,
    fee: 0.001,
    currency: 'eth',
    timestamp: Date.now() - 21600000, // 6 hours ago
    status: 'pending',
    description: 'Donation',
    fromUserId: 'jane456',
    toUserId: 'admin789'
  },
  {
    id: 'tx5',
    fromAddress: 'TKFLfu9B1nUaYJ9vi2Aey9Dyu8C3zhbvMo', // John's USDT address
    toAddress: 'TNPHuqpkJGTHMVGxJw3Fy8q9GBrJiYLi8e', // Jane's USDT address
    amount: 500,
    fee: 1,
    currency: 'usdt',
    timestamp: Date.now() - 7200000, // 2 hours ago
    status: 'approved',
    hash: '0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef',
    description: 'Loan repayment',
    fromUserId: 'john123',
    toUserId: 'jane456'
  },
  {
    id: 'tx6',
    fromAddress: '1MzUqM9JU5H5G8cqf2WjwNXVjJwpXm9Aqt', // Admin's BTC address
    toAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // John's BTC address
    amount: 0.1,
    fee: 0.0001,
    currency: 'btc',
    timestamp: Date.now() - 3600000, // 1 hour ago
    status: 'pending',
    description: 'Bonus payment',
    fromUserId: 'admin789',
    toUserId: 'john123'
  },
  {
    id: 'tx7',
    fromAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // John's ETH address
    toAddress: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', // Admin's ETH address
    amount: 2.0,
    fee: 0.002,
    currency: 'eth',
    timestamp: Date.now() - 1800000, // 30 minutes ago
    status: 'rejected',
    rejectionReason: 'Insufficient funds',
    description: 'Investment',
    fromUserId: 'john123',
    toUserId: 'admin789'
  }
];