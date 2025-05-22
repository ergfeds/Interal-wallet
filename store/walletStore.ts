import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Transaction, Notification, SupportTicket, Currency, KYCData, WalletState } from '@/types/wallet';
import { trpcClient } from '@/lib/trpc';

const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      currencies: [],
      transactions: [],
      pendingTransactions: [],
      notifications: [],
      supportTickets: [],
      unreadNotificationsCount: 0,
      exchangeRate: 40000, // Default BTC to USD exchange rate
      authToken: null,
      
      // Initialize data from API
      initializeData: async () => {
        try {
          // Try to fetch from API
          try {
            // Fetch currencies
            const currencies = await trpcClient.currencies.getAll.query();
            
            // Fetch transactions if user is logged in
            let transactions: Transaction[] = [];
            let pendingTransactions: Transaction[] = [];
            
            const { currentUser } = get();
            if (currentUser) {
              // Try to get transactions for this user
              try {
                // Use the new getByUserId procedure
                transactions = await trpcClient.transactions.getByUserId.query({ userId: currentUser.id });
              } catch (err) {
                console.warn('Failed to fetch transactions by user ID:', err);
                // Fallback to getAll and filter client-side
                const allTransactions = await trpcClient.transactions.getAll.query();
                transactions = allTransactions.filter(t => 
                  t.fromUserId === currentUser.id || t.toUserId === currentUser.id
                );
              }
              
              pendingTransactions = transactions.filter((t: Transaction) => t.status === 'pending');
              
              // Fetch user's notifications
              try {
                const notifications = await trpcClient.notifications.getByUserId.query({ userId: currentUser.id });
                const unreadCount = await trpcClient.notifications.getUnreadCount.query({ userId: currentUser.id });
                
                // Fetch user's support tickets
                const supportTickets = await trpcClient.support.getByUserId.query({ userId: currentUser.id });
                
                set({
                  currencies,
                  transactions,
                  pendingTransactions,
                  notifications,
                  supportTickets,
                  unreadNotificationsCount: unreadCount,
                });
              } catch (notificationErr) {
                console.warn('Failed to fetch notifications:', notificationErr);
                // Continue with partial data
                set({
                  currencies,
                  transactions,
                  pendingTransactions,
                });
              }
            } else {
              set({
                currencies,
              });
            }
            
            return { success: true };
          } catch (apiError) {
            console.warn('API fetch failed:', apiError);
            return { success: false, error: apiError };
          }
        } catch (error) {
          console.error('Failed to initialize data:', error);
          return { success: false, error };
        }
      },
      
      // User actions
      setCurrentUser: async (user: User & { token?: string }) => {
        // Store the auth token if provided
        const authToken = user.token || null;
        
        // Remove token from user object before storing
        const { token, ...userWithoutToken } = user;
        
        set({ 
          currentUser: userWithoutToken,
          authToken
        });
        
        if (user) {
          try {
            // Try to fetch from API first
            try {
              // Fetch user's notifications
              try {
                const notifications = await trpcClient.notifications.getByUserId.query({ userId: user.id });
                const unreadCount = await trpcClient.notifications.getUnreadCount.query({ userId: user.id });
                
                // Fetch user's support tickets
                const supportTickets = await trpcClient.support.getByUserId.query({ userId: user.id });
                
                // Fetch user's transactions
                let transactions: Transaction[] = [];
                try {
                  // Use the new getByUserId procedure
                  transactions = await trpcClient.transactions.getByUserId.query({ userId: user.id });
                } catch (err) {
                  console.warn('Failed to fetch transactions by user ID:', err);
                  // Fallback to getAll and filter
                  const allTransactions = await trpcClient.transactions.getAll.query();
                  transactions = allTransactions.filter(t => 
                    t.fromUserId === user.id || t.toUserId === user.id
                  );
                }
                
                const pendingTransactions = transactions.filter((t: Transaction) => t.status === 'pending');
                
                set({
                  notifications,
                  supportTickets,
                  transactions,
                  pendingTransactions,
                  unreadNotificationsCount: unreadCount,
                });
              } catch (notificationErr) {
                console.warn('Failed to fetch notifications:', notificationErr);
                // Continue with partial data
              }
            } catch (apiError) {
              console.warn('API fetch failed for user data:', apiError);
            }
          } catch (error) {
            console.error('Failed to fetch user data:', error);
          }
        }
      },
      
      logout: () => {
        set({
          currentUser: null,
          authToken: null,
          transactions: [],
          pendingTransactions: [],
          notifications: [],
          supportTickets: [],
          unreadNotificationsCount: 0,
        });
      },
      
      // Transaction actions
      sendTransaction: async (transactionData: {
        fromAddress: string;
        toAddress: string;
        amount: number;
        currency: string;
        description?: string;
      }) => {
        const { currentUser } = get();
        
        // Check if user is KYC verified
        if (currentUser && currentUser.kycStatus !== 'verified') {
          try {
            // Create notification for user about KYC requirement
            await trpcClient.notifications.create.mutate({
              userId: currentUser.id,
              title: 'KYC Verification Required',
              message: 'You need to complete KYC verification before sending transactions.',
              type: 'kyc'
            });
            
            // Refresh notifications
            try {
              const notifications = await trpcClient.notifications.getByUserId.query({ userId: currentUser.id });
              const unreadCount = await trpcClient.notifications.getUnreadCount.query({ userId: currentUser.id });
              
              set({
                notifications,
                unreadNotificationsCount: unreadCount,
              });
            } catch (err) {
              console.warn('Failed to refresh notifications:', err);
            }
          } catch (apiError) {
            console.warn('API call failed:', apiError);
          }
          
          return;
        }
        
        try {
          // Create transaction
          const newTransaction = await trpcClient.transactions.create.mutate({
            fromAddress: transactionData.fromAddress,
            toAddress: transactionData.toAddress,
            amount: transactionData.amount,
            currency: transactionData.currency,
            description: transactionData.description,
            fromUserId: currentUser?.id
          });
          
          // Refresh transactions
          let transactions: Transaction[] = [];
          try {
            if (currentUser) {
              // Use the new getByUserId procedure
              transactions = await trpcClient.transactions.getByUserId.query({ userId: currentUser.id });
            }
          } catch (err) {
            console.warn('Failed to fetch transactions by user ID:', err);
            // Fallback to getAll and filter
            const allTransactions = await trpcClient.transactions.getAll.query();
            if (currentUser) {
              transactions = allTransactions.filter(t => 
                t.fromUserId === currentUser.id || t.toUserId === currentUser.id
              );
            }
          }
          
          const pendingTransactions = transactions.filter((t: Transaction) => t.status === 'pending');
          
          set({
            transactions,
            pendingTransactions,
          });
          
          // Create notifications
          if (currentUser) {
            // Get currency symbol
            const currencies = get().currencies;
            const currency = currencies.find((c: Currency) => c.id === newTransaction.currency);
            const symbol = currency ? currency.symbol : newTransaction.currency.toUpperCase();
            
            // Notification for sender
            await trpcClient.notifications.create.mutate({
              userId: currentUser.id,
              title: 'Transaction Pending',
              message: `Your transaction of ${newTransaction.amount} ${symbol} is pending approval.`,
              type: 'transaction',
              transactionId: newTransaction.id
            });
            
            // Refresh notifications
            try {
              const notifications = await trpcClient.notifications.getByUserId.query({ userId: currentUser.id });
              const unreadCount = await trpcClient.notifications.getUnreadCount.query({ userId: currentUser.id });
              
              set({
                notifications,
                unreadNotificationsCount: unreadCount,
              });
            } catch (err) {
              console.warn('Failed to refresh notifications:', err);
            }
          }
          
          return newTransaction;
        } catch (error) {
          console.error('Failed to send transaction:', error);
          throw error;
        }
      },
      
      approveTransaction: async (transactionId: string) => {
        try {
          // Approve transaction
          await trpcClient.transactions.approve.mutate({ id: transactionId });
          
          const { currentUser } = get();
          if (!currentUser) return;
          
          // Refresh transactions
          let transactions: Transaction[] = [];
          try {
            // Use the new getByUserId procedure
            transactions = await trpcClient.transactions.getByUserId.query({ userId: currentUser.id });
          } catch (err) {
            console.warn('Failed to fetch transactions by user ID:', err);
            // Fallback to getAll and filter
            const allTransactions = await trpcClient.transactions.getAll.query();
            transactions = allTransactions.filter(t => 
              t.fromUserId === currentUser.id || t.toUserId === currentUser.id
            );
          }
          
          const pendingTransactions = transactions.filter((t: Transaction) => t.status === 'pending');
          
          set({
            transactions,
            pendingTransactions,
          });
          
          // Refresh notifications
          try {
            const notifications = await trpcClient.notifications.getByUserId.query({ userId: currentUser.id });
            const unreadCount = await trpcClient.notifications.getUnreadCount.query({ userId: currentUser.id });
            
            set({
              notifications,
              unreadNotificationsCount: unreadCount,
            });
          } catch (err) {
            console.warn('Failed to refresh notifications:', err);
          }
          
          // Refresh current user to get updated balances
          const updatedUser = await trpcClient.users.getById.query({ id: currentUser.id });
          set({ currentUser: updatedUser });
        } catch (error) {
          console.error('Failed to approve transaction:', error);
          throw error;
        }
      },
      
      rejectTransaction: async (transactionId: string, reason: string) => {
        try {
          // Reject transaction
          await trpcClient.transactions.reject.mutate({ 
            id: transactionId,
            reason
          });
          
          const { currentUser } = get();
          if (!currentUser) return;
          
          // Refresh transactions
          let transactions: Transaction[] = [];
          try {
            // Use the new getByUserId procedure
            transactions = await trpcClient.transactions.getByUserId.query({ userId: currentUser.id });
          } catch (err) {
            console.warn('Failed to fetch transactions by user ID:', err);
            // Fallback to getAll and filter
            const allTransactions = await trpcClient.transactions.getAll.query();
            transactions = allTransactions.filter(t => 
              t.fromUserId === currentUser.id || t.toUserId === currentUser.id
            );
          }
          
          const pendingTransactions = transactions.filter((t: Transaction) => t.status === 'pending');
          
          set({
            transactions,
            pendingTransactions,
          });
          
          // Refresh notifications
          try {
            const notifications = await trpcClient.notifications.getByUserId.query({ userId: currentUser.id });
            const unreadCount = await trpcClient.notifications.getUnreadCount.query({ userId: currentUser.id });
            
            set({
              notifications,
              unreadNotificationsCount: unreadCount,
            });
          } catch (err) {
            console.warn('Failed to refresh notifications:', err);
          }
        } catch (error) {
          console.error('Failed to reject transaction:', error);
          throw error;
        }
      },
      
      generateWalletAddress: async (currency: string) => {
        const { currentUser } = get();
        if (!currentUser) return null;
        
        try {
          const result = await trpcClient.users.generateWalletAddress.mutate({
            userId: currentUser.id,
            currency
          });
          
          // Update current user
          const updatedUser = await trpcClient.users.getById.query({ id: currentUser.id });
          set({ currentUser: updatedUser });
          
          return result.address;
        } catch (error) {
          console.error('Failed to generate wallet address:', error);
          return null;
        }
      },
      
      updateExchangeRate: async (currencyId: string, rate: number) => {
        try {
          // Update exchange rate
          await trpcClient.currencies.updateExchangeRate.mutate({
            id: currencyId,
            exchangeRate: rate
          });
          
          // Refresh currencies
          const currencies = await trpcClient.currencies.getAll.query();
          set({ currencies });
          
          // Refresh notifications for current user
          const { currentUser } = get();
          if (currentUser) {
            try {
              const notifications = await trpcClient.notifications.getByUserId.query({ userId: currentUser.id });
              const unreadCount = await trpcClient.notifications.getUnreadCount.query({ userId: currentUser.id });
              
              set({
                notifications,
                unreadNotificationsCount: unreadCount,
              });
            } catch (err) {
              console.warn('Failed to refresh notifications:', err);
            }
          }
        } catch (error) {
          console.error('Failed to update exchange rate:', error);
          throw error;
        }
      },
      
      // Notification actions
      addNotification: async (notificationData: {
        userId: string;
        title: string;
        message: string;
        type: Notification['type'];
        transactionId?: string;
      }) => {
        try {
          // Create notification
          await trpcClient.notifications.create.mutate({
            userId: notificationData.userId,
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type,
            transactionId: notificationData.transactionId
          });
          
          // Refresh notifications if for current user
          const { currentUser } = get();
          if (currentUser && currentUser.id === notificationData.userId) {
            try {
              const notifications = await trpcClient.notifications.getByUserId.query({ userId: currentUser.id });
              const unreadCount = await trpcClient.notifications.getUnreadCount.query({ userId: currentUser.id });
              
              set({
                notifications,
                unreadNotificationsCount: unreadCount,
              });
            } catch (err) {
              console.warn('Failed to refresh notifications:', err);
            }
          }
        } catch (error) {
          console.error('Failed to add notification:', error);
          throw error;
        }
      },
      
      markNotificationAsRead: async (notificationId: string) => {
        try {
          // Mark notification as read
          await trpcClient.notifications.markAsRead.mutate({ id: notificationId });
          
          // Refresh notifications for current user
          const { currentUser } = get();
          if (currentUser) {
            try {
              const notifications = await trpcClient.notifications.getByUserId.query({ userId: currentUser.id });
              const unreadCount = await trpcClient.notifications.getUnreadCount.query({ userId: currentUser.id });
              
              set({
                notifications,
                unreadNotificationsCount: unreadCount,
              });
            } catch (err) {
              console.warn('Failed to refresh notifications:', err);
              
              // Update locally as fallback
              const notifications = get().notifications.map(n => 
                n.id === notificationId ? { ...n, read: true } : n
              );
              const unreadCount = notifications.filter(n => !n.read).length;
              
              set({
                notifications,
                unreadNotificationsCount: unreadCount,
              });
            }
          }
        } catch (error) {
          console.error('Failed to mark notification as read:', error);
          throw error;
        }
      },
      
      markAllNotificationsAsRead: async () => {
        const { currentUser } = get();
        if (!currentUser) return;
        
        try {
          // Mark all notifications as read
          await trpcClient.notifications.markAllAsRead.mutate({ userId: currentUser.id });
          
          // Refresh notifications
          try {
            const notifications = await trpcClient.notifications.getByUserId.query({ userId: currentUser.id });
            
            set({
              notifications,
              unreadNotificationsCount: 0,
            });
          } catch (err) {
            console.warn('Failed to refresh notifications:', err);
            
            // Update locally as fallback
            const notifications = get().notifications.map(n => ({ ...n, read: true }));
            
            set({
              notifications,
              unreadNotificationsCount: 0,
            });
          }
        } catch (error) {
          console.error('Failed to mark all notifications as read:', error);
          throw error;
        }
      },
      
      // Support ticket actions
      createSupportTicket: async (ticketData: {
        subject: string;
        message: string;
      }) => {
        const { currentUser } = get();
        if (!currentUser) return;
        
        try {
          // Create support ticket
          const newTicket = await trpcClient.support.create.mutate({
            userId: currentUser.id,
            subject: ticketData.subject,
            message: ticketData.message,
          });
          
          // Refresh support tickets
          const supportTickets = await trpcClient.support.getByUserId.query({ userId: currentUser.id });
          set({ supportTickets });
          
          // Refresh notifications
          try {
            const notifications = await trpcClient.notifications.getByUserId.query({ userId: currentUser.id });
            const unreadCount = await trpcClient.notifications.getUnreadCount.query({ userId: currentUser.id });
            
            set({
              notifications,
              unreadNotificationsCount: unreadCount,
            });
          } catch (err) {
            console.warn('Failed to refresh notifications:', err);
          }
          
          return newTicket;
        } catch (error) {
          console.error('Failed to create support ticket:', error);
          throw error;
        }
      },
      
      respondToSupportTicket: async (ticketId: string, message: string, fromAdmin: boolean) => {
        const { currentUser } = get();
        if (!currentUser) return;
        
        try {
          // Add response to ticket
          await trpcClient.support.addResponse.mutate({
            ticketId,
            message,
            fromAdmin,
          });
          
          // Refresh support tickets
          const supportTickets = await trpcClient.support.getByUserId.query({ userId: currentUser.id });
          set({ supportTickets });
          
          // Refresh notifications
          try {
            const notifications = await trpcClient.notifications.getByUserId.query({ userId: currentUser.id });
            const unreadCount = await trpcClient.notifications.getUnreadCount.query({ userId: currentUser.id });
            
            set({
              notifications,
              unreadNotificationsCount: unreadCount,
            });
          } catch (err) {
            console.warn('Failed to refresh notifications:', err);
          }
        } catch (error) {
          console.error('Failed to respond to support ticket:', error);
          throw error;
        }
      },
      
      closeSupportTicket: async (ticketId: string) => {
        try {
          // Close the ticket
          await trpcClient.support.close.mutate({ id: ticketId });
          
          // Refresh support tickets for current user
          const { currentUser } = get();
          if (currentUser) {
            const supportTickets = await trpcClient.support.getByUserId.query({ userId: currentUser.id });
            set({ supportTickets });
            
            // Refresh notifications
            try {
              const notifications = await trpcClient.notifications.getByUserId.query({ userId: currentUser.id });
              const unreadCount = await trpcClient.notifications.getUnreadCount.query({ userId: currentUser.id });
              
              set({
                notifications,
                unreadNotificationsCount: unreadCount,
              });
            } catch (err) {
              console.warn('Failed to refresh notifications:', err);
            }
          }
        } catch (error) {
          console.error('Failed to close support ticket:', error);
          throw error;
        }
      },
      
      // User balance actions
      adjustUserBalance: async (userId: string, currency: string, amount: number) => {
        try {
          // Update user balance
          await trpcClient.users.updateBalance.mutate({
            userId,
            currency,
            amount,
          });
          
          // Update current user if affected
          const { currentUser } = get();
          if (currentUser && currentUser.id === userId) {
            const updatedUser = await trpcClient.users.getById.query({ id: userId });
            set({ currentUser: updatedUser });
            
            // Refresh notifications
            try {
              const notifications = await trpcClient.notifications.getByUserId.query({ userId: currentUser.id });
              const unreadCount = await trpcClient.notifications.getUnreadCount.query({ userId: currentUser.id });
              
              set({
                notifications,
                unreadNotificationsCount: unreadCount,
              });
            } catch (err) {
              console.warn('Failed to refresh notifications:', err);
            }
          }
        } catch (error) {
          console.error('Failed to adjust user balance:', error);
          throw error;
        }
      },
      
      // KYC Actions
      submitKyc: async (userId: string, kycData: Omit<KYCData, 'submissionDate'>) => {
        try {
          // Create a complete KYC data object with submission date
          const completeKycData: KYCData = {
            ...kycData,
            submissionDate: Date.now()
          };
          
          // Submit KYC
          await trpcClient.users.submitKyc.mutate({
            userId,
            kycData: completeKycData,
          });
          
          // Update current user if affected
          const { currentUser } = get();
          if (currentUser && currentUser.id === userId) {
            const updatedUser = await trpcClient.users.getById.query({ id: userId });
            set({ currentUser: updatedUser });
            
            // Refresh notifications
            try {
              const notifications = await trpcClient.notifications.getByUserId.query({ userId: currentUser.id });
              const unreadCount = await trpcClient.notifications.getUnreadCount.query({ userId: currentUser.id });
              
              set({
                notifications,
                unreadNotificationsCount: unreadCount,
              });
            } catch (err) {
              console.warn('Failed to refresh notifications:', err);
            }
          }
        } catch (error) {
          console.error('Failed to submit KYC:', error);
          throw error;
        }
      },
      
      approveKyc: async (userId: string) => {
        try {
          // Approve KYC
          await trpcClient.users.approveKyc.mutate({ userId });
          
          // Update current user if affected
          const { currentUser } = get();
          if (currentUser && currentUser.id === userId) {
            const updatedUser = await trpcClient.users.getById.query({ id: userId });
            set({ currentUser: updatedUser });
            
            // Refresh notifications
            try {
              const notifications = await trpcClient.notifications.getByUserId.query({ userId: currentUser.id });
              const unreadCount = await trpcClient.notifications.getUnreadCount.query({ userId: currentUser.id });
              
              set({
                notifications,
                unreadNotificationsCount: unreadCount,
              });
            } catch (err) {
              console.warn('Failed to refresh notifications:', err);
            }
          }
        } catch (error) {
          console.error('Failed to approve KYC:', error);
          throw error;
        }
      },
      
      rejectKyc: async (userId: string, reason: string) => {
        try {
          // Reject KYC
          await trpcClient.users.rejectKyc.mutate({
            userId,
            reason,
          });
          
          // Update current user if affected
          const { currentUser } = get();
          if (currentUser && currentUser.id === userId) {
            const updatedUser = await trpcClient.users.getById.query({ id: userId });
            set({ currentUser: updatedUser });
            
            // Refresh notifications
            try {
              const notifications = await trpcClient.notifications.getByUserId.query({ userId: currentUser.id });
              const unreadCount = await trpcClient.notifications.getUnreadCount.query({ userId: currentUser.id });
              
              set({
                notifications,
                unreadNotificationsCount: unreadCount,
              });
            } catch (err) {
              console.warn('Failed to refresh notifications:', err);
            }
          }
        } catch (error) {
          console.error('Failed to reject KYC:', error);
          throw error;
        }
      },
      
      // Profile actions
      updateProfile: async (profileData: {
        name?: string;
        email?: string;
        avatar?: string;
      }) => {
        const { currentUser } = get();
        if (!currentUser) return;
        
        try {
          // Update profile
          const updatedUser = await trpcClient.users.updateProfile.mutate({
            userId: currentUser.id,
            ...profileData
          });
          
          // Update current user
          set({ currentUser: updatedUser });
          
          return updatedUser;
        } catch (error) {
          console.error('Failed to update profile:', error);
          throw error;
        }
      },
      
      changePassword: async (passwordData: {
        currentPassword: string;
        newPassword: string;
      }) => {
        const { currentUser } = get();
        if (!currentUser) return;
        
        try {
          // Change password
          await trpcClient.users.changePassword.mutate({
            userId: currentUser.id,
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          });
          
          return { success: true };
        } catch (error) {
          console.error('Failed to change password:', error);
          throw error;
        }
      },
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        currentUser: state.currentUser,
        authToken: state.authToken,
        // Don't persist sensitive data or data that should be fresh from the API
      }),
    }
  )
);

export default useWalletStore;