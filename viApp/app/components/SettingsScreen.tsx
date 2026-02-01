import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ChevronRight, LogOut, User, Bell, Shield, Info } from 'lucide-react-native';

interface SettingsScreenProps {
  onLogout: () => void;
  onEditProfile?: () => void;
  onNotifications?: () => void;
  onPrivacy?: () => void;
  onAbout?: () => void;
}

export function SettingsScreen({ onLogout, onEditProfile, onNotifications, onPrivacy, onAbout }: SettingsScreenProps) {
  const settingsItems = [
    { icon: User, label: 'Profile Settings', description: 'Manage your account', action: onEditProfile },
    { icon: Bell, label: 'Notifications', description: 'Alert preferences', action: onNotifications },
    { icon: Shield, label: 'Privacy', description: 'Data and security', action: onPrivacy },
    { icon: Info, label: 'About', description: 'App information', action: onAbout },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Settings Items */}
        <View style={styles.section}>
          {settingsItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.settingItem}
                activeOpacity={0.7}
                onPress={item.action}
                disabled={!item.action}
              >
                <View style={styles.iconContainer}>
                  <Icon size={22} color="#14b8a6" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* App Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>ViApp</Text>
          <Text style={styles.infoText}>SFMNHS Health Monitoring System</Text>
          <Text style={styles.infoVersion}>Version 1.0.0</Text>
          <Text style={styles.infoCopyright}>© 2026 SFMNHS. All rights reserved.</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
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
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  infoSection: {
    alignItems: 'center',
    padding: 32,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#14b8a6',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoVersion: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 8,
  },
  infoCopyright: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});
