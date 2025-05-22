import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Platform, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Copy, Share as ShareIcon, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import QRCode from '@/components/QRCode';
import CurrencyLogo from '@/components/CurrencyLogo';
import useWalletStore from '@/store/walletStore';
import Colors from '@/constants/colors';

export default function ReceiveScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ currency: string }>();
  const { currentUser, currencies } = useWalletStore();
  const [selectedCurrency, setSelectedCurrency] = useState(params.currency || 'btc');
  
  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }
  
  // Get currency info
  const currency = currencies.find(c => c.id === selectedCurrency) || currencies[0];
  
  // Get wallet address for selected currency
  const walletAddress = currentUser.walletAddresses[selectedCurrency] || '';
  
  const copyToClipboard = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web
        try {
          await navigator.clipboard.writeText(walletAddress);
          Alert.alert('Copied', 'Wallet address copied to clipboard');
        } catch (err) {
          console.error('Failed to copy: ', err);
          Alert.alert('Error', 'Failed to copy to clipboard. Your browser may be blocking this feature.');
        }
      } else {
        // For native
        await Clipboard.setStringAsync(walletAddress);
        Alert.alert('Copied', 'Wallet address copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `My ${currency.name} wallet address: ${walletAddress}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Receive {currency.name}</Text>
      <Text style={styles.subtitle}>Share your wallet address to receive {currency.symbol}</Text>
      
      {currentUser.kycStatus !== 'verified' && (
        <View style={styles.kycWarningContainer}>
          <AlertTriangle size={20} color={Colors.dark.pending} style={styles.kycWarningIcon} />
          <View style={styles.kycWarningTextContainer}>
            <Text style={styles.kycWarningTitle}>KYC Verification Required</Text>
            <Text style={styles.kycWarningText}>
              You can receive funds, but you'll need to complete KYC verification before sending transactions.
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
      
      <View style={styles.currencySelector}>
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
              onPress={() => setSelectedCurrency(c.id)}
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
      
      <LinearGradient
        colors={['#1E1E1E', '#2D2D2D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.qrContainer}
      >
        <View style={styles.currencyLogoContainer}>
          <CurrencyLogo currency={currency} size={40} />
        </View>
        <View style={styles.qrCodeWrapper}>
          <QRCode value={walletAddress} size={200} />
        </View>
      </LinearGradient>
      
      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>Your {currency.name} Address</Text>
        <Text style={styles.address} selectable>{walletAddress}</Text>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: currency.color }]} 
            onPress={copyToClipboard}
          >
            <Copy size={20} color={Colors.dark.text} />
            <Text style={styles.actionText}>Copy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: currency.color }]} 
            onPress={handleShare}
          >
            <ShareIcon size={20} color={Colors.dark.text} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Share this address with other users to receive {currency.symbol}. Make sure the address is correct before sharing.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    padding: 16,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.subtext,
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  kycWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
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
  currencySelector: {
    marginBottom: 24,
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
  qrContainer: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  currencyLogoContainer: {
    position: 'absolute',
    top: -20,
    padding: 8,
    backgroundColor: Colors.dark.background,
    borderRadius: 30,
    zIndex: 1,
  },
  qrCodeWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
  },
  addressContainer: {
    width: '100%',
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  addressLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: Colors.dark.text,
    marginBottom: 16,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionText: {
    color: Colors.dark.text,
    marginLeft: 8,
    fontWeight: '500',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.dark.pending,
  },
  infoText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
});