import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Colors from '@/constants/colors';
import { User } from '@/types/wallet';

interface UserItemProps {
  user: User;
  onPress: () => void;
  currencyId?: string; // Optional currency ID to specify which wallet address to show
}

const UserItem: React.FC<UserItemProps> = ({ user, onPress, currencyId = 'btc' }) => {
  const formatWalletAddress = (address: string | undefined) => {
    if (!address) return 'No address available';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Get the wallet address for the specified currency, or the first available one
  const getWalletAddress = () => {
    if (user.walletAddresses[currencyId]) {
      return user.walletAddresses[currencyId];
    }
    
    // If no address for the specified currency, get the first available one
    const addresses = Object.values(user.walletAddresses);
    return addresses.length > 0 ? addresses[0] : undefined;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image 
        source={{ uri: user.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
        style={styles.avatar} 
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.address}>{formatWalletAddress(getWalletAddress())}</Text>
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
});

export default UserItem;