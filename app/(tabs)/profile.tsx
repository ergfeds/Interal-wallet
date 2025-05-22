import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  User, 
  Mail, 
  Shield, 
  LogOut, 
  Edit, 
  Camera, 
  ChevronRight,
  Key
} from 'lucide-react-native';
import useWalletStore from '@/store/walletStore';
import Colors from '@/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, logout, updateProfile } = useWalletStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            logout();
            router.replace('/login');
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleEditProfile = () => {
    setIsEditing(true);
  };
  
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    
    if (email && !isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await updateProfile({
        name,
        email
      });
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelEdit = () => {
    setName(currentUser?.name || '');
    setEmail(currentUser?.email || '');
    setIsEditing(false);
  };
  
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const getKycStatusColor = () => {
    if (!currentUser) return Colors.dark.subtext;
    
    switch (currentUser.kycStatus) {
      case 'verified':
        return '#00A86B';
      case 'pending':
        return '#FF9500';
      case 'unverified':
      default:
        return '#FF3B30';
    }
  };
  
  const getKycStatusText = () => {
    if (!currentUser) return 'Not Verified';
    
    switch (currentUser.kycStatus) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending Verification';
      case 'unverified':
      default:
        return 'Not Verified';
    }
  };
  
  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please log in to view your profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: currentUser.avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
          <TouchableOpacity style={styles.cameraButton}>
            <Camera size={20} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>
        
        {isEditing ? (
          <View style={styles.editForm}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.dark.subtext}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={Colors.dark.subtext}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.editButtons}>
              <TouchableOpacity 
                style={[styles.editButton, styles.cancelButton]}
                onPress={handleCancelEdit}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.editButton, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.dark.text} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.userName}>{currentUser.name}</Text>
            {currentUser.email && <Text style={styles.userEmail}>{currentUser.email}</Text>}
            
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={handleEditProfile}
            >
              <Edit size={16} color="#0052FF" />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/kyc')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuItemIcon, { backgroundColor: '#E6F9F1' }]}>
              <Shield size={20} color="#00A86B" />
            </View>
            <View>
              <Text style={styles.menuItemTitle}>Identity Verification</Text>
              <Text style={[styles.menuItemStatus, { color: getKycStatusColor() }]}>
                {getKycStatusText()}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={Colors.dark.subtext} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Change Password', 'This feature is coming soon.')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuItemIcon, { backgroundColor: '#E9F7FF' }]}>
              <Key size={20} color="#0066FF" />
            </View>
            <Text style={styles.menuItemTitle}>Change Password</Text>
          </View>
          <ChevronRight size={20} color={Colors.dark.subtext} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/support')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuItemIcon, { backgroundColor: '#FFF4E6' }]}>
              <Mail size={20} color="#FF9500" />
            </View>
            <Text style={styles.menuItemTitle}>Support Tickets</Text>
          </View>
          <ChevronRight size={20} color={Colors.dark.subtext} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <LogOut size={20} color="#FF3B30" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0052FF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.dark.background,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 12,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 82, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editProfileText: {
    color: '#0052FF',
    marginLeft: 4,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemTitle: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  menuItemStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 24,
  },
  editForm: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    padding: 16,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(108, 117, 125, 0.1)',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#0052FF',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: Colors.dark.text,
    fontWeight: '600',
  },
  saveButtonText: {
    color: Colors.dark.text,
    fontWeight: '600',
  },
});