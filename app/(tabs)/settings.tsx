import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { ChevronRight, Shield, Bell, Eye, HelpCircle, Info } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function SettingsScreen() {
  const [notifications, setNotifications] = React.useState(true);
  const [biometrics, setBiometrics] = React.useState(false);
  
  const toggleNotifications = () => setNotifications(previousState => !previousState);
  const toggleBiometrics = () => setBiometrics(previousState => !previousState);
  
  const handleAbout = () => {
    Alert.alert(
      'About Crypto Wallet',
      'Version 1.0.0\n\nThis is a demo wallet application with internal transactions. No real blockchain is used.',
      [{ text: 'OK' }]
    );
  };
  
  const handleHelp = () => {
    Alert.alert(
      'Help & Support',
      'For any issues or questions, please contact our support team at support@cryptowallet.example',
      [{ text: 'OK' }]
    );
  };
  
  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'This app collects minimal user data and does not share it with third parties. All transactions are stored locally.',
      [{ text: 'OK' }]
    );
  };
  
  const handleTerms = () => {
    Alert.alert(
      'Terms of Service',
      'By using this app, you agree to our terms of service. This is a demo application and should not be used for real financial transactions.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Bell size={20} color={Colors.dark.text} style={styles.settingIcon} />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
            thumbColor={Colors.dark.text}
            ios_backgroundColor={Colors.dark.border}
            onValueChange={toggleNotifications}
            value={notifications}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Eye size={20} color={Colors.dark.text} style={styles.settingIcon} />
            <Text style={styles.settingText}>Biometric Authentication</Text>
          </View>
          <Switch
            trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
            thumbColor={Colors.dark.text}
            ios_backgroundColor={Colors.dark.border}
            onValueChange={toggleBiometrics}
            value={biometrics}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Shield size={20} color={Colors.dark.text} style={styles.settingIcon} />
            <Text style={styles.settingText}>Change PIN</Text>
          </View>
          <ChevronRight size={20} color={Colors.dark.subtext} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Shield size={20} color={Colors.dark.text} style={styles.settingIcon} />
            <Text style={styles.settingText}>Recovery Phrase</Text>
          </View>
          <ChevronRight size={20} color={Colors.dark.subtext} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
          <View style={styles.settingLeft}>
            <Info size={20} color={Colors.dark.text} style={styles.settingIcon} />
            <Text style={styles.settingText}>About Crypto Wallet</Text>
          </View>
          <ChevronRight size={20} color={Colors.dark.subtext} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleHelp}>
          <View style={styles.settingLeft}>
            <HelpCircle size={20} color={Colors.dark.text} style={styles.settingIcon} />
            <Text style={styles.settingText}>Help & Support</Text>
          </View>
          <ChevronRight size={20} color={Colors.dark.subtext} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={handlePrivacy}>
          <View style={styles.settingLeft}>
            <Shield size={20} color={Colors.dark.text} style={styles.settingIcon} />
            <Text style={styles.settingText}>Privacy Policy</Text>
          </View>
          <ChevronRight size={20} color={Colors.dark.subtext} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleTerms}>
          <View style={styles.settingLeft}>
            <Shield size={20} color={Colors.dark.text} style={styles.settingIcon} />
            <Text style={styles.settingText}>Terms of Service</Text>
          </View>
          <ChevronRight size={20} color={Colors.dark.subtext} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: Colors.dark.text,
  },
});