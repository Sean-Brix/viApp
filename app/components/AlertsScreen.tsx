import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { AlertTriangle, ChevronLeft } from 'lucide-react-native';
import { studentService, adminService } from '../../src/services/api';

interface AlertsScreenProps {
  onBack?: () => void;
  userType: 'admin' | 'student';
}

export function AlertsScreen({ onBack, userType }: AlertsScreenProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      if (userType === 'admin') {
        const data = await adminService.getAllAlerts(1, 50);
        setAlerts(data);
      } else {
        const data = await studentService.getAlerts(1, 50);
        setAlerts(data);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAlerts();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return { bg: '#fee2e2', border: '#fecaca', text: '#991b1b' };
      case 'WARNING':
        return { bg: '#fef3c7', border: '#fde68a', text: '#92400e' };
      case 'INFO':
        return { bg: '#dbeafe', border: '#bfdbfe', text: '#1e40af' };
      default:
        return { bg: '#f3f4f6', border: '#e5e7eb', text: '#374151' };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const diff = Math.round((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
    return `${Math.round(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={styles.loadingText}>Loading alerts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Health Alerts</Text>
        <View style={styles.alertBadge}>
          <Text style={styles.alertBadgeText}>{alerts.length}</Text>
        </View>
      </View>

      {/* Alerts List */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.alertsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <AlertTriangle size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No alerts at this time</Text>
            <Text style={styles.emptySubtext}>
              {userType === 'admin' 
                ? 'All students are doing well!' 
                : 'You\'re doing great! Keep it up!'}
            </Text>
          </View>
        ) : (
          alerts.map((alert) => {
            const colors = getSeverityColor(alert.severity);
            return (
              <View
                key={alert.id}
                style={[
                  styles.alertCard,
                  { backgroundColor: colors.bg, borderColor: colors.border },
                ]}
              >
                <View style={styles.alertHeader}>
                  <AlertTriangle size={20} color={colors.text} />
                  <Text style={[styles.alertTime, { color: colors.text }]}>
                    {formatTime(alert.createdAt)}
                  </Text>
                </View>

                {userType === 'admin' && alert.student && (
                  <Text style={styles.studentName}>
                    {alert.student.firstName} {alert.student.lastName}
                  </Text>
                )}
                
                <Text style={styles.vitalSign}>{alert.type}</Text>
                <Text style={styles.message}>{alert.message}</Text>

                <View style={styles.alertFooter}>
                  <View style={[styles.severityBadge, { backgroundColor: colors.text }]}>
                    <Text style={styles.severityText}>{alert.severity} PRIORITY</Text>
                  </View>
                  <Text style={styles.resolvedText}>
                    {alert.resolved ? 'Resolved' : 'Active'}
                  </Text>
                </View>
              </View>
            );
          })
        )}
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
    justifyContent: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  alertBadge: {
    position: 'absolute',
    right: 16,
    top: 48,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  alertBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  alertsContainer: {
    padding: 16,
  },
  alertCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTime: {
    fontSize: 12,
    fontWeight: '600',
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  vitalSign: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  resolvedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
});
