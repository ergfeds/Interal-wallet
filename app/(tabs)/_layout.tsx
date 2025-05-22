import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Repeat, User, Settings, Bell } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useRouter } from 'expo-router';
import useWalletStore from '@/store/walletStore';
import NotificationBadge from '@/components/NotificationBadge';

export default function TabLayout() {
  const router = useRouter();
  const { currentUser, initializeData } = useWalletStore();
  
  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    
    // Initialize data
    initializeData();
  }, [currentUser]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0052FF',
        tabBarInactiveTintColor: '#6c757d',
        tabBarStyle: {
          backgroundColor: Colors.dark.card,
          borderTopColor: Colors.dark.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: Colors.dark.background,
        },
        headerTintColor: Colors.dark.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          headerRight: () => (
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/notifications')}
            >
              <NotificationBadge />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarLabel: 'Transactions',
          tabBarIcon: ({ color }) => <Repeat size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  notificationButton: {
    marginRight: 16,
  },
});