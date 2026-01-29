import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Activity, Heart, Thermometer, Wind, AlertTriangle } from 'lucide-react-native';
import { studentService } from '../../src/services/api';
import { websocketService } from '../../src/services/websocket';

interface StudentDashboardProps {
  onNavigate: (screen: string) => void;
}

export function StudentDashboard({ onNavigate }: StudentDashboardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [latestVitals, setLatestVitals] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();

    // Subscribe to real-time vital signs updates
    const unsubscribeVitals = websocketService.onVitalSignsUpdate((data) => {
      console.log('📊 Real-time vital signs update for student dashboard');
      
      // Update latest vitals with new data
      setLatestVitals(data.data);
    });

    // Subscribe to real-time alerts
    const unsubscribeAlerts = websocketService.onAlert((data) => {
      console.log('🚨 Real-time alert for student dashboard');
      
      // Add new alert to the list
      setAlerts(prevAlerts => [data.alert, ...prevAlerts.slice(0, 4)]); // Keep only 5 alerts
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeVitals();
      unsubscribeAlerts();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load profile
      try {
        const profileData = await studentService.getProfile();
        setProfile(profileData);
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
      
      // Load latest vitals (may fail if no device connected)
      try {
        const vitalsData = await studentService.getLatestVitals();
        setLatestVitals(vitalsData);
      } catch (error) {
        console.error('Failed to load vitals:', error);
        // Vitals will be null, showing "no vitals recorded" message
      }
      
      // Load alerts (may fail if no alerts exist)
      try {
        const alertsData = await studentService.getAlerts({ page: 1, limit: 5 });
        setAlerts(alertsData.alerts || []);
      } catch (error) {
        console.error('Failed to load alerts:', error);
        // Alerts will be empty array
        setAlerts([]);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NORMAL': return '#16a34a';
      case 'WARNING': return '#f59e0b';
      case 'CRITICAL': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'NORMAL': return '#dcfce7';
      case 'WARNING': return '#fef3c7';
      case 'CRITICAL': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  // Check if data is fresh (within 30 seconds)
  const getDataFreshness = (timestamp: string) => {
    const now = Date.now();
    const vitalTime = new Date(timestamp).getTime();
    const diffMs = now - vitalTime;
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec <= 30) {
      return {
        isFresh: true,
        label: 'Live',
        color: '#16a34a',
        bgColor: '#dcfce7',
        timeAgo: `Updated ${diffSec}s ago`
      };
    } else if (diffSec <= 60) {
      return {
        isFresh: false,
        label: 'Recent',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        timeAgo: `Updated ${diffSec}s ago`
      };
    } else {
      const diffMin = Math.floor(diffSec / 60);
      return {
        isFresh: false,
        label: 'Outdated',
        color: '#dc2626',
        bgColor: '#fee2e2',
        timeAgo: `Last update: ${diffMin}m ago`
      };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={styles.loadingText}>Loading your health data...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {profile?.firstName}!</Text>
          <Text style={styles.subgreeting}>Here's your health status today</Text>
        </View>
      </View>

      {/* Overall Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusIcon, { 
            backgroundColor: getStatusBgColor(profile?.status || 'STABLE') 
          }]}>
            <Activity size={32} color={getStatusColor(profile?.status || 'STABLE')} />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Overall Health Status</Text>
            <Text style={[styles.statusValue, { 
              color: getStatusColor(profile?.status || 'STABLE') 
            }]}>
              {profile?.status || 'STABLE'}
            </Text>
          </View>
        </View>
      </View>

      {/* Latest Vitals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Vitals</Text>
          <TouchableOpacity onPress={() => onNavigate('vitalsHistory')}>
            <Text style={styles.viewAllText}>View Statistics</Text>
          </TouchableOpacity>
        </View>

        {latestVitals ? (
          <>
            {/* Data Freshness Indicator */}
            {(() => {
              const freshness = getDataFreshness(latestVitals.timestamp);
              return (
                <View style={[styles.freshnessBadge, { backgroundColor: freshness.bgColor }]}>
                  <View style={[styles.freshnessDot, { backgroundColor: freshness.color }]} />
                  <Text style={[styles.freshnessLabel, { color: freshness.color }]}>
                    {freshness.label}
                  </Text>
                  <Text style={[styles.freshnessTime, { color: freshness.color }]}>
                    • {freshness.timeAgo}
                  </Text>
                </View>
              );
            })()}

            <View style={styles.vitalsGrid}>
              {/* Heart Rate */}
              <View style={styles.vitalCard}>
                <View style={[styles.vitalIcon, { backgroundColor: '#fee2e2' }]}>
                  <Heart size={24} color="#dc2626" />
                </View>
                <View style={styles.vitalInfo}>
                  <Text style={styles.vitalLabel}>Heart Rate</Text>
                  <View style={styles.vitalValueContainer}>
                    <Text style={styles.vitalValue}>{latestVitals.heartRate}</Text>
                    <Text style={styles.vitalUnit}>bpm</Text>
                  </View>
                  <View style={[styles.vitalStatus, { 
                    backgroundColor: getStatusBgColor(latestVitals.heartRateStatus) 
                  }]}>
                    <Text style={[styles.vitalStatusText, { 
                      color: getStatusColor(latestVitals.heartRateStatus) 
                    }]}>
                      {latestVitals.heartRateStatus}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Temperature */}
              <View style={styles.vitalCard}>
                <View style={[styles.vitalIcon, { backgroundColor: '#fef3c7' }]}>
                  <Thermometer size={24} color="#f59e0b" />
                </View>
                <View style={styles.vitalInfo}>
                  <Text style={styles.vitalLabel}>Temperature</Text>
                  <View style={styles.vitalValueContainer}>
                    <Text style={styles.vitalValue}>{latestVitals.temperature}</Text>
                    <Text style={styles.vitalUnit}>°C</Text>
                  </View>
                  <View style={[styles.vitalStatus, { 
                    backgroundColor: getStatusBgColor(latestVitals.temperatureStatus) 
                  }]}>
                    <Text style={[styles.vitalStatusText, { 
                      color: getStatusColor(latestVitals.temperatureStatus) 
                    }]}>
                      {latestVitals.temperatureStatus}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.vitalsGrid}>
              {/* SpO2 */}
              {latestVitals.spO2 && (
                <View style={styles.vitalCard}>
                  <View style={[styles.vitalIcon, { backgroundColor: '#dbeafe' }]}>
                    <Wind size={24} color="#3b82f6" />
                  </View>
                  <View style={styles.vitalInfo}>
                    <Text style={styles.vitalLabel}>SpO2</Text>
                    <View style={styles.vitalValueContainer}>
                      <Text style={styles.vitalValue}>{latestVitals.spO2}</Text>
                      <Text style={styles.vitalUnit}>%</Text>
                    </View>
                    <View style={[styles.vitalStatus, { 
                      backgroundColor: getStatusBgColor(latestVitals.spO2Status) 
                    }]}>
                      <Text style={[styles.vitalStatusText, { 
                        color: getStatusColor(latestVitals.spO2Status) 
                      }]}>
                        {latestVitals.spO2Status}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Blood Pressure */}
              {latestVitals.bloodPressureSystolic && (
                <View style={styles.vitalCard}>
                  <View style={[styles.vitalIcon, { backgroundColor: '#e0e7ff' }]}>
                    <Activity size={24} color="#6366f1" />
                  </View>
                  <View style={styles.vitalInfo}>
                    <Text style={styles.vitalLabel}>Blood Pressure</Text>
                    <View style={styles.vitalValueContainer}>
                      <Text style={styles.vitalValue}>
                        {latestVitals.bloodPressureSystolic}/{latestVitals.bloodPressureDiastolic}
                      </Text>
                      <Text style={styles.vitalUnit}>mmHg</Text>
                    </View>
                    <View style={[styles.vitalStatus, { 
                      backgroundColor: getStatusBgColor(latestVitals.bloodPressureStatus) 
                    }]}>
                      <Text style={[styles.vitalStatusText, { 
                        color: getStatusColor(latestVitals.bloodPressureStatus) 
                      }]}>
                        {latestVitals.bloodPressureStatus}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.lastUpdated}>
              <Text style={styles.lastUpdatedText}>
                Last updated: {new Date(latestVitals.timestamp).toLocaleString()}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Activity size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>No vitals recorded yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Device sensor will send vitals data via HTTP
            </Text>
          </View>
        )}
      </View>

      {/* Health Alerts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Health Alerts</Text>
          <TouchableOpacity onPress={() => onNavigate('alerts')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <AlertTriangle size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>No alerts at this time</Text>
            <Text style={styles.emptyStateSubtext}>
              You're doing great! Keep it up!
            </Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={[styles.alertIconContainer, {
                backgroundColor: alert.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7'
              }]}>
                <AlertTriangle size={20} color={alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'} />
              </View>
              <View style={styles.alertInfo}>
                <Text style={styles.alertTitle}>{alert.type}</Text>
                <Text style={styles.alertDescription}>{alert.message}</Text>
                <Text style={styles.alertTime}>
                  {new Date(alert.createdAt).toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Profile</Text>
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Grade Level:</Text>
            <Text style={styles.profileValue}>{profile?.gradeLevel}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Section:</Text>
            <Text style={styles.profileValue}>{profile?.section}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Height:</Text>
            <Text style={styles.profileValue}>{profile?.height} cm</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Weight:</Text>
            <Text style={styles.profileValue}>{profile?.weight} kg</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>BMI:</Text>
            <Text style={styles.profileValue}>{profile?.bmi?.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
    backgroundColor: '#0d9488',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subgreeting: {
    fontSize: 14,
    color: '#ccfbf1',
  },
  statusCard: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#0d9488',
    fontWeight: '500',
  },
  freshnessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  freshnessDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  freshnessLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  freshnessTime: {
    fontSize: 12,
    marginLeft: 4,
  },
  vitalsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  vitalCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  vitalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  vitalInfo: {
    gap: 4,
  },
  vitalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  vitalValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 8,
  },
  vitalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  vitalUnit: {
    fontSize: 14,
    color: '#6b7280',
  },
  vitalStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vitalStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  lastUpdated: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  alertDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  profileLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptyStateSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
