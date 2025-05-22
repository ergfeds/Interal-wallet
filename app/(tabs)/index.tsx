import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Alert, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Dashboard from '@/components/Dashboard';
import useWalletStore from '@/store/walletStore';
import Colors from '@/constants/colors';
import { trpcClient } from '@/lib/trpc';

export default function HomeScreen() {
  const router = useRouter();
  const { initializeData, currentUser } = useWalletStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionTested, setConnectionTested] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in
        if (!currentUser) {
          // Redirect to login if no user is logged in
          router.replace('/login');
          return;
        }
        
        // Initialize data from API
        const result = await initializeData();
        
        if (!result.success) {
          console.warn('Failed to load data from API:', result.error);
          
          // Check if it's a network error
          if (result.error && result.error.message && result.error.message.includes('Network request failed')) {
            setError('Unable to connect to the server. Please check your network connection and API configuration.');
            setConnectionTested(false);
          } else {
            setError('Failed to load data. Please try again.');
          }
        }
      } catch (err) {
        console.error('Error initializing data:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const testConnection = async () => {
    try {
      setLoading(true);
      
      // Try to fetch the debug endpoint
      const response = await fetch(`http://localhost:3000/api/debug`);
      
      if (response.ok) {
        const data = await response.json();
        Alert.alert(
          'Connection Successful',
          `Successfully connected to the API server.\n\nServer time: ${data.timestamp}`,
          [{ text: 'OK' }]
        );
        setConnectionTested(true);
        
        // Try to initialize data again
        const result = await initializeData();
        if (result.success) {
          setError(null);
        }
      } else {
        Alert.alert(
          'Connection Failed',
          `Failed to connect to the API server. Status: ${response.status}`,
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('Connection test error:', err);
      Alert.alert(
        'Connection Failed',
        `Failed to connect to the API server. Please check your network connection and API configuration in lib/trpc.ts.`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066FF" />
        <Text style={styles.loadingText}>Loading Agile Wallet...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>
          Please check your connection and API configuration.
        </Text>
        
        {!connectionTested && (
          <TouchableOpacity 
            style={styles.testButton}
            onPress={testConnection}
          >
            <Text style={styles.testButtonText}>Test Connection</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            initializeData().finally(() => setLoading(false));
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Agile Wallet',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Dashboard />
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
    marginTop: 16,
    fontSize: 16,
    color: Colors.dark.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#0052FF',
    borderRadius: 8,
    padding: 12,
    width: '80%',
    alignItems: 'center',
    marginBottom: 12,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#6c757d',
    borderRadius: 8,
    padding: 12,
    width: '80%',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});