import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Copy, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import Colors from '@/constants/colors';

interface WalletCardProps {
  balance: number;
  walletAddress: string;
  onSend: () => void;
  onReceive: () => void;
}

export default function WalletCard({ balance, walletAddress, onSend, onReceive }: WalletCardProps) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async () => {
    if (!walletAddress) {
      Alert.alert('Error', 'No wallet address available');
      return;
    }
    
    await Clipboard.setStringAsync(walletAddress);
    setCopied(true);
    
    // Reset copied state after 3 seconds
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };
  
  const formatWalletAddress = (address: string) => {
    if (!address) return 'No wallet address';
    if (address.length <= 16) return address;
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balanceAmount}>{balance.toLocaleString()}</Text>
        <Text style={styles.balanceCurrency}>BTC</Text>
        <Text style={styles.balanceUsd}>${(balance * 40000).toLocaleString()}</Text>
      </View>
      
      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>Wallet Address</Text>
        <TouchableOpacity style={styles.addressRow} onPress={copyToClipboard}>
          <Text style={styles.address}>{formatWalletAddress(walletAddress)}</Text>
          <Copy size={16} color={copied ? '#00A86B' : Colors.dark.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={onSend}>
          <Text style={styles.actionButtonText}>Send</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onReceive}>
          <Text style={styles.actionButtonText}>Receive</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceContainer: {
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  balanceCurrency: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  balanceUsd: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  addressContainer: {
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
  },
  addressLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  address: {
    fontSize: 14,
    color: Colors.dark.subtext,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#0052FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.dark.text,
    fontWeight: '600',
  },
});