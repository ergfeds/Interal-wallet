import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import TransactionItem from '@/components/TransactionItem';
import CurrencyLogo from '@/components/CurrencyLogo';
import useWalletStore from '@/store/walletStore';
import Colors from '@/constants/colors';

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentUser, currencies, transactions } = useWalletStore();
  
  if (!currentUser || !id) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading asset...</Text>
      </View>
    );
  }
  
  // Get currency info
  const currency = currencies.find(c => c.id === id);
  if (!currency) {
    router.back();
    return null;
  }
  
  // Get balance
  const balance = currentUser.balances[id] || 0;
  
  // Calculate USD value
  const usdValue = balance * currency.exchangeRate;
  
  // Get user transactions for this currency
  const userTransactions = transactions
    .filter(t => 
      t.currency === id && (
        t.fromAddress === currentUser.walletAddresses[id] || 
        t.toAddress === currentUser.walletAddresses[id]
      )
    )
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);
  
  const handleSend = () => {
    router.push({
      pathname: '/send',
      params: { currency: id }
    });
  };
  
  const handleReceive = () => {
    router.push({
      pathname: '/receive',
      params: { currency: id }
    });
  };
  
  const handleTransactionPress = (transactionId: string) => {
    router.push(`/transaction/${transactionId}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.currencyInfo}>
          <CurrencyLogo currency={currency} size={60} />
          <View style={styles.currencyTextContainer}>
            <Text style={styles.currencyName}>{currency.name}</Text>
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
          </View>
        </View>
        
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <Text style={styles.balanceValue}>
            {balance.toFixed(Math.min(8, currency.decimals))} {currency.symbol}
          </Text>
          <Text style={styles.usdValue}>
            ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </Text>
        </View>
        
        <View style={styles.exchangeRateContainer}>
          <Text style={styles.exchangeRateLabel}>Exchange Rate</Text>
          <Text style={styles.exchangeRateValue}>
            1 {currency.symbol} = ${currency.exchangeRate.toLocaleString()}
          </Text>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: currency.color }]} 
          onPress={handleSend}
        >
          <ArrowUpRight size={20} color={Colors.dark.text} />
          <Text style={styles.actionButtonText}>Send</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: currency.color }]} 
          onPress={handleReceive}
        >
          <ArrowDownRight size={20} color={Colors.dark.text} />
          <Text style={styles.actionButtonText}>Receive</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.transactionsContainer}>
        <Text style={styles.transactionsTitle}>Recent Transactions</Text>
        
        {userTransactions.length > 0 ? (
          userTransactions.map(transaction => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              userWalletAddress={currentUser.walletAddresses[id]}
              onPress={() => handleTransactionPress(transaction.id)}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  loadingText: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.dark.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currencyTextContainer: {
    marginLeft: 16,
  },
  currencyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  currencySymbol: {
    fontSize: 16,
    color: Colors.dark.subtext,
  },
  balanceContainer: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  usdValue: {
    fontSize: 16,
    color: Colors.dark.subtext,
  },
  exchangeRateContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  exchangeRateLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 4,
  },
  exchangeRateValue: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  actionButtonText: {
    color: Colors.dark.text,
    fontWeight: '600',
    marginLeft: 8,
  },
  transactionsContainer: {
    flex: 1,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    padding: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.dark.subtext,
    fontSize: 16,
  },
});