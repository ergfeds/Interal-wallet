import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import TransactionItem from '@/components/TransactionItem';
import TransactionDetailModal from '@/components/TransactionDetailModal';
import useWalletStore from '@/store/walletStore';
import Colors from '@/constants/colors';
import { Transaction } from '@/types/wallet';

export default function TransactionsScreen() {
  const router = useRouter();
  const { currentUser, transactions } = useWalletStore();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  
  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }
  
  // Get the primary wallet address for the user
  const getPrimaryWalletAddress = (): string => {
    if (!currentUser) return '';
    return currentUser.walletAddresses['btc'] || Object.values(currentUser.walletAddresses)[0] || '';
  };
  
  const userWalletAddress = getPrimaryWalletAddress();
  
  // Filter transactions for current user
  const userTransactions = transactions
    .filter(t => {
      const userAddresses = Object.values(currentUser.walletAddresses);
      
      if (filter === 'all') {
        return userAddresses.includes(t.fromAddress) || 
               userAddresses.includes(t.toAddress);
      } else if (filter === 'sent') {
        return userAddresses.includes(t.fromAddress);
      } else {
        return userAddresses.includes(t.toAddress);
      }
    })
    .sort((a, b) => b.timestamp - a.timestamp);
  
  const handleTransactionPress = (transaction: Transaction) => {
    router.push(`/transaction/${transaction.id}`);
  };
  
  const closeModal = () => {
    setModalVisible(false);
    setSelectedTransaction(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'sent' && styles.activeFilter]}
          onPress={() => setFilter('sent')}
        >
          <Text style={[styles.filterText, filter === 'sent' && styles.activeFilterText]}>
            Sent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'received' && styles.activeFilter]}
          onPress={() => setFilter('received')}
        >
          <Text style={[styles.filterText, filter === 'received' && styles.activeFilterText]}>
            Received
          </Text>
        </TouchableOpacity>
      </View>
      
      {userTransactions.length > 0 ? (
        <FlatList
          data={userTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              userWalletAddress={userWalletAddress}
              onPress={() => handleTransactionPress(item)}
            />
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      )}
      
      <TransactionDetailModal
        visible={modalVisible}
        transaction={selectedTransaction}
        userWalletAddress={userWalletAddress}
        onClose={closeModal}
      />
    </View>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.dark.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilter: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  filterText: {
    color: Colors.dark.subtext,
    fontWeight: '500',
  },
  activeFilterText: {
    color: Colors.dark.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: Colors.dark.subtext,
    fontSize: 16,
  },
});