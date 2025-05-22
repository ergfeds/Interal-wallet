import { publicProcedure, router } from '@/backend/trpc/create-context';
import { z } from 'zod';
import { Transaction } from '@/types/wallet';
import { v4 as uuidv4 } from 'uuid';

// In a real app, this would be in a database
let transactions: Transaction[] = [
  {
    id: 'tx1',
    fromUserId: 'admin1',
    toUserId: 'user1',
    fromAddress: '0xadmin1234567890abcdef1234567890abcdef1234',
    toAddress: '0xuser1234567890abcdef1234567890abcdef1234',
    amount: 0.5,
    currency: 'btc',
    status: 'approved', // Changed from 'completed' to 'approved'
    timestamp: Date.now() - 86400000 * 2, // 2 days ago
    description: 'Payment for services'
  },
  {
    id: 'tx2',
    fromUserId: 'admin1',
    toUserId: 'user2',
    fromAddress: '0xadmin4567890abcdef1234567890abcdef123456',
    toAddress: '0xuser2234567890abcdef1234567890abcdef1234',
    amount: 2.5,
    currency: 'eth',
    status: 'approved', // Changed from 'completed' to 'approved'
    timestamp: Date.now() - 86400000, // 1 day ago
    description: 'Weekly allowance'
  },
  {
    id: 'tx3',
    fromUserId: 'user1',
    toUserId: 'admin1',
    fromAddress: '0xuser1234567890abcdef1234567890abcdef1234',
    toAddress: '0xadmin7890abcdef1234567890abcdef123456789',
    amount: 100,
    currency: 'usdt',
    status: 'pending',
    timestamp: Date.now() - 3600000, // 1 hour ago
    description: 'Deposit'
  }
];

export const transactionsRouter = router({
  getAll: publicProcedure.query(() => {
    return transactions;
  }),
  
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const transaction = transactions.find(t => t.id === input.id);
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      return transaction;
    }),
  
  getPending: publicProcedure.query(() => {
    return transactions.filter(t => t.status === 'pending');
  }),
  
  // Add a new procedure to get transactions by user ID
  getByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      return transactions.filter(t => 
        t.fromUserId === input.userId || t.toUserId === input.userId
      );
    }),
  
  create: publicProcedure
    .input(z.object({
      fromAddress: z.string(),
      toAddress: z.string(),
      amount: z.number().positive(),
      currency: z.string(),
      description: z.string().optional(),
      fromUserId: z.string().optional()
    }))
    .mutation(({ input }) => {
      const newTransaction: Transaction = {
        id: uuidv4(),
        fromUserId: input.fromUserId || '',
        toUserId: '', // This would be determined by looking up the address in a real app
        fromAddress: input.fromAddress,
        toAddress: input.toAddress,
        amount: input.amount,
        currency: input.currency,
        status: 'pending',
        timestamp: Date.now(),
        description: input.description
      };
      
      transactions.push(newTransaction);
      return newTransaction;
    }),
  
  approve: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const transactionIndex = transactions.findIndex(t => t.id === input.id);
      if (transactionIndex === -1) {
        throw new Error('Transaction not found');
      }
      
      if (transactions[transactionIndex].status !== 'pending') {
        throw new Error('Transaction is not pending');
      }
      
      // Update transaction status
      transactions[transactionIndex].status = 'approved'; // Changed from 'completed' to 'approved'
      
      return transactions[transactionIndex];
    }),
  
  reject: publicProcedure
    .input(z.object({
      id: z.string(),
      reason: z.string().optional()
    }))
    .mutation(({ input }) => {
      const transactionIndex = transactions.findIndex(t => t.id === input.id);
      if (transactionIndex === -1) {
        throw new Error('Transaction not found');
      }
      
      if (transactions[transactionIndex].status !== 'pending') {
        throw new Error('Transaction is not pending');
      }
      
      // Update transaction status
      transactions[transactionIndex].status = 'rejected';
      transactions[transactionIndex].rejectionReason = input.reason;
      
      return transactions[transactionIndex];
    }),
});