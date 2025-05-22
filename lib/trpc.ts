import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { AppRouter } from '@/backend/trpc/app-router';
import { Platform } from 'react-native';

// Create a React Query client
export const trpc = createTRPCReact<AppRouter>();

// =====================================================================
// IMPORTANT: CONFIGURE YOUR API URL HERE
// =====================================================================
// For mobile development, replace this with your computer's local IP address
// Example: 192.168.1.100, 10.0.0.4, etc.
// You can find your IP address by:
// - On Windows: Run 'ipconfig' in Command Prompt
// - On Mac/Linux: Run 'ifconfig' in Terminal
// - Or visit https://whatismyipaddress.com/ on your development machine
// =====================================================================
const LOCAL_IP_ADDRESS = '10.0.2.2'; // Default for Android emulator
const API_PORT = '3000';             // Default Expo development server port

// Determine the base URL based on platform
const getBaseUrl = () => {
  // For web, use relative URL which will work with same-origin requests
  if (Platform.OS === 'web') {
    return '/api/trpc';
  }
  
  // For mobile in development, use the local IP address
  // Android emulator: 10.0.2.2 points to host machine's localhost
  // iOS simulator: localhost or 127.0.0.1 works
  if (Platform.OS === 'android') {
    return `http://${LOCAL_IP_ADDRESS}:${API_PORT}/api/trpc`;
  } else {
    // iOS
    return `http://localhost:${API_PORT}/api/trpc`;
  }
};

// Create a vanilla client for use outside of React components
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getBaseUrl(),
      // Add fetch options to handle CORS and other potential issues
      fetch: (url, options) => {
        console.log(`Making request to: ${url}`);
        return fetch(url, {
          ...options,
          credentials: 'include',
          headers: {
            ...options?.headers,
            'Content-Type': 'application/json',
          },
        })
        .then(response => {
          if (!response.ok) {
            console.error(`API response error: ${response.status} ${response.statusText}`);
          }
          return response;
        })
        .catch(err => {
          console.error('Network error during fetch:', err);
          // Log more details about the error
          if (err.message) {
            console.error('Error message:', err.message);
          }
          throw err;
        });
      },
    }),
  ],
});