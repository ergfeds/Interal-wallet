import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Bell, ArrowUpRight, ArrowDownLeft, DollarSign, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Notification } from '@/types/wallet';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
  const formatDate = (timestamp: number) => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    
    // If today, show time
    if (notificationDate.toDateString() === now.toDateString()) {
      return notificationDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // If within last 7 days, show day name
    const diffDays = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return notificationDate.toLocaleDateString('en-US', { weekday: 'short' });
    }
    
    // Otherwise show date
    return notificationDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const getIcon = () => {
    switch (notification.type) {
      case 'transaction':
        if (notification.title.includes('Sent') || notification.title.includes('Approved')) {
          return <ArrowUpRight size={20} color={Colors.dark.text} />;
        } else if (notification.title.includes('Received')) {
          return <ArrowDownLeft size={20} color={Colors.dark.text} />;
        } else if (notification.title.includes('Rejected')) {
          return <AlertCircle size={20} color={Colors.dark.error} />;
        } else {
          return <Bell size={20} color={Colors.dark.text} />;
        }
      case 'admin':
        return <DollarSign size={20} color={Colors.dark.primary} />;
      default:
        return <Bell size={20} color={Colors.dark.text} />;
    }
  };

  const handlePress = () => {
    try {
      onPress();
    } catch (error) {
      console.error('Error handling notification press:', error);
      Alert.alert('Error', 'Failed to process notification. Please try again.');
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        !notification.read && styles.unreadContainer
      ]}
      onPress={handlePress}
    >
      <View style={[
        styles.iconContainer,
        notification.type === 'admin' && styles.adminIconContainer,
        notification.type === 'system' && styles.systemIconContainer,
        notification.title.includes('Rejected') && styles.rejectedIconContainer
      ]}>
        {getIcon()}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
      </View>
      
      <Text style={styles.timestamp}>{formatDate(notification.timestamp)}</Text>
      
      {!notification.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    backgroundColor: Colors.dark.card,
  },
  unreadContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  adminIconContainer: {
    backgroundColor: 'rgba(247, 147, 26, 0.1)',
  },
  systemIconContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  rejectedIconContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.dark.subtext,
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.primary,
  },
});

export default NotificationItem;