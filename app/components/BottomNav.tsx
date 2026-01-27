import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Bell, TrendingUp, Settings } from 'lucide-react-native';
import { Screen } from '../types';

interface BottomNavProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  alertCount: number;
}

export function BottomNav({ activeScreen, onNavigate, alertCount }: BottomNavProps) {
  const navItems = [
    { screen: 'home' as Screen, icon: Home, label: 'Home' },
    { screen: 'alerts' as Screen, icon: Bell, label: 'Alerts', badge: alertCount },
    { screen: 'history' as Screen, icon: TrendingUp, label: 'History' },
    { screen: 'settings' as Screen, icon: Settings, label: 'Settings' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeScreen === item.screen;

        return (
          <TouchableOpacity
            key={item.screen}
            style={styles.navItem}
            onPress={() => onNavigate(item.screen)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Icon
                size={24}
                color={isActive ? '#14b8a6' : '#9ca3af'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {item.badge && item.badge > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  labelActive: {
    color: '#14b8a6',
    fontWeight: '600',
  },
});
