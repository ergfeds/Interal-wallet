import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import AssetItem from '@/components/AssetItem';
import useWalletStore from '@/store/walletStore';
import Colors from '@/constants/colors';

export default function AssetsScreen() {
  const router = useRouter();
  const { currentUser, currencies } = useWalletStore();
  
  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading assets...</Text>
      </View>
    );
  }
  
  // Calculate total USD value
  const totalUsdValue = Object.entries(currentUser.balances).reduce((total, [currencyId, balance]) => {
    const currency = currencies.find(c => c.id === currencyId);
    if (currency) {
      return total + (balance * currency.exchangeRate);
    }
    return total;
  }, 0);
  
  // Create asset items with currency info
  const assets = Object.entries(currentUser.balances)
    .map(([currencyId, balance]) => {
      const currency = currencies.find(c => c.id === currencyId);
      if (!currency) return null;
      return {
        id: currencyId,
        currency,
        balance
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const aValue = a!.balance * a!.currency.exchangeRate;
      const bValue = b!.balance * b!.currency.exchangeRate;
      return bValue - aValue;
    });
  
  const handleAssetPress = (currencyId: string) => {
    router.push(`/asset/${currencyId}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.totalLabel}>Total Balance</Text>
        <Text style={styles.totalValue}>
          ${totalUsdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </Text>
      </View>
      
      <FlatList
        data={assets}
        keyExtractor={item => item!.id}
        renderItem={({ item }) => (
          <AssetItem
            currency={item!.currency}
            balance={item!.balance}
            onPress={() => handleAssetPress(item!.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No assets found</Text>
          </View>
        }
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
  header: {
    padding: 16,
    backgroundColor: Colors.dark.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
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