import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Transaction } from '@/types/wallet';

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: Transaction | null;
  userWalletAddress: string;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  visible,
  transaction,
  userWalletAddress,
  onClose,
}) => {
  if (!transaction) return null;

  const isSender = transaction.fromAddress === userWalletAddress;
  
  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'pending':
        return <Clock size={24} color={Colors.dark.pending} />;
      case 'approved':
      case 'completed':
        return <CheckCircle size={24} color={Colors.dark.success} />;
      case 'rejected':
        return <XCircle size={24} color={Colors.dark.error} />;
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
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Transaction Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollContent}>
            <View style={styles.iconContainer}>
              {isSender ? (
                <ArrowUpRight size={40} color={Colors.dark.error} />
              ) : (
                <ArrowDownLeft size={40} color={Colors.dark.success} />
              )}
            </View>
            
            <Text style={styles.amount}>
              {isSender ? '-' : '+'}{transaction.amount} COIN
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
            
            {transaction.status === 'rejected' && transaction.rejectionReason && (
              <View style={styles.rejectionContainer}>
                <Text style={styles.rejectionTitle}>Network Message:</Text>
                <Text style={styles.rejectionReason}>{transaction.rejectionReason}</Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>{transaction.id}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>{formatDate(transaction.timestamp)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>From</Text>
              <Text style={styles.detailValue}>{transaction.fromAddress}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>To</Text>
              <Text style={styles.detailValue}>{transaction.toAddress}</Text>
            </View>
            
            {transaction.description && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailValue}>{transaction.description}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
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
  rejectionContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  rejectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.error,
    marginBottom: 8,
  },
  rejectionReason: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.dark.text,
  },
});

export default TransactionDetailModal;