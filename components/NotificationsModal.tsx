import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView,
  Alert
} from 'react-native';
import { X, CheckCheck } from 'lucide-react-native';
import Colors from '@/constants/colors';
import NotificationItem from './NotificationItem';
import useWalletStore from '@/store/walletStore';
import { Notification } from '@/types/wallet';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onNotificationPress: (notification: Notification) => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
  onNotificationPress,
}) => {
  const { currentUser, notifications, markAllNotificationsAsRead } = useWalletStore();
  
  if (!currentUser) return null;
  
  // Filter notifications for current user
  const userNotifications = notifications
    .filter(n => n.userId === currentUser.id)
    .sort((a, b) => b.timestamp - a.timestamp);
  
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.markAllButton} 
                onPress={handleMarkAllAsRead}
              >
                <CheckCheck size={20} color={Colors.dark.primary} />
                <Text style={styles.markAllText}>Mark all as read</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
          </View>
          
          <FlatList
            data={userNotifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NotificationItem
                notification={item}
                onPress={() => onNotificationPress(item)}
              />
            )}
            ListEmptyComponent={renderEmptyState}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  markAllText: {
    color: Colors.dark.primary,
    marginLeft: 4,
  },
  closeButton: {
    padding: 4,
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

export default NotificationsModal;