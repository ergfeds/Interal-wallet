import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react-native';
import useWalletStore from '@/store/walletStore';
import Colors from '@/constants/colors';
import { trpcClient } from '@/lib/trpc';

export default function LoginScreen() {
  const router = useRouter();
  const { setCurrentUser } = useWalletStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adminTapCount, setAdminTapCount] = useState(0);
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Authenticate user
      const user = await trpcClient.users.login.mutate({
        email,
        password
      });
      
      // Set current user and navigate to dashboard
      setCurrentUser(user);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide more specific error messages based on error type
      if (error.message && error.message.includes('Network request failed')) {
        Alert.alert(
          'Connection Error', 
          'Unable to connect to the server. Please check your internet connection and make sure the server is running.\n\nIf you are running in development mode, please verify the API URL configuration in lib/trpc.ts.',
          [{ text: 'OK' }]
        );
      } else if (error.message && error.message.includes('Invalid email or password')) {
        Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
      } else {
        Alert.alert('Login Failed', error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Please contact support to reset your password.',
      [{ text: 'OK' }]
    );
  };
  
  const handleVersionPress = () => {
    setAdminTapCount(prev => prev + 1);
    
    if (adminTapCount === 4) {
      router.push('/admin-login');
      setAdminTapCount(0);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <LinearGradient
          colors={['#0052FF', '#0039B3']}
          style={styles.header}
        >
          <View style={styles.brandContainer}>
            <Text style={styles.title}>Agile Wallet</Text>
            <Text style={styles.subtitle}>Secure Digital Asset Management</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Login to Your Account</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <Mail size={20} color={Colors.dark.subtext} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={Colors.dark.subtext}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={20} color={Colors.dark.subtext} style={styles.inputIcon} />
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor={Colors.dark.subtext}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={Colors.dark.subtext} />
                ) : (
                  <Eye size={20} color={Colors.dark.subtext} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Login</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity onPress={handleVersionPress}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  formContainer: {
    padding: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    color: Colors.dark.text,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    color: Colors.dark.text,
  },
  eyeButton: {
    padding: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#0052FF',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#0052FF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: Colors.dark.subtext,
    marginRight: 4,
  },
  signupLink: {
    color: '#0052FF',
    fontWeight: 'bold',
  },
  versionText: {
    color: Colors.dark.subtext,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 16,
  }
});