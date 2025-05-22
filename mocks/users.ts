import { User } from '@/types/wallet';

// Mock users for demonstration purposes
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    walletAddresses: {
      btc: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      eth: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      usdt: 'TKFLfu9B1nUaYJ9vi2Aey9Dyu8C3zhbvMo'
    },
    balances: {
      btc: 1.25,
      eth: 15.7,
      usdt: 5000
    },
    kycStatus: 'verified',
    kycData: {
      fullName: 'John Doe',
      dateOfBirth: '1985-05-15',
      address: '123 Main St, New York, NY 10001',
      idType: 'passport',
      idNumber: 'P12345678',
      idFrontImage: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      idBackImage: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      selfieImage: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      submissionDate: 1620000000000
    },
    avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    walletAddresses: {
      btc: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      eth: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72',
      usdt: 'TNPHuqpkJGTHMVGxJw3Fy8q9GBrJiYLi8e'
    },
    balances: {
      btc: 0.5,
      eth: 8.2,
      usdt: 2500
    },
    kycStatus: 'pending',
    kycData: {
      fullName: 'Jane Smith',
      dateOfBirth: '1990-08-20',
      address: '456 Park Ave, Boston, MA 02115',
      idType: 'drivers_license',
      idNumber: 'DL987654321',
      idFrontImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      idBackImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      selfieImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      submissionDate: 1630000000000
    },
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@example.com',
    walletAddresses: {
      btc: '1MzUqM9JU5H5G8cqf2WjwNXVjJwpXm9Aqt',
      eth: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
      usdt: 'TUrMmF9Gd4rzrXsQ34ui3Wou94E7HFuJQh'
    },
    balances: {
      btc: 5.75,
      eth: 45.3,
      usdt: 25000
    },
    kycStatus: 'verified',
    kycData: {
      fullName: 'Admin User',
      dateOfBirth: '1980-01-10',
      address: '789 Tech Blvd, San Francisco, CA 94107',
      idType: 'passport',
      idNumber: 'P98765432',
      idFrontImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      idBackImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      selfieImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      submissionDate: 1610000000000
    },
    isAdmin: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    name: 'New User',
    email: 'newuser@example.com',
    walletAddresses: {
      btc: '',
      eth: '',
      usdt: ''
    },
    balances: {
      btc: 0,
      eth: 0,
      usdt: 0
    },
    kycStatus: 'unverified',
    avatar: 'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  }
];