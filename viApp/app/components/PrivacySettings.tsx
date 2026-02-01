import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { ChevronLeft, Shield, Eye, Lock, Database, FileText, Trash2 } from 'lucide-react-native';

interface PrivacySettingsProps {
  onBack: () => void;
}

export function PrivacySettings({ onBack }: PrivacySettingsProps) {
  const [settings, setSettings] = useState({
    // Data Privacy
    shareAnalytics: false,
    crashReports: true,
    
    // Security
    biometricAuth: false,
    sessionTimeout: true,
    
    // Data Visibility
    showStudentDetails: true,
    showVitalHistory: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This will export all your account data. You will receive an email with a download link within 24 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Export',
          onPress: () => {
            // TODO: Implement data export
            Alert.alert('Success', 'Data export request submitted');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Enter your password to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm',
                  style: 'destructive',
                  onPress: () => {
                    // TODO: Implement account deletion
                    Alert.alert('Account deletion initiated');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const renderToggleItem = (
    label: string,
    description: string,
    key: keyof typeof settings,
    icon?: React.ReactNode
  ) => (
    <View style={styles.toggleItem}>
      <View style={styles.toggleContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.toggleText}>
          <Text style={styles.toggleLabel}>{label}</Text>
          <Text style={styles.toggleDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={() => handleToggle(key)}
        trackColor={{ false: '#d1d5db', true: '#99f6e4' }}
        thumbColor={settings[key] ? '#0d9488' : '#f3f4f6'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Data Privacy Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={20} color="#0d9488" />
            <Text style={styles.sectionTitle}>Data Privacy</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Control how your data is used and shared
          </Text>

          <View style={styles.card}>
            {renderToggleItem(
              'Share Usage Analytics',
              'Help improve the app by sharing anonymous usage data',
              'shareAnalytics',
              <Eye size={18} color="#3b82f6" />
            )}
            {renderToggleItem(
              'Crash Reports',
              'Automatically send crash reports to help fix issues',
              'crashReports',
              <FileText size={18} color="#f59e0b" />
            )}
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={20} color="#0d9488" />
            <Text style={styles.sectionTitle}>Security</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Enhanced security options for your account
          </Text>

          <View style={styles.card}>
            {renderToggleItem(
              'Biometric Authentication',
              'Use fingerprint or face recognition to log in',
              'biometricAuth',
              <Lock size={18} color="#8b5cf6" />
            )}
            {renderToggleItem(
              'Auto Session Timeout',
              'Automatically log out after 30 minutes of inactivity',
              'sessionTimeout',
              <Lock size={18} color="#6b7280" />
            )}
          </View>
        </View>

        {/* Data Visibility Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eye size={20} color="#0d9488" />
            <Text style={styles.sectionTitle}>Data Visibility</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Control what information is displayed
          </Text>

          <View style={styles.card}>
            {renderToggleItem(
              'Show Student Details',
              'Display detailed student information in lists',
              'showStudentDetails',
              <Eye size={18} color="#3b82f6" />
            )}
            {renderToggleItem(
              'Show Vital History',
              'Display historical vital signs data in graphs',
              'showVitalHistory',
              <Eye size={18} color="#3b82f6" />
            )}
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#0d9488" />
            <Text style={styles.sectionTitle}>Data Management</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Manage your personal data and account
          </Text>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleExportData}
            >
              <View style={styles.actionContent}>
                <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
                  <FileText size={18} color="#3b82f6" />
                </View>
                <View style={styles.actionText}>
                  <Text style={styles.actionLabel}>Export My Data</Text>
                  <Text style={styles.actionDescription}>
                    Download a copy of your account data
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleDeleteAccount}
            >
              <View style={styles.actionContent}>
                <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
                  <Trash2 size={18} color="#ef4444" />
                </View>
                <View style={styles.actionText}>
                  <Text style={[styles.actionLabel, { color: '#ef4444' }]}>
                    Delete Account
                  </Text>
                  <Text style={styles.actionDescription}>
                    Permanently delete your account and all data
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Policy Section */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Shield size={32} color="#0d9488" />
            <Text style={styles.infoTitle}>Your Privacy Matters</Text>
            <Text style={styles.infoText}>
              We are committed to protecting your privacy and securing your data. All student
              health information is encrypted and stored securely in compliance with data
              protection regulations.
            </Text>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>Read Full Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  toggleContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toggleText: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  actionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0d9488',
  },
  bottomSpacing: {
    height: 20,
  },
});
