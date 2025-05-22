import { publicProcedure, router } from '@/backend/trpc/create-context';
import { z } from 'zod';
import { User, KYCData } from '@/types/wallet';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// In a real app, this would be in a database
let users: (User & { password: string })[] = [
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: '$2a$10$XQxBZbvfPcF9fMVP7.lZ8OrvFdVx5GJrYxA3IQlOTfkU3GyZV5bHe', // "adminpassword"
    walletAddresses: {
      btc: '0xadmin1234567890abcdef1234567890abcdef1234',
      eth: '0xadmin4567890abcdef1234567890abcdef123456',
      usdt: '0xadmin7890abcdef1234567890abcdef123456789'
    },
    balances: {
      btc: 10,
      eth: 100,
      usdt: 50000
    },
    kycStatus: 'verified',
    isAdmin: true,
    avatar: 'https://randomuser.me/api/portraits/men/20.jpg'
  }
];

// JWT secret (in a real app, this would be in environment variables)
const JWT_SECRET = 'your-jwt-secret-key';
const JWT_EXPIRES_IN = '7d';

export const usersRouter = router({
  getAll: publicProcedure.query(() => {
    // Return users without passwords
    return users.map(({ password, ...user }) => user);
  }),
  
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const user = users.find(u => u.id === input.id);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),
  
  register: publicProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8)
    }))
    .mutation(async ({ input }) => {
      // Check if email already exists
      const existingUser = users.find(u => u.email === input.email);
      if (existingUser) {
        throw new Error('Email already in use');
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);
      
      // Create new user
      const newUser: User & { password: string } = {
        id: uuidv4(),
        name: input.name,
        email: input.email,
        password: hashedPassword,
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
        avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`
      };
      
      // Add user to "database"
      users.push(newUser);
      
      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    }),
  
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string()
    }))
    .mutation(async ({ input }) => {
      // Find user by email
      const user = users.find(u => u.email === input.email);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(input.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, isAdmin: user.isAdmin || false },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        token
      };
    }),
  
  adminLogin: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string()
    }))
    .mutation(async ({ input }) => {
      // Find admin user by email
      const admin = users.find(u => u.email === input.email && u.isAdmin);
      if (!admin) {
        throw new Error('Invalid admin credentials');
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(input.password, admin.password);
      if (!isPasswordValid) {
        throw new Error('Invalid admin credentials');
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: admin.id, email: admin.email, isAdmin: true },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      // Return admin without password
      const { password, ...adminWithoutPassword } = admin;
      return {
        ...adminWithoutPassword,
        token
      };
    }),
  
  updateBalance: publicProcedure
    .input(z.object({
      userId: z.string(),
      currency: z.string(),
      amount: z.number()
    }))
    .mutation(({ input }) => {
      const userIndex = users.findIndex(u => u.id === input.userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      const user = users[userIndex];
      
      // Initialize balance if it doesn't exist
      if (!user.balances[input.currency]) {
        user.balances[input.currency] = 0;
      }
      
      // Update balance
      user.balances[input.currency] += input.amount;
      
      // Ensure balance doesn't go below 0
      if (user.balances[input.currency] < 0) {
        user.balances[input.currency] = 0;
      }
      
      // Update user
      users[userIndex] = user;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),
  
  generateWalletAddress: publicProcedure
    .input(z.object({
      userId: z.string(),
      currency: z.string()
    }))
    .mutation(({ input }) => {
      const userIndex = users.findIndex(u => u.id === input.userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Generate a random wallet address
      const address = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`;
      
      // Update user's wallet addresses
      users[userIndex].walletAddresses[input.currency] = address;
      
      return { address };
    }),
  
  submitKyc: publicProcedure
    .input(z.object({
      userId: z.string(),
      kycData: z.object({
        fullName: z.string(),
        dateOfBirth: z.string(),
        address: z.string(),
        idType: z.enum(['passport', 'drivers_license', 'national_id']).optional(),
        idNumber: z.string(),
        idFrontImage: z.string(),
        idBackImage: z.string(),
        selfieImage: z.string(),
        submissionDate: z.number()
      })
    }))
    .mutation(({ input }) => {
      const userIndex = users.findIndex(u => u.id === input.userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update user's KYC status and data
      users[userIndex].kycStatus = 'pending';
      users[userIndex].kycData = input.kycData;
      
      // Return user without password
      const { password, ...userWithoutPassword } = users[userIndex];
      return userWithoutPassword;
    }),
  
  approveKyc: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(({ input }) => {
      const userIndex = users.findIndex(u => u.id === input.userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      if (users[userIndex].kycStatus !== 'pending') {
        throw new Error('User KYC is not pending');
      }
      
      // Update user's KYC status
      users[userIndex].kycStatus = 'verified';
      
      // Return user without password
      const { password, ...userWithoutPassword } = users[userIndex];
      return userWithoutPassword;
    }),
  
  rejectKyc: publicProcedure
    .input(z.object({
      userId: z.string(),
      reason: z.string()
    }))
    .mutation(({ input }) => {
      const userIndex = users.findIndex(u => u.id === input.userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      if (users[userIndex].kycStatus !== 'pending') {
        throw new Error('User KYC is not pending');
      }
      
      // Update user's KYC status
      users[userIndex].kycStatus = 'unverified';
      
      // Add rejection reason to KYC data
      if (users[userIndex].kycData) {
        users[userIndex].kycData.rejectionReason = input.reason;
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = users[userIndex];
      return userWithoutPassword;
    }),
    
  changePassword: publicProcedure
    .input(z.object({
      userId: z.string(),
      currentPassword: z.string(),
      newPassword: z.string().min(8)
    }))
    .mutation(async ({ input }) => {
      const userIndex = users.findIndex(u => u.id === input.userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(input.currentPassword, users[userIndex].password);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(input.newPassword, 10);
      
      // Update password
      users[userIndex].password = hashedPassword;
      
      return { success: true };
    }),
    
  updateProfile: publicProcedure
    .input(z.object({
      userId: z.string(),
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      avatar: z.string().optional()
    }))
    .mutation(({ input }) => {
      const userIndex = users.findIndex(u => u.id === input.userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Check if email is already in use by another user
      if (input.email && input.email !== users[userIndex].email) {
        const emailExists = users.some(u => u.email === input.email && u.id !== input.userId);
        if (emailExists) {
          throw new Error('Email already in use');
        }
      }
      
      // Update user profile
      if (input.name) users[userIndex].name = input.name;
      if (input.email) users[userIndex].email = input.email;
      if (input.avatar) users[userIndex].avatar = input.avatar;
      
      // Return user without password
      const { password, ...userWithoutPassword } = users[userIndex];
      return userWithoutPassword;
    }),
});