import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowDownLeft, ArrowUpRight, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Transaction } from '@/types/wallet';

interface TransactionItemProps {
  transaction: Transaction;
  userWalletAddress: string;
  onPress?: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, 
  userWalletAddress,
  onPress
}) => {
  const isSender = transaction.fromAddress === userWalletAddress;
  const isReceiver = transaction.toAddress === userWalletAddress;
  
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
  
  const getStatusText = () => {
    switch (transaction.status) {
      case 'pending':
        return 'Pending';
      case 'approved':
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Failed';
      default:
        return '';
    }
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.iconContainer}>
        {isSender ? (
          <ArrowUpRight size={24} color={Colors.dark.error} />
        ) : (
          <ArrowDownLeft size={24} color={Colors.dark.success} />
        )}
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>
          {isSender ? 'Sent to ' : 'Received from '}
          <Text style={styles.address}>
            {isSender 
              ? formatAddress(transaction.toAddress)
              : formatAddress(transaction.fromAddress)
            }
          </Text>
        </Text>
        
        <Text style={styles.description}>
          {transaction.description || 'No description'}
        </Text>
        
        <Text style={styles.timestamp}>{formatDate(transaction.timestamp)}</Text>
        
        {transaction.status === 'rejected' && transaction.rejectionReason && (
          <Text style={styles.rejectionReason}>
            Network message: {transaction.rejectionReason}
          </Text>
        )}
      </View>
      
      <View style={styles.rightContainer}>
        <Text style={[
          styles.amount,
          isSender ? styles.sentAmount : styles.receivedAmount
        ]}>
          {isSender ? '-' : '+'}{transaction.amount.toFixed(8)} BTC
        </Text>
        
        <View style={styles.statusContainer}>
          {getStatusIcon()}
          <Text style={[
            styles.statusText,
            (transaction.status === 'approved' || transaction.status === 'completed') ? styles.approvedText :
            transaction.status === 'rejected' ? styles.rejectedText :
            styles.pendingText
          ]}>
            {getStatusText()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    backgroundColor: Colors.dark.card,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  address: {
    color: Colors.dark.primary,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.dark.subtext,
  },
  rejectionReason: {
    fontSize: 12,
    color: Colors.dark.error,
    marginTop: 4,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sentAmount: {
    color: Colors.dark.error,
  },
  receivedAmount: {
    color: Colors.dark.success,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
  },
  approvedText: {
    color: Colors.dark.success,
  },
  rejectedText: {
    color: Colors.dark.error,
  },
  pendingText: {
    color: Colors.dark.pending,
  },
});

export default TransactionItem;