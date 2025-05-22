import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ScrollView,
  FlatList,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle, XCircle, DollarSign, Users, ArrowDown, ArrowUp, Shield, User } from 'lucide-react-native';
import TransactionItem from '@/components/TransactionItem';
import CurrencyLogo from '@/components/CurrencyLogo';
import useWalletStore from '@/store/walletStore';
import Colors from '@/constants/colors';
import { Transaction, User as UserType } from '@/types/wallet';

export default function AdminScreen() {
  const router = useRouter();
  const { 
    currentUser, 
    pendingTransactions, 
    approveTransaction, 
    rejectTransaction,
    currencies,
    updateExchangeRate,
    users,
    adjustUserBalance,
    approveKyc,
    rejectKyc
  } = useWalletStore();
  
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'transactions' | 'rates' | 'users' | 'kyc'>('transactions');
  const [selectedCurrency, setSelectedCurrency] = useState('btc');
  const [newExchangeRate, setNewExchangeRate] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustCurrency, setAdjustCurrency] = useState('btc');
  
  const [kycRejectionReason, setKycRejectionReason] = useState('');
  const [showKycRejectionInput, setShowKycRejectionInput] = useState(false);
  const [selectedKycUser, setSelectedKycUser] = useState<UserType | null>(null);
  
  if (!currentUser || !currentUser.isAdmin) {
    // Redirect non-admin users
    router.replace('/');
    return null;
  }
  
  // Get currency info
  const currency = currencies.find(c => c.id === selectedCurrency);
  
  // Get pending KYC users
  const pendingKycUsers = users.filter(u => u.kycStatus === 'pending');
  
  const handleApprove = (transaction: Transaction) => {
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
          onPress: () => {
            approveTransaction(transaction.id);
            Alert.alert('Success', 'Transaction approved successfully');
          },
        },
      ]
    );
  };
  
  const handleReject = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowRejectionInput(true);
  };
  
  const submitRejection = () => {
    if (!selectedTransaction) return;
    
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }
    
    rejectTransaction(selectedTransaction.id, rejectionReason);
    setRejectionReason('');
    setSelectedTransaction(null);
    setShowRejectionInput(false);
    Alert.alert('Success', 'Transaction rejected successfully');
  };
  
  const cancelRejection = () => {
    setRejectionReason('');
    setSelectedTransaction(null);
    setShowRejectionInput(false);
  };
  
  const handleUpdateExchangeRate = () => {
    if (!currency) return;
    
    const rate = parseFloat(newExchangeRate);
    
    if (isNaN(rate) || rate <= 0) {
      Alert.alert('Invalid Rate', 'Please enter a valid exchange rate');
      return;
    }
    
    Alert.alert(
      'Update Exchange Rate',
      `Are you sure you want to update the ${currency.name} (${currency.symbol}) to USD exchange rate to $${rate.toLocaleString()}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Update',
          onPress: () => {
            updateExchangeRate(selectedCurrency, rate);
            setNewExchangeRate('');
            Alert.alert('Success', 'Exchange rate updated successfully');
          },
        },
      ]
    );
  };
  
  const handleSelectCurrency = (currencyId: string) => {
    setSelectedCurrency(currencyId);
    const currencyRate = currencies.find(c => c.id === currencyId)?.exchangeRate.toString() || '';
    setNewExchangeRate(currencyRate);
  };
  
  const handleSelectUser = (user: UserType) => {
    setSelectedUser(user);
  };
  
  const handleAdjustBalance = (isIncrease: boolean) => {
    if (!selectedUser) {
      Alert.alert('Error', 'Please select a user');
      return;
    }
    
    const amount = parseFloat(adjustAmount);
    
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    
    // Apply adjustment (positive for increase, negative for decrease)
    const adjustedAmount = isIncrease ? amount : -amount;
    
    Alert.alert(
      isIncrease ? 'Increase Balance' : 'Decrease Balance',
      `Are you sure you want to ${isIncrease ? 'increase' : 'decrease'} ${selectedUser.name}'s ${adjustCurrency.toUpperCase()} balance by ${amount}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            adjustUserBalance(selectedUser.id, adjustCurrency, adjustedAmount);
            setAdjustAmount('');
            Alert.alert('Success', `User balance ${isIncrease ? 'increased' : 'decreased'} successfully`);
          },
        },
      ]
    );
  };
  
  const handleApproveKyc = (user: UserType) => {
    Alert.alert(
      'Approve KYC',
      `Are you sure you want to approve KYC verification for ${user.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Approve',
          onPress: () => {
            approveKyc(user.id);
            Alert.alert('Success', 'KYC verification approved successfully');
          },
        },
      ]
    );
  };
  
  const handleRejectKyc = (user: UserType) => {
    setSelectedKycUser(user);
    setShowKycRejectionInput(true);
  };
  
  const submitKycRejection = () => {
    if (!selectedKycUser) return;
    
    if (!kycRejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }
    
    rejectKyc(selectedKycUser.id, kycRejectionReason);
    setKycRejectionReason('');
    setSelectedKycUser(null);
    setShowKycRejectionInput(false);
    Alert.alert('Success', 'KYC verification rejected successfully');
  };
  
  const cancelKycRejection = () => {
    setKycRejectionReason('');
    setSelectedKycUser(null);
    setShowKycRejectionInput(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>
          Manage transactions, rates, users, and KYC
        </Text>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'transactions' && styles.activeTabButton]} 
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'transactions' && styles.activeTabText]}>
            Transactions
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'rates' && styles.activeTabButton]} 
          onPress={() => setActiveTab('rates')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'rates' && styles.activeTabText]}>
            Rates
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'users' && styles.activeTabButton]} 
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'users' && styles.activeTabText]}>
            Users
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'kyc' && styles.activeTabButton]} 
          onPress={() => setActiveTab('kyc')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'kyc' && styles.activeTabText]}>
            KYC
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'transactions' && (
        <ScrollView style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Pending Transactions ({pendingTransactions.length})</Text>
          
          {showRejectionInput ? (
            <View style={styles.rejectionContainer}>
              <Text style={styles.rejectionTitle}>Provide Rejection Reason</Text>
              <Text style={styles.transactionInfo}>
                Transaction: {selectedTransaction?.fromAddress.substring(0, 8)}... → 
                {selectedTransaction?.toAddress.substring(0, 8)}...
              </Text>
              <Text style={styles.transactionInfo}>
                Amount: {selectedTransaction?.amount.toFixed(8)} {selectedTransaction?.currency.toUpperCase()}
              </Text>
              
              <TextInput
                style={styles.rejectionInput}
                placeholder="Enter reason for rejection"
                placeholderTextColor={Colors.dark.subtext}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
              />
              
              <View style={styles.rejectionActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]} 
                  onPress={cancelRejection}
                >
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.confirmButton]} 
                  onPress={submitRejection}
                >
                  <Text style={styles.actionButtonText}>Confirm Rejection</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {pendingTransactions.length > 0 ? (
                pendingTransactions.map(item => (
                  <View key={item.id} style={styles.transactionContainer}>
                    <TransactionItem
                      transaction={item}
                      userWalletAddress={currentUser.walletAddresses[item.currency]}
                    />
                    <View style={styles.actionContainer}>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.approveButton]} 
                        onPress={() => handleApprove(item)}
                      >
                        <CheckCircle size={20} color={Colors.dark.text} />
                        <Text style={styles.actionButtonText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.rejectButton]} 
                        onPress={() => handleReject(item)}
                      >
                        <XCircle size={20} color={Colors.dark.text} />
                        <Text style={styles.actionButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No pending transactions</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
      
      {activeTab === 'rates' && (
        <ScrollView style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Exchange Rate Control</Text>
          
          <View style={styles.currencySelector}>
            <Text style={styles.selectorLabel}>Select Currency</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.currencySelectorContent}
            >
              {currencies.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.currencyButton,
                    selectedCurrency === c.id && { backgroundColor: c.color + '33' }
                  ]}
                  onPress={() => handleSelectCurrency(c.id)}
                >
                  <CurrencyLogo currency={c} size={24} />
                  <Text style={[
                    styles.currencyButtonText,
                    selectedCurrency === c.id && { color: c.color }
                  ]}>
                    {c.symbol}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {currency && (
            <View style={styles.rateContainer}>
              <View style={styles.currencyInfoContainer}>
                <CurrencyLogo currency={currency} size={40} />
                <View style={styles.currencyTextContainer}>
                  <Text style={styles.currencyName}>{currency.name}</Text>
                  <Text style={styles.currentRate}>
                    Current Rate: 1 {currency.symbol} = ${currency.exchangeRate.toLocaleString()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.rateInputContainer}>
                <Text style={styles.inputLabel}>New Exchange Rate (USD)</Text>
                <View style={styles.rateInputRow}>
                  <Text style={styles.dollarSign}>$</Text>
                  <TextInput
                    style={styles.rateInput}
                    keyboardType="numeric"
                    value={newExchangeRate}
                    onChangeText={setNewExchangeRate}
                    placeholder="0.00"
                    placeholderTextColor={Colors.dark.subtext}
                  />
                </View>
              </View>
              
              <TouchableOpacity 
                style={[styles.updateRateButton, { backgroundColor: currency.color }]}
                onPress={handleUpdateExchangeRate}
              >
                <DollarSign size={20} color={Colors.dark.text} />
                <Text style={styles.updateRateText}>Update Exchange Rate</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.ratesListContainer}>
            <Text style={styles.ratesListTitle}>All Exchange Rates</Text>
            {currencies.map(c => (
              <View key={c.id} style={styles.rateItem}>
                <View style={styles.rateItemLeft}>
                  <CurrencyLogo currency={c} size={32} />
                  <View style={styles.rateItemInfo}>
                    <Text style={styles.rateItemName}>{c.name}</Text>
                    <Text style={styles.rateItemSymbol}>{c.symbol}</Text>
                  </View>
                </View>
                <Text style={styles.rateItemValue}>${c.exchangeRate.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
      
      {activeTab === 'users' && (
        <ScrollView style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Adjust User Balances</Text>
          
          <View style={styles.userSelector}>
            <Text style={styles.selectorLabel}>Select User</Text>
            <ScrollView style={styles.userList}>
              {users.filter(u => !u.isAdmin).map(user => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.userItem,
                    selectedUser?.id === user.id && styles.selectedUserItem
                  ]}
                  onPress={() => handleSelectUser(user)}
                >
                  <Text style={styles.userName}>{user.name}</Text>
                  {selectedUser?.id === user.id && (
                    <CheckCircle size={16} color={Colors.dark.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {selectedUser && (
            <View style={styles.balanceAdjustContainer}>
              <Text style={styles.balanceAdjustTitle}>
                Adjust Balance for {selectedUser.name}
              </Text>
              
              <View style={styles.currencySelector}>
                <Text style={styles.selectorLabel}>Select Currency</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.currencySelectorContent}
                >
                  {currencies.map(c => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.currencyButton,
                        adjustCurrency === c.id && { backgroundColor: c.color + '33' }
                      ]}
                      onPress={() => setAdjustCurrency(c.id)}
                    >
                      <CurrencyLogo currency={c} size={24} />
                      <Text style={[
                        styles.currencyButtonText,
                        adjustCurrency === c.id && { color: c.color }
                      ]}>
                        {c.symbol}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.currentBalanceContainer}>
                <Text style={styles.currentBalanceLabel}>Current Balance:</Text>
                <Text style={styles.currentBalanceValue}>
                  {(selectedUser.balances[adjustCurrency] || 0).toFixed(8)} {adjustCurrency.toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.amountInputContainer}>
                <Text style={styles.inputLabel}>Amount to Adjust</Text>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="numeric"
                  value={adjustAmount}
                  onChangeText={setAdjustAmount}
                  placeholder="0.00000000"
                  placeholderTextColor={Colors.dark.subtext}
                />
              </View>
              
              <View style={styles.adjustButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.adjustButton, styles.increaseButton]} 
                  onPress={() => handleAdjustBalance(true)}
                >
                  <ArrowUp size={20} color={Colors.dark.text} />
                  <Text style={styles.adjustButtonText}>Increase Balance</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.adjustButton, styles.decreaseButton]} 
                  onPress={() => handleAdjustBalance(false)}
                >
                  <ArrowDown size={20} color={Colors.dark.text} />
                  <Text style={styles.adjustButtonText}>Decrease Balance</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}
      
      {activeTab === 'kyc' && (
        <ScrollView style={styles.tabContent}>
          <Text style={styles.sectionTitle}>KYC Verification Requests ({pendingKycUsers.length})</Text>
          
          {showKycRejectionInput ? (
            <View style={styles.rejectionContainer}>
              <Text style={styles.rejectionTitle}>Provide KYC Rejection Reason</Text>
              <Text style={styles.transactionInfo}>
                User: {selectedKycUser?.name}
              </Text>
              
              <TextInput
                style={styles.rejectionInput}
                placeholder="Enter reason for KYC rejection"
                placeholderTextColor={Colors.dark.subtext}
                value={kycRejectionReason}
                onChangeText={setKycRejectionReason}
                multiline
              />
              
              <View style={styles.rejectionActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]} 
                  onPress={cancelKycRejection}
                >
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.confirmButton]} 
                  onPress={submitKycRejection}
                >
                  <Text style={styles.actionButtonText}>Confirm Rejection</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {pendingKycUsers.length > 0 ? (
                pendingKycUsers.map(user => (
                  <View key={user.id} style={styles.kycUserContainer}>
                    <View style={styles.kycUserHeader}>
                      <Image 
                        source={{ uri: user.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
                        style={styles.kycUserAvatar} 
                      />
                      <View style={styles.kycUserInfo}>
                        <Text style={styles.kycUserName}>{user.name}</Text>
                        <Text style={styles.kycUserStatus}>KYC Status: Pending</Text>
                      </View>
                    </View>
                    
                    <View style={styles.kycDetailsContainer}>
                      <Text style={styles.kycDetailsTitle}>KYC Details</Text>
                      
                      <View style={styles.kycDetailRow}>
                        <Text style={styles.kycDetailLabel}>Full Name:</Text>
                        <Text style={styles.kycDetailValue}>{user.kycData?.fullName}</Text>
                      </View>
                      
                      <View style={styles.kycDetailRow}>
                        <Text style={styles.kycDetailLabel}>Date of Birth:</Text>
                        <Text style={styles.kycDetailValue}>{user.kycData?.dateOfBirth}</Text>
                      </View>
                      
                      <View style={styles.kycDetailRow}>
                        <Text style={styles.kycDetailLabel}>Address:</Text>
                        <Text style={styles.kycDetailValue}>{user.kycData?.address}</Text>
                      </View>
                      
                      <View style={styles.kycDetailRow}>
                        <Text style={styles.kycDetailLabel}>ID Type:</Text>
                        <Text style={styles.kycDetailValue}>
                          {user.kycData?.idType === 'passport' ? 'Passport' : 
                           user.kycData?.idType === 'drivers_license' ? "Driver's License" : 
                           'National ID'}
                        </Text>
                      </View>
                      
                      <View style={styles.kycDetailRow}>
                        <Text style={styles.kycDetailLabel}>ID Number:</Text>
                        <Text style={styles.kycDetailValue}>{user.kycData?.idNumber}</Text>
                      </View>
                      
                      <View style={styles.kycDetailRow}>
                        <Text style={styles.kycDetailLabel}>Submission Date:</Text>
                        <Text style={styles.kycDetailValue}>
                          {user.kycData?.submissionDate ? new Date(user.kycData.submissionDate).toLocaleDateString() : 'N/A'}
                        </Text>
                      </View>
                      
                      {/* ID Document Images would be displayed here in a real app */}
                      <View style={styles.kycImagesNote}>
                        <Text style={styles.kycImagesNoteText}>
                          * ID document images and selfie would be displayed here in a production app
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.actionContainer}>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.approveButton]} 
                        onPress={() => handleApproveKyc(user)}
                      >
                        <CheckCircle size={20} color={Colors.dark.text} />
                        <Text style={styles.actionButtonText}>Approve KYC</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.rejectButton]} 
                        onPress={() => handleRejectKyc(user)}
                      >
                        <XCircle size={20} color={Colors.dark.text} />
                        <Text style={styles.actionButtonText}>Reject KYC</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No pending KYC verification requests</Text>
                </View>
              )}
            </>
          )}
          
          <View style={styles.kycStatsContainer}>
            <Text style={styles.kycStatsTitle}>KYC Statistics</Text>
            
            <View style={styles.kycStatsRow}>
              <View style={styles.kycStatItem}>
                <Text style={styles.kycStatValue}>{users.filter(u => u.kycStatus === 'verified').length}</Text>
                <Text style={styles.kycStatLabel}>Verified</Text>
              </View>
              
              <View style={styles.kycStatItem}>
                <Text style={styles.kycStatValue}>{users.filter(u => u.kycStatus === 'pending').length}</Text>
                <Text style={styles.kycStatLabel}>Pending</Text>
              </View>
              
              <View style={styles.kycStatItem}>
                <Text style={styles.kycStatValue}>{users.filter(u => u.kycStatus === 'unverified').length}</Text>
                <Text style={styles.kycStatLabel}>Rejected</Text>
              </View>
              
              <View style={styles.kycStatItem}>
                <Text style={styles.kycStatValue}>{users.filter(u => !u.kycData).length}</Text>
                <Text style={styles.kycStatLabel}>Not Submitted</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.dark.subtext,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.primary,
  },
  tabButtonText: {
    color: Colors.dark.subtext,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.dark.primary,
  },
  tabContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    padding: 16,
  },
  transactionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    marginBottom: 16,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: Colors.dark.card,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    margin: 4,
  },
  approveButton: {
    backgroundColor: Colors.dark.success,
  },
  rejectButton: {
    backgroundColor: Colors.dark.error,
  },
  cancelButton: {
    backgroundColor: Colors.dark.border,
  },
  confirmButton: {
    backgroundColor: Colors.dark.error,
  },
  actionButtonText: {
    color: Colors.dark.text,
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    margin: 16,
  },
  emptyText: {
    color: Colors.dark.subtext,
    fontSize: 16,
  },
  rejectionContainer: {
    padding: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    margin: 16,
  },
  rejectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  transactionInfo: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 4,
  },
  rejectionInput: {
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    fontSize: 16,
    color: Colors.dark.text,
    minHeight: 120,
    textAlignVertical: 'top',
    marginTop: 16,
    marginBottom: 16,
  },
  rejectionActions: {
    flexDirection: 'row',
  },
  currencySelector: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 16,
    color: Colors.dark.subtext,
    marginBottom: 8,
  },
  currencySelectorContent: {
    paddingVertical: 8,
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  currencyButtonText: {
    color: Colors.dark.text,
    marginLeft: 6,
    fontWeight: '500',
  },
  rateContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  currencyInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currencyTextContainer: {
    marginLeft: 12,
  },
  currencyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  currentRate: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  rateInputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 8,
  },
  rateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  dollarSign: {
    fontSize: 18,
    color: Colors.dark.text,
    paddingLeft: 16,
  },
  rateInput: {
    flex: 1,
    padding: 16,
    fontSize: 18,
    color: Colors.dark.text,
  },
  updateRateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  updateRateText: {
    color: Colors.dark.text,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  ratesListContainer: {
    margin: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    padding: 16,
  },
  ratesListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  rateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  rateItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateItemInfo: {
    marginLeft: 12,
  },
  rateItemName: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  rateItemSymbol: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  rateItemValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  userSelector: {
    margin: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    padding: 16,
  },
  userList: {
    maxHeight: 200,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  selectedUserItem: {
    backgroundColor: 'rgba(247, 147, 26, 0.1)',
  },
  userName: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  balanceAdjustContainer: {
    margin: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    padding: 16,
  },
  balanceAdjustTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  currentBalanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: Colors.dark.background,
    padding: 12,
    borderRadius: 8,
  },
  currentBalanceLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  currentBalanceValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  amountInputContainer: {
    marginBottom: 16,
  },
  amountInput: {
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    fontSize: 16,
    color: Colors.dark.text,
  },
  adjustButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  adjustButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    margin: 4,
  },
  increaseButton: {
    backgroundColor: Colors.dark.success,
  },
  decreaseButton: {
    backgroundColor: Colors.dark.error,
  },
  adjustButtonText: {
    color: Colors.dark.text,
    fontWeight: '500',
    marginLeft: 8,
  },
  kycUserContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    margin: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
  },
  kycUserHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  kycUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  kycUserInfo: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  kycUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  kycUserStatus: {
    fontSize: 14,
    color: Colors.dark.pending,
  },
  kycDetailsContainer: {
    padding: 16,
  },
  kycDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  kycDetailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  kycDetailLabel: {
    width: 120,
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  kycDetailValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.text,
  },
  kycImagesNote: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  kycImagesNoteText: {
    fontSize: 12,
    color: Colors.dark.subtext,
    fontStyle: 'italic',
  },
  kycStatsContainer: {
    margin: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    padding: 16,
  },
  kycStatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  kycStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kycStatItem: {
    alignItems: 'center',
  },
  kycStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  kycStatLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
  },
});