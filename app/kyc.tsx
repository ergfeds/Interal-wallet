import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react-native';
import useWalletStore from '@/store/walletStore';
import Colors from '@/constants/colors';

export default function KycScreen() {
  const router = useRouter();
  const { currentUser, submitKyc } = useWalletStore();
  
  const [fullName, setFullName] = useState(currentUser?.kycData?.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.kycData?.dateOfBirth || '');
  const [address, setAddress] = useState(currentUser?.kycData?.address || '');
  const [idType, setIdType] = useState<'passport' | 'drivers_license' | 'national_id'>(
    currentUser?.kycData?.idType || 'passport'
  );
  const [idNumber, setIdNumber] = useState(currentUser?.kycData?.idNumber || '');
  
  const [idFrontImage, setIdFrontImage] = useState<string | undefined>(
    currentUser?.kycData?.idFrontImage
  );
  const [idBackImage, setIdBackImage] = useState<string | undefined>(
    currentUser?.kycData?.idBackImage
  );
  const [selfieImage, setSelfieImage] = useState<string | undefined>(
    currentUser?.kycData?.selfieImage
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  const pickImage = async (setter: React.Dispatch<React.SetStateAction<string | undefined>>) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setter(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  
  const handleSubmit = () => {
    // Validate form
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    
    if (!dateOfBirth.trim()) {
      Alert.alert('Error', 'Please enter your date of birth');
      return;
    }
    
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your address');
      return;
    }
    
    if (!idNumber.trim()) {
      Alert.alert('Error', 'Please enter your ID number');
      return;
    }
    
    // In a real app, we would validate the date format and other fields more thoroughly
    
    // For demo purposes, we'll skip the image validation
    // In a real app, we would require all images to be uploaded
    
    setIsSubmitting(true);
    
    // Submit KYC data
    submitKyc(currentUser.id, {
      fullName,
      dateOfBirth,
      address,
      idType,
      idNumber,
      idFrontImage: idFrontImage || '',
      idBackImage: idBackImage || '',
      selfieImage: selfieImage || '',
    });
    
    setIsSubmitting(false);
    
    Alert.alert(
      'KYC Submitted',
      'Your KYC verification has been submitted and is pending review.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };
  
  const getKycStatusIcon = () => {
    switch (currentUser.kycStatus) {
      case 'verified':
        return <CheckCircle size={20} color={Colors.dark.success} />;
      case 'pending':
        return <AlertTriangle size={20} color={Colors.dark.pending} />;
      case 'unverified':
        return <XCircle size={20} color={Colors.dark.error} />;
      default:
        return <AlertTriangle size={20} color={Colors.dark.subtext} />;
    }
  };
  
  const getKycStatusText = () => {
    switch (currentUser.kycStatus) {
      case 'verified':
        return 'Your KYC verification has been approved.';
      case 'pending':
        return 'Your KYC verification is pending approval.';
      case 'unverified':
        return `Your KYC verification was rejected. Reason: ${currentUser.kycData?.rejectionReason || 'No reason provided'}`;
      default:
        return 'Please complete the KYC verification form below.';
    }
  };
  
  const getKycStatusColor = () => {
    switch (currentUser.kycStatus) {
      case 'verified':
        return Colors.dark.success;
      case 'pending':
        return Colors.dark.pending;
      case 'unverified':
        return Colors.dark.error;
      default:
        return Colors.dark.subtext;
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>KYC Verification</Text>
          <Text style={styles.subtitle}>
            Complete the verification process to enable sending transactions
          </Text>
        </View>
        
        <View style={[styles.statusContainer, { backgroundColor: `${getKycStatusColor()}20` }]}>
          {getKycStatusIcon()}
          <Text style={[styles.statusText, { color: getKycStatusColor() }]}>
            {getKycStatusText()}
          </Text>
        </View>
        
        {currentUser.kycStatus !== 'verified' && (
          <>
            <View style={styles.infoContainer}>
              <Info size={20} color={Colors.dark.primary} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                KYC (Know Your Customer) verification is required to comply with regulations and prevent fraud.
                Your information will be securely stored and only used for verification purposes.
              </Text>
            </View>
            
            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full legal name"
                  placeholderTextColor={Colors.dark.subtext}
                  value={fullName}
                  onChangeText={setFullName}
                  editable={currentUser.kycStatus !== 'pending'}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.dark.subtext}
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  editable={currentUser.kycStatus !== 'pending'}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Enter your full address"
                  placeholderTextColor={Colors.dark.subtext}
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  editable={currentUser.kycStatus !== 'pending'}
                />
              </View>
              
              <Text style={styles.sectionTitle}>ID Verification</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>ID Type</Text>
                <View style={styles.idTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.idTypeButton,
                      idType === 'passport' && styles.selectedIdTypeButton
                    ]}
                    onPress={() => setIdType('passport')}
                    disabled={currentUser.kycStatus === 'pending'}
                  >
                    <Text style={[
                      styles.idTypeButtonText,
                      idType === 'passport' && styles.selectedIdTypeButtonText
                    ]}>
                      Passport
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.idTypeButton,
                      idType === 'drivers_license' && styles.selectedIdTypeButton
                    ]}
                    onPress={() => setIdType('drivers_license')}
                    disabled={currentUser.kycStatus === 'pending'}
                  >
                    <Text style={[
                      styles.idTypeButtonText,
                      idType === 'drivers_license' && styles.selectedIdTypeButtonText
                    ]}>
                      Driver's License
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.idTypeButton,
                      idType === 'national_id' && styles.selectedIdTypeButton
                    ]}
                    onPress={() => setIdType('national_id')}
                    disabled={currentUser.kycStatus === 'pending'}
                  >
                    <Text style={[
                      styles.idTypeButtonText,
                      idType === 'national_id' && styles.selectedIdTypeButtonText
                    ]}>
                      National ID
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>ID Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your ID number"
                  placeholderTextColor={Colors.dark.subtext}
                  value={idNumber}
                  onChangeText={setIdNumber}
                  editable={currentUser.kycStatus !== 'pending'}
                />
              </View>
              
              <Text style={styles.sectionTitle}>Upload Documents</Text>
              
              <View style={styles.uploadContainer}>
                <Text style={styles.uploadLabel}>ID Front Side</Text>
                {idFrontImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: idFrontImage }} style={styles.imagePreview} />
                    {currentUser.kycStatus !== 'pending' && (
                      <TouchableOpacity
                        style={styles.changeImageButton}
                        onPress={() => pickImage(setIdFrontImage)}
                      >
                        <Text style={styles.changeImageButtonText}>Change</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => pickImage(setIdFrontImage)}
                    disabled={currentUser.kycStatus === 'pending'}
                  >
                    <Upload size={24} color={Colors.dark.text} />
                    <Text style={styles.uploadButtonText}>Upload Image</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.uploadContainer}>
                <Text style={styles.uploadLabel}>ID Back Side</Text>
                {idBackImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: idBackImage }} style={styles.imagePreview} />
                    {currentUser.kycStatus !== 'pending' && (
                      <TouchableOpacity
                        style={styles.changeImageButton}
                        onPress={() => pickImage(setIdBackImage)}
                      >
                        <Text style={styles.changeImageButtonText}>Change</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => pickImage(setIdBackImage)}
                    disabled={currentUser.kycStatus === 'pending'}
                  >
                    <Upload size={24} color={Colors.dark.text} />
                    <Text style={styles.uploadButtonText}>Upload Image</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.uploadContainer}>
                <Text style={styles.uploadLabel}>Selfie with ID</Text>
                {selfieImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: selfieImage }} style={styles.imagePreview} />
                    {currentUser.kycStatus !== 'pending' && (
                      <TouchableOpacity
                        style={styles.changeImageButton}
                        onPress={() => pickImage(setSelfieImage)}
                      >
                        <Text style={styles.changeImageButtonText}>Change</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => pickImage(setSelfieImage)}
                    disabled={currentUser.kycStatus === 'pending'}
                  >
                    <Camera size={24} color={Colors.dark.text} />
                    <Text style={styles.uploadButtonText}>Upload Selfie</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {(currentUser.kycStatus === 'unverified' || !currentUser.kycData) && (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Submitting...' : 'Submit KYC Verification'}
                  </Text>
                </TouchableOpacity>
              )}
              
              {currentUser.kycStatus === 'pending' && (
                <View style={styles.pendingContainer}>
                  <AlertTriangle size={20} color={Colors.dark.pending} />
                  <Text style={styles.pendingText}>
                    Your KYC verification is pending approval. You will be notified once it's reviewed.
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
        
        {currentUser.kycStatus === 'verified' && (
          <View style={styles.verifiedContainer}>
            <CheckCircle size={60} color={Colors.dark.success} style={styles.verifiedIcon} />
            <Text style={styles.verifiedTitle}>KYC Verified</Text>
            <Text style={styles.verifiedText}>
              Your identity has been verified. You can now send transactions.
            </Text>
            
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Back to Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.subtext,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  statusText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.dark.primary,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.text,
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
    marginTop: 24,
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
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    fontSize: 16,
    color: Colors.dark.text,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  idTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  idTypeButton: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedIdTypeButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: Colors.dark.primary,
  },
  idTypeButtonText: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  selectedIdTypeButtonText: {
    color: Colors.dark.primary,
    fontWeight: '500',
  },
  uploadContainer: {
    marginBottom: 24,
  },
  uploadLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 8,
  },
  uploadButton: {
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    color: Colors.dark.text,
    marginTop: 8,
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  changeImageButtonText: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  pendingContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  pendingText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: Colors.dark.pending,
  },
  verifiedContainer: {
    alignItems: 'center',
    padding: 32,
  },
  verifiedIcon: {
    marginBottom: 16,
  },
  verifiedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.success,
    marginBottom: 16,
  },
  verifiedText: {
    fontSize: 16,
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
});