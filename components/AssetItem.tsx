import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';
import CurrencyLogo from './CurrencyLogo';
import { Currency } from '@/types/wallet';

interface AssetItemProps {
  currency: Currency;
  balance: number;
  onPress?: () => void;
}

const AssetItem: React.FC<AssetItemProps> = ({ currency, balance, onPress }) => {
  // Calculate USD value
  const usdValue = balance * currency.exchangeRate;
  
  // Format balance based on currency decimals
  const formatBalance = (value: number, decimals: number) => {
    return value.toFixed(Math.min(8, decimals));
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      <CurrencyLogo currency={currency} size={40} />
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{currency.name}</Text>
        <Text style={styles.symbol}>{currency.symbol}</Text>
      </View>
      
      <View style={styles.balanceContainer}>
        <Text style={styles.balance}>
          {formatBalance(balance, currency.decimals)} {currency.symbol}
        </Text>
        <Text style={styles.usdValue}>
          ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    backgroundColor: Colors.dark.card,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  symbol: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balance: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  usdValue: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
});

export default AssetItem;