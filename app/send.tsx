import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Search, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import UserItem from '@/components/UserItem';
import CurrencyLogo from '@/components/CurrencyLogo';
import useWalletStore from '@/store/walletStore';
import Colors from '@/constants/colors';
import { User } from '@/types/wallet';

export default function SendScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ currency: string }>();
  const { currentUser, users, currencies, sendTransaction } = useWalletStore();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState(params.currency || 'btc');
  const [step, setStep] = useState<'select' | 'amount'>('select');
  
  // Get currency info
  const currency = currencies.find(c => c.id === selectedCurrency) || currencies[0];
  
  // Calculate USD value
  const cryptoAmount = parseFloat(amount) || 0;
  const usdValue = cryptoAmount * currency.exchangeRate;
  
  // Filter out current user from recipients list
  const filteredUsers = users.filter(user => 
    user.id !== currentUser?.id && 
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     Object.values(user.walletAddresses).some(address => 
       address.toLowerCase().includes(searchQuery.toLowerCase())
     ))
  );
  
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setStep('amount');
  };
  
  const handleSend = () => {
    if (!currentUser || !selectedUser) return;
    
    // Check if user is KYC verified
    if (currentUser.kycStatus !== 'verified') {
      Alert.alert(
        'KYC Verification Required',
        'You need to complete KYC verification before sending transactions.',
        [
          { 
            text: 'Go to KYC', 
            onPress: () => router.push('/kyc') 
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      return;
    }
    
    const amountValue = parseFloat(amount);
    
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    
    const currentBalance = currentUser.balances[selectedCurrency] || 0;
    if (amountValue > currentBalance) {
      Alert.alert('Insufficient Balance', `You do not have enough ${currency.symbol}`);
      return;
    }
    
    // Create transaction
    sendTransaction({
      fromAddress: currentUser.walletAddresses[selectedCurrency],
      toAddress: selectedUser.walletAddresses[selectedCurrency],
      amount: amountValue,
      currency: selectedCurrency,
      description: description.trim() || 'Transfer',
    });
    
    Alert.alert(
      'Transaction Submitted',
      'Your transaction has been submitted and is pending approval.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };
  
  const handleBack = () => {
    if (step === 'amount') {
      setStep('select');
      setSelectedUser(null);
    } else {
      router.back();
    }
  };
  
  const handleCurrencyChange = (currencyId: string) => {
    setSelectedCurrency(currencyId);
  };

  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.container}>
        {currentUser.kycStatus !== 'verified' && (
          <View style={styles.kycWarningContainer}>
            <AlertTriangle size={20} color={Colors.dark.pending} style={styles.kycWarningIcon} />
            <View style={styles.kycWarningTextContainer}>
              <Text style={styles.kycWarningTitle}>KYC Verification Required</Text>
              <Text style={styles.kycWarningText}>
                You need to complete KYC verification before sending transactions.
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.kycButton}
              onPress={() => router.push('/kyc')}
            >
              <Text style={styles.kycButtonText}>Verify</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {step === 'select' ? (
          <>
            <View style={styles.searchContainer}>
              <Search size={20} color={Colors.dark.subtext} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or wallet address"
                placeholderTextColor={Colors.dark.subtext}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            <Text style={styles.sectionTitle}>Select Recipient</Text>
            
            <ScrollView style={styles.userList}>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <UserItem
                    key={user.id}
                    user={user}
                    onPress={() => handleUserSelect(user)}
                    currencyId={selectedCurrency}
                  />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No users found</Text>
                </View>
              )}
            </ScrollView>
          </>
        ) : (
          <ScrollView style={styles.formContainer}>
            <View style={styles.recipientContainer}>
              <Text style={styles.recipientLabel}>Sending to:</Text>
              <Text style={styles.recipientName}>{selectedUser?.name}</Text>
              <Text style={styles.recipientAddress}>{selectedUser?.walletAddresses[selectedCurrency]}</Text>
            </View>
            
            <View style={styles.currencySelector}>
              <Text style={styles.currencySelectorLabel}>Select Currency</Text>
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
                    onPress={() => handleCurrencyChange(c.id)}
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
            
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Your Balance:</Text>
              <Text style={styles.balanceValue}>
                {(currentUser.balances[selectedCurrency] || 0).toFixed(Math.min(8, currency.decimals))} {currency.symbol}
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount</Text>
              <View style={styles.amountInputContainer}>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00000000"
                  placeholderTextColor={Colors.dark.subtext}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
                <Text style={styles.currencyLabel}>{currency.symbol}</Text>
              </View>
              {cryptoAmount > 0 && (
                <Text style={styles.usdValue}>
                  ≈ ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </Text>
              )}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="What's this for?"
                placeholderTextColor={Colors.dark.subtext}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
            
            {currentUser.kycStatus === 'verified' ? (
              <View style={styles.kycVerifiedContainer}>
                <ShieldCheck size={20} color={Colors.dark.success} />
                <Text style={styles.kycVerifiedText}>KYC Verified</Text>
              </View>
            ) : (
              <View style={styles.kycUnverifiedContainer}>
                <AlertTriangle size={20} color={Colors.dark.pending} />
                <Text style={styles.kycUnverifiedText}>KYC Verification Required</Text>
              </View>
            )}
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                ((!amount || parseFloat(amount) <= 0) || currentUser.kycStatus !== 'verified') && styles.disabledButton
              ]}
              onPress={handleSend}
              disabled={!amount || parseFloat(amount) <= 0 || currentUser.kycStatus !== 'verified'}
            >
              <Text style={styles.sendButtonText}>Send</Text>
              <ArrowRight size={20} color={Colors.dark.text} />
            </TouchableOpacity>
          </ScrollView>
        )}
        
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>
            {step === 'amount' ? 'Back to Recipients' : 'Cancel'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  kycWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  kycWarningIcon: {
    marginRight: 12,
  },
  kycWarningTextContainer: {
    flex: 1,
  },
  kycWarningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark.pending,
    marginBottom: 2,
  },
  kycWarningText: {
    fontSize: 12,
    color: Colors.dark.subtext,
  },
  kycButton: {
    backgroundColor: Colors.dark.pending,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  kycButtonText: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  userList: {
    flex: 1,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.dark.subtext,
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  recipientContainer: {
    backgroundColor: Colors.dark.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  recipientLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 8,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  recipientAddress: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  currencySelector: {
    marginBottom: 16,
  },
  currencySelectorLabel: {
    fontSize: 14,
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
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  amountInput: {
    flex: 1,
    padding: 16,
    fontSize: 24,
    color: Colors.dark.text,
  },
  currencyLabel: {
    fontSize: 16,
    color: Colors.dark.subtext,
    marginRight: 16,
  },
  usdValue: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginTop: 8,
    textAlign: 'right',
  },
  descriptionInput: {
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    fontSize: 16,
    color: Colors.dark.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  kycVerifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  kycVerifiedText: {
    color: Colors.dark.success,
    marginLeft: 8,
    fontWeight: '500',
  },
  kycUnverifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  kycUnverifiedText: {
    color: Colors.dark.pending,
    marginLeft: 8,
    fontWeight: '500',
  },
  sendButton: {
    backgroundColor: Colors.dark.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: 'rgba(247, 147, 26, 0.5)',
  },
  sendButtonText: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  backButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  backButtonText: {
    color: Colors.dark.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});