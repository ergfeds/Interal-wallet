import { Notification } from '@/types/wallet';

// Mock notifications for demonstration purposes
export const mockNotifications: Notification[] = [
  {
    id: 'notif1',
    userId: '1', // John Doe
    type: 'transaction',
    title: 'Transaction Approved',
    message: 'Your transaction of 0.05 BTC has been approved.',
    timestamp: Date.now() - 86400000 * 2, // 2 days ago
    read: true,
    transactionId: 'tx1'
  },
  {
    id: 'notif2',
    userId: '1', // John Doe
    type: 'transaction',
    title: 'Transaction Approved',
    message: 'Your transaction of 1.5 ETH has been approved.',
    timestamp: Date.now() - 86400000, // 1 day ago
    read: true,
    transactionId: 'tx2'
  },
  {
    id: 'notif3',
    userId: '2', // Jane Smith
    type: 'transaction',
    title: 'Transaction Approved',
    message: 'Your transaction of 0.02 BTC has been approved.',
    timestamp: Date.now() - 43200000, // 12 hours ago
    read: false,
    transactionId: 'tx3'
  },
  {
    id: 'notif4',
    userId: '2', // Jane Smith
    type: 'transaction',
    title: 'Transaction Pending',
    message: 'Your transaction of 0.5 ETH is pending approval.',
    timestamp: Date.now() - 21600000, // 6 hours ago
    read: false,
    transactionId: 'tx4'
  },
  {
    id: 'notif5',
    userId: '1', // John Doe
    type: 'transaction',
    title: 'Transaction Approved',
    message: 'Your transaction of 500 USDT has been approved.',
    timestamp: Date.now() - 7200000, // 2 hours ago
    read: false,
    transactionId: 'tx5'
  },
  {
    id: 'notif6',
    userId: '1', // John Doe
    type: 'transaction',
    title: 'Transaction Pending',
    message: 'You have a pending transaction of 0.1 BTC.',
    timestamp: Date.now() - 3600000, // 1 hour ago
    read: false,
    transactionId: 'tx6'
  },
  {
    id: 'notif7',
    userId: '1', // John Doe
    type: 'transaction',
    title: 'Transaction Rejected',
    message: 'Your transaction of 2.0 ETH was rejected. Reason: Insufficient funds',
    timestamp: Date.now() - 1800000, // 30 minutes ago
    read: false,
    transactionId: 'tx7'
  },
  {
    id: 'notif8',
    userId: '3', // Admin User
    type: 'system',
    title: 'New User Registration',
    message: 'A new user has registered: Jane Smith',
    timestamp: Date.now() - 86400000 * 3, // 3 days ago
    read: true
  },
  {
    id: 'notif9',
    userId: '3', // Admin User
    type: 'system',
    title: 'New Support Ticket',
    message: 'John Doe has submitted a new support ticket: Cannot withdraw funds',
    timestamp: Date.now() - 43200000, // 12 hours ago
    read: false
  },
  {
    id: 'notif10',
    userId: '4', // New User
    type: 'kyc',
    title: 'KYC Required',
    message: 'Please complete your KYC verification to unlock all features.',
    timestamp: Date.now() - 60000, // 1 minute ago
    read: false
  }
];