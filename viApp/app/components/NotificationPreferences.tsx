import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, Bell, Activity, AlertTriangle, TrendingUp } from 'lucide-react-native';

interface NotificationPreferencesProps {
  onBack: () => void;
}

export function NotificationPreferences({ onBack }: NotificationPreferencesProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    // Alert Notifications
    criticalAlerts: true,
    highAlerts: true,
    mediumAlerts: true,
    lowAlerts: false,
    
    // Vital Signs Notifications
    abnormalVitals: true,
    vitalTrends: false,
    
    // System Notifications
    deviceStatus: true,
    studentUpdates: true,
    systemAlerts: true,
    
    // Notification Channels
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: false,
  });

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      // TODO: Save to backend when API is available
      // await adminService.updateNotificationPreferences(preferences);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Alert.alert('Success', 'Notification preferences saved successfully');
    } catch (error: any) {
      console.error('Failed to save preferences:', error);
      Alert.alert('Error', error.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const renderToggleItem = (
    label: string,
    description: string,
    key: keyof typeof preferences,
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
        value={preferences[key]}
        onValueChange={() => handleToggle(key)}
        trackColor={{ false: '#d1d5db', true: '#99f6e4' }}
        thumbColor={preferences[key] ? '#0d9488' : '#f3f4f6'}
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
        <Text style={styles.headerTitle}>Notification Preferences</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Alert Priority Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertTriangle size={20} color="#0d9488" />
            <Text style={styles.sectionTitle}>Alert Priority</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Choose which alert levels you want to receive notifications for
          </Text>

          <View style={styles.card}>
            {renderToggleItem(
              'Critical Alerts',
              'Life-threatening conditions requiring immediate attention',
              'criticalAlerts',
              <AlertTriangle size={18} color="#ef4444" />
            )}
            {renderToggleItem(
              'High Priority Alerts',
              'Serious conditions requiring prompt attention',
              'highAlerts',
              <AlertTriangle size={18} color="#f59e0b" />
            )}
            {renderToggleItem(
              'Medium Priority Alerts',
              'Moderate concerns that should be monitored',
              'mediumAlerts',
              <AlertTriangle size={18} color="#eab308" />
            )}
            {renderToggleItem(
              'Low Priority Alerts',
              'Minor concerns for informational purposes',
              'lowAlerts',
              <AlertTriangle size={18} color="#3b82f6" />
            )}
          </View>
        </View>

        {/* Vital Signs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color="#0d9488" />
            <Text style={styles.sectionTitle}>Vital Signs</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Get notified about student vital signs monitoring
          </Text>

          <View style={styles.card}>
            {renderToggleItem(
              'Abnormal Vital Signs',
              'Receive alerts when vital signs are outside normal range',
              'abnormalVitals',
              <Activity size={18} color="#ef4444" />
            )}
            {renderToggleItem(
              'Vital Trends',
              'Get notified about concerning vital sign trends',
              'vitalTrends',
              <TrendingUp size={18} color="#3b82f6" />
            )}
          </View>
        </View>

        {/* System Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color="#0d9488" />
            <Text style={styles.sectionTitle}>System Notifications</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Stay informed about system events and updates
          </Text>

          <View style={styles.card}>
            {renderToggleItem(
              'Device Status',
              'Notifications about device connectivity and issues',
              'deviceStatus'
            )}
            {renderToggleItem(
              'Student Updates',
              'Notifications when student information is updated',
              'studentUpdates'
            )}
            {renderToggleItem(
              'System Alerts',
              'Important system maintenance and updates',
              'systemAlerts'
            )}
          </View>
        </View>

        {/* Notification Channels Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color="#0d9488" />
            <Text style={styles.sectionTitle}>Notification Channels</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Choose how you want to receive notifications
          </Text>

          <View style={styles.card}>
            {renderToggleItem(
              'Push Notifications',
              'Receive notifications on this device',
              'pushNotifications'
            )}
            {renderToggleItem(
              'Email Notifications',
              'Receive notifications via email',
              'emailNotifications'
            )}
            {renderToggleItem(
              'SMS Notifications',
              'Receive critical alerts via text message',
              'smsNotifications'
            )}
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSavePreferences}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Bell size={20} color="#ffffff" />
                <Text style={styles.saveButtonText}>Save Preferences</Text>
              </>
            )}
          </TouchableOpacity>
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d9488',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  bottomSpacing: {
    height: 20,
  },
});
