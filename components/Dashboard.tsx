import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowUpRight, ArrowDownLeft, Plus, RefreshCw, LifeBuoy } from 'lucide-react-native';
import useWalletStore from '@/store/walletStore';
import WalletCard from './WalletCard';
import TransactionItem from './TransactionItem';
import CurrencyLogo from './CurrencyLogo';
import { Currency, Transaction } from '@/types/wallet';

interface TopCurrencyItem {
  id: string;
  balance: number;
  value: number;
  currency: Currency;
}

export default function Dashboard() {
  const router = useRouter();
  const { currentUser, currencies, transactions, initializeData } = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    calculateTotalBalance();
  }, [currentUser, currencies]);

  const calculateTotalBalance = () => {
    if (!currentUser || !currencies.length) return;

    let total = 0;
    Object.entries(currentUser.balances).forEach(([currencyId, balance]) => {
      const currency = currencies.find((c: Currency) => c.id === currencyId);
      if (currency) {
        total += (balance as number) * currency.exchangeRate;
      }
    });
    setTotalBalance(total);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await initializeData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getRecentTransactions = () => {
    if (!currentUser) return [];
    
    // Get user's wallet addresses
    const userAddresses = Object.values(currentUser.walletAddresses);
    
    // Filter transactions involving the user
    return transactions
      .filter((t: Transaction) => 
        userAddresses.includes(t.fromAddress) || 
        userAddresses.includes(t.toAddress)
      )
      .sort((a: Transaction, b: Transaction) => b.timestamp - a.timestamp)
      .slice(0, 5);
  };

  const getTransactionType = (transaction: Transaction) => {
    if (!currentUser) return 'unknown';
    
    const userAddresses = Object.values(currentUser.walletAddresses);
    
    if (userAddresses.includes(transaction.fromAddress) && 
        userAddresses.includes(transaction.toAddress)) {
      return 'self';
    } else if (userAddresses.includes(transaction.fromAddress)) {
      return 'sent';
    } else if (userAddresses.includes(transaction.toAddress)) {
      return 'received';
    }
    
    return 'unknown';
  };

  const getTopCurrencies = (): TopCurrencyItem[] => {
    if (!currentUser) return [];
    
    return Object.entries(currentUser.balances)
      .map(([currencyId, balance]) => {
        const currency = currencies.find((c: Currency) => c.id === currencyId);
        if (!currency) return null;
        
        return {
          id: currencyId,
          balance: balance as number,
          value: (balance as number) * currency.exchangeRate,
          currency
        };
      })
      .filter((item): item is TopCurrencyItem => item !== null && item.balance > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  };

  // Get the primary wallet address for the user (Bitcoin by default)
  const getPrimaryWalletAddress = (): string => {
    if (!currentUser) return '';
    return currentUser.walletAddresses['btc'] || Object.values(currentUser.walletAddresses)[0] || '';
  };

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please log in to view your dashboard</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: currentUser.avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{currentUser.name}</Text>
          </View>
        </View>
      </View>

      <WalletCard 
        balance={totalBalance}
        walletAddress={getPrimaryWalletAddress()}
        onSend={() => router.push('/send')}
        onReceive={() => router.push('/receive')}
      />

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/send')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#E9F7FF' }]}>
            <ArrowUpRight size={20} color="#0066FF" />
          </View>
          <Text style={styles.actionText}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/receive')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#E6F9F1' }]}>
            <ArrowDownLeft size={20} color="#00A86B" />
          </View>
          <Text style={styles.actionText}>Receive</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/assets')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#FFF4E6' }]}>
            <Plus size={20} color="#FF9500" />
          </View>
          <Text style={styles.actionText}>Assets</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/support')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#F0E6FF' }]}>
            <LifeBuoy size={20} color="#8A33FF" />
          </View>
          <Text style={styles.actionText}>Support</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Assets</Text>
          <TouchableOpacity onPress={() => router.push('/assets')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.topCurrencies}>
          {getTopCurrencies().map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.currencyCard}
              onPress={() => router.push(`/asset/${item.id}`)}
            >
              <CurrencyLogo currency={item.currency} size={36} />
              <View style={styles.currencyInfo}>
                <Text style={styles.currencySymbol}>{item.currency.symbol}</Text>
                <Text style={styles.currencyBalance}>{item.balance.toFixed(4)}</Text>
                <Text style={styles.currencyValue}>${item.value.toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          ))}
          
          {getTopCurrencies().length === 0 && (
            <View style={styles.noAssetsContainer}>
              <Text style={styles.noAssetsText}>No assets yet</Text>
              <TouchableOpacity 
                style={styles.addAssetButton}
                onPress={() => router.push('/assets')}
              >
                <Text style={styles.addAssetText}>Add Assets</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {getRecentTransactions().map((transaction: Transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              userWalletAddress={getPrimaryWalletAddress()}
              onPress={() => router.push(`/transaction/${transaction.id}`)}
            />
          ))}
          
          {getRecentTransactions().length === 0 && (
            <View style={styles.noTransactionsContainer}>
              <RefreshCw size={24} color="#6c757d" />
              <Text style={styles.noTransactionsText}>No transactions yet</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6c757d',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0066FF',
    fontWeight: '500',
  },
  topCurrencies: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  currencyCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  currencyInfo: {
    marginTop: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  currencyBalance: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 2,
  },
  currencyValue: {
    fontSize: 14,
    color: '#6c757d',
  },
  transactionsList: {
    paddingHorizontal: 16,
  },
  noTransactionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  noTransactionsText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6c757d',
  },
  noAssetsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  noAssetsText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  addAssetButton: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addAssetText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 24,
  },
});