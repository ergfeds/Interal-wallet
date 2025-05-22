import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCheck } from 'lucide-react-native';
import NotificationItem from '@/components/NotificationItem';
import useWalletStore from '@/store/walletStore';
import Colors from '@/constants/colors';
import { Notification } from '@/types/wallet';

export default function NotificationsScreen() {
  const router = useRouter();
  const { 
    currentUser, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useWalletStore();
  
  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }
  
  // Filter notifications for current user
  const userNotifications = notifications
    .filter(n => n.userId === currentUser.id)
    .sort((a, b) => b.timestamp - a.timestamp);
  
  const handleNotificationPress = async (notification: Notification) => {
    try {
      // Mark notification as read
      await markNotificationAsRead(notification.id);
      
      // Navigate based on notification type
      if (notification.type === 'transaction' && notification.transactionId) {
        router.push(`/transaction/${notification.transactionId}`);
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
      Alert.alert('Error', 'Failed to process notification. Please try again.');
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark notifications as read. Please try again.');
    }
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No notifications yet</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.markAllButton} 
          onPress={handleMarkAllAsRead}
        >
          <CheckCheck size={20} color={Colors.dark.primary} />
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={userNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item)}
          />
        )}
        ListEmptyComponent={renderEmptyState}
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllText: {
    color: Colors.dark.primary,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    color: Colors.dark.subtext,
    fontSize: 16,
  },
});