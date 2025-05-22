import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import Colors from '@/constants/colors';
import useWalletStore from '@/store/walletStore';

const NotificationBadge = () => {
  const router = useRouter();
  const { unreadNotificationsCount } = useWalletStore();
  
  const handlePress = () => {
    router.push('/notifications');
  };
  
  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Bell size={24} color={Colors.dark.text} />
      {unreadNotificationsCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.dark.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default NotificationBadge;