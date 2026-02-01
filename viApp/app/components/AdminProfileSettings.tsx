import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, User, Mail, Lock, Save } from 'lucide-react-native';
import { adminService } from '../../src/services/api';

interface AdminProfileSettingsProps {
  onBack: () => void;
}

export function AdminProfileSettings({ onBack }: AdminProfileSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // TODO: Implement backend API when available
      // const data = await adminService.getProfile();
      
      // Mock data for now
      const data = {
        username: 'admin',
        email: 'admin@sfmnhs.edu.ph',
        firstName: 'Admin',
        lastName: 'User',
      };
      
      setProfile({
        username: data.username || '',
        email: data.email || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      // TODO: Implement backend API when available
      // await adminService.updateProfile({
      //   firstName: profile.firstName.trim(),
      //   lastName: profile.lastName.trim(),
      //   email: profile.email.trim(),
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Validation Error', 'Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      Alert.alert('Validation Error', 'New password must be at least 8 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Validation Error', 'New passwords do not match');
      return;
    }

    try {
      setSaving(true);
      // TODO: Implement backend API when available
      // await adminService.changePassword({
      //   currentPassword: passwordData.currentPassword,
      //   newPassword: passwordData.newPassword,
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Alert.alert('Success', 'Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Failed to change password:', error);
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#0d9488" />
            <Text style={styles.sectionTitle}>Profile Information</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={profile.username}
                editable={false}
              />
              <Text style={styles.helperText}>Username cannot be changed</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                First Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={profile.firstName}
                onChangeText={(value) => setProfile({ ...profile, firstName: value })}
                placeholder="Enter first name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Last Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={profile.lastName}
                onChangeText={(value) => setProfile({ ...profile, lastName: value })}
                placeholder="Enter last name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={profile.email}
                onChangeText={(value) => setProfile({ ...profile, email: value })}
                placeholder="Enter email"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Save size={20} color="#ffffff" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Change Password Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={20} color="#0d9488" />
            <Text style={styles.sectionTitle}>Change Password</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Current Password <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={passwordData.currentPassword}
                onChangeText={(value) => setPasswordData({ ...passwordData, currentPassword: value })}
                placeholder="Enter current password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                New Password <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={passwordData.newPassword}
                onChangeText={(value) => setPasswordData({ ...passwordData, newPassword: value })}
                placeholder="Enter new password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
              />
              <Text style={styles.helperText}>Minimum 8 characters</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Confirm New Password <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={passwordData.confirmPassword}
                onChangeText={(value) => setPasswordData({ ...passwordData, confirmPassword: value })}
                placeholder="Confirm new password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: '#f59e0b' }, saving && styles.saveButtonDisabled]}
              onPress={handleChangePassword}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Lock size={20} color="#ffffff" />
                  <Text style={styles.saveButtonText}>Change Password</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d9488',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d9488',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
