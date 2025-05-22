import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import useWalletStore from '@/store/walletStore';
import CurrencyLogo from '@/components/CurrencyLogo';
import { Transaction, Currency } from '@/types/wallet';
import Colors from '@/constants/colors';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentUser, transactions, currencies, approveTransaction, rejectTransaction } = useWalletStore();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [transactionType, setTransactionType] = useState<'sent' | 'received' | 'self' | 'unknown'>('unknown');
  
  useEffect(() => {
    if (!id || !currentUser) return;
    
    // Find the transaction
    const foundTransaction = transactions.find(t => t.id === id);
    if (!foundTransaction) return;
    
    setTransaction(foundTransaction);
    
    // Find the currency
    const foundCurrency = currencies.find(c => c.id === foundTransaction.currency);
    if (foundCurrency) {
      setCurrency(foundCurrency);
    }
    
    // Determine transaction type
    const userAddresses = Object.values(currentUser.walletAddresses);
    
    if (userAddresses.includes(foundTransaction.fromAddress) && 
        userAddresses.includes(foundTransaction.toAddress)) {
      setTransactionType('self');
    } else if (userAddresses.includes(foundTransaction.fromAddress)) {
      setTransactionType('sent');
    } else if (userAddresses.includes(foundTransaction.toAddress)) {
      setTransactionType('received');
    } else {
      setTransactionType('unknown');
    }
  }, [id, currentUser, transactions, currencies]);
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Copied to clipboard');
  };
  
  const handleApproveTransaction = () => {
    if (!transaction) return;
    
    Alert.alert(
      'Approve Transaction',
      'Are you sure you want to approve this transaction?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await approveTransaction(transaction.id);
              Alert.alert('Success', 'Transaction approved successfully');
            } catch (error) {
              console.error('Failed to approve transaction:', error);
              Alert.alert('Error', 'Failed to approve transaction');
            }
          },
        },
      ]
    );
  };
  
  const handleRejectTransaction = () => {
    if (!transaction) return;
    
    Alert.prompt(
      'Reject Transaction',
      'Please provide a reason for rejection:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          onPress: async (reason) => {
            if (!reason) {
              Alert.alert('Error', 'Please provide a reason for rejection');
              return;
            }
            
            try {
              await rejectTransaction(transaction.id, reason);
              Alert.alert('Success', 'Transaction rejected successfully');
            } catch (error) {
              console.error('Failed to reject transaction:', error);
              Alert.alert('Error', 'Failed to reject transaction');
            }
          },
        },
      ],
      'plain-text'
    );
  };
  
  if (!transaction || !currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading transaction details...</Text>
      </View>
    );
  }
  
  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'pending':
        return <Clock size={20} color={Colors.dark.pending} />;
      case 'approved':
      case 'completed':
        return <CheckCircle size={20} color={Colors.dark.success} />;
      case 'rejected':
        return <XCircle size={20} color={Colors.dark.error} />;
      default:
        return null;
    }
  };
  
  const getTransactionIcon = () => {
    switch (transactionType) {
      case 'sent':
        return <ArrowUpRight size={24} color={Colors.dark.error} />;
      case 'received':
        return <ArrowDownLeft size={24} color={Colors.dark.success} />;
      case 'self':
        return <ArrowUpRight size={24} color={Colors.dark.primary} />;
      default:
        return null;
    }
  };
  
  const getTransactionTitle = () => {
    switch (transactionType) {
      case 'sent':
        return 'Sent';
      case 'received':
        return 'Received';
      case 'self':
        return 'Self Transfer';
      default:
        return 'Transaction';
    }
  };
  
  const getTransactionColor = () => {
    switch (transactionType) {
      case 'sent':
        return Colors.dark.error;
      case 'received':
        return Colors.dark.success;
      case 'self':
        return Colors.dark.primary;
      default:
        return Colors.dark.text;
    }
  };
  
  const getTransactionSign = () => {
    switch (transactionType) {
      case 'sent':
        return '-';
      case 'received':
        return '+';
      case 'self':
        return '';
      default:
        return '';
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.transactionTypeContainer}>
          <View style={[styles.iconContainer, { backgroundColor: getTransactionColor() + '20' }]}>
            {getTransactionIcon()}
          </View>
          <Text style={styles.transactionType}>{getTransactionTitle()}</Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: getTransactionColor() }]}>
            {getTransactionSign()}{transaction.amount} {currency?.symbol || transaction.currency.toUpperCase()}
          </Text>
          {currency && (
            <Text style={styles.fiatAmount}>
              ${(transaction.amount * currency.exchangeRate).toLocaleString()}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <View style={styles.statusContainer}>
            {getStatusIcon()}
            <Text style={[
              styles.statusText,
              (transaction.status === 'approved' || transaction.status === 'completed') ? styles.approvedStatus :
              transaction.status === 'rejected' ? styles.rejectedStatus :
              styles.pendingStatus
            ]}>
              {transaction.status === 'completed' ? 'Completed' : 
               transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formatDate(transaction.timestamp)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Currency</Text>
          <View style={styles.currencyContainer}>
            {currency && <CurrencyLogo currency={currency} size={24} />}
            <Text style={styles.detailValue}>
              {currency?.name || transaction.currency.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>From</Text>
          <TouchableOpacity 
            style={styles.addressContainer}
            onPress={() => copyToClipboard(transaction.fromAddress)}
          >
            <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
              {transaction.fromAddress}
            </Text>
            <Copy size={16} color={Colors.dark.subtext} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>To</Text>
          <TouchableOpacity 
            style={styles.addressContainer}
            onPress={() => copyToClipboard(transaction.toAddress)}
          >
            <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
              {transaction.toAddress}
            </Text>
            <Copy size={16} color={Colors.dark.subtext} />
          </TouchableOpacity>
        </View>
        
        {transaction.fee !== undefined && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fee</Text>
            <Text style={styles.detailValue}>
              {transaction.fee} {currency?.symbol || transaction.currency.toUpperCase()}
            </Text>
          </View>
        )}
        
        {transaction.description && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{transaction.description}</Text>
          </View>
        )}
        
        {transaction.rejectionReason && (
          <View style={styles.rejectionContainer}>
            <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
            <Text style={styles.rejectionReason}>{transaction.rejectionReason}</Text>
          </View>
        )}
      </View>
      
      {currentUser.isAdmin && transaction.status === 'pending' && (
        <View style={styles.adminActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleRejectTransaction}
          >
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.approveButton]}
            onPress={handleApproveTransaction}
          >
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  loadingText: {
    color: Colors.dark.text,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  transactionTypeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionType: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'center',
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fiatAmount: {
    fontSize: 16,
    color: Colors.dark.subtext,
  },
  detailsCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    margin: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.dark.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    marginLeft: 4,
  },
  pendingStatus: {
    color: Colors.dark.pending,
  },
  approvedStatus: {
    color: Colors.dark.success,
  },
  rejectedStatus: {
    color: Colors.dark.error,
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '70%',
  },
  rejectionContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.dark.error + '20',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.dark.error,
  },
  rejectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  rejectionReason: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: Colors.dark.success,
    marginLeft: 8,
  },
  rejectButton: {
    backgroundColor: Colors.dark.error,
    marginRight: 8,
  },
  actionButtonText: {
    color: Colors.dark.text,
    fontWeight: '600',
    fontSize: 16,
  },
});