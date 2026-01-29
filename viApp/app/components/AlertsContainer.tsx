import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { adminService } from '../../src/services/api';
import type { Alert as BackendAlert } from '../../src/services/api/student.service';
import { AlertsScreen } from './AlertsScreen';
import { Alert } from '../types';
import { websocketService } from '../../src/services/websocket';

interface AlertsContainerProps {
  onBack?: () => void;
}

export function AlertsContainer({ onBack }: AlertsContainerProps) {
  const [alerts, setAlerts] = useState<BackendAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const response = await adminService.getAlerts({
        page: 1,
        limit: 100,
        acknowledged: false, // Only show unacknowledged alerts
        resolved: false, // Only show unresolved alerts
      });

      setAlerts(response.alerts);
    } catch (err: any) {
      console.error('Failed to fetch alerts:', err);
      setError(err.message || 'Failed to load alerts');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    
    // Set up 5-second polling for silent background updates
    const pollingInterval = setInterval(() => {
      console.log('🔄 Polling: Updating alerts silently...');
      fetchAlerts(true); // Silent update - no loading spinner
    }, 5000); // 5 seconds
    
    // Subscribe to real-time alerts
    const unsubscribeAlerts = websocketService.onAlert((data) => {
      console.log('🚨 Real-time alert in alerts container:', data);
      // Add new alert to the list
      if (data.alert) {
        setAlerts(prevAlerts => [data.alert, ...prevAlerts]);
      } else {
        // Reload all alerts if we don't have the full alert object
        fetchAlerts(true);
      }
    });
    
    return () => {
      clearInterval(pollingInterval);
      unsubscribeAlerts();
    };
  }, [fetchAlerts]);

  // Transform backend alerts to match AlertsScreen expected format
  const transformedAlerts: Alert[] = alerts.map(alert => {
    // Map backend severity to frontend severity
    const getSeverity = (backendSeverity: string): 'high' | 'medium' | 'low' => {
      switch (backendSeverity) {
        case 'CRITICAL':
        case 'HIGH':
          return 'high';
        case 'MEDIUM':
          return 'medium';
        case 'LOW':
        default:
          return 'low';
      }
    };

    return {
      id: alert.id,
      studentName: 'Student', // Would need to fetch student name from the vital or student data
      vitalSign: alert.type,
      message: alert.message,
      severity: getSeverity(alert.severity),
      timestamp: new Date(alert.createdAt),
    };
  });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#14b8a6" />
      </View>
    );
  }

  return (
    <AlertsScreen 
      alerts={transformedAlerts}
      onBack={onBack}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
});
