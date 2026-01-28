import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ArrowLeft, Heart, Thermometer, Wind, Activity, Calendar } from 'lucide-react-native';
import { studentService } from '../../src/services/api';

interface StudentVitalsHistoryProps {
  onBack: () => void;
}

export function StudentVitalsHistory({ onBack }: StudentVitalsHistoryProps) {
  const [vitals, setVitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadVitals();
  }, []);

  const loadVitals = async () => {
    try {
      setLoading(true);
      const data = await studentService.getVitalsHistory(1, 20);
      setVitals(data);
      setHasMore(data.length >= 20);
    } catch (error) {
      console.error('Failed to load vitals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadVitals();
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={styles.loadingText}>Loading your vitals history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vitals History</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {vitals.length === 0 ? (
          <View style={styles.emptyState}>
            <Activity size={64} color="#d1d5db" />
            <Text style={styles.emptyStateText}>No vitals recorded yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Your health measurements will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            {vitals.map((vital, index) => (
              <View key={vital.id || index} style={styles.vitalCard}>
                {/* Date Header */}
                <View style={styles.dateHeader}>
                  <Calendar size={16} color="#6b7280" />
                  <Text style={styles.dateText}>
                    {new Date(vital.timestamp).toLocaleString()}
                  </Text>
                </View>

                {/* Vitals Grid */}
                <View style={styles.vitalsGrid}>
                  {/* Heart Rate */}
                  <View style={styles.vitalItem}>
                    <View style={[styles.vitalIcon, { backgroundColor: '#fee2e2' }]}>
                      <Heart size={20} color="#dc2626" />
                    </View>
                    <View style={styles.vitalDetails}>
                      <Text style={styles.vitalLabel}>Heart Rate</Text>
                      <Text style={styles.vitalValue}>{vital.heartRate} bpm</Text>
                      <View style={[styles.statusBadge, {
                        backgroundColor: getStatusBgColor(vital.heartRateStatus)
                      }]}>
                        <Text style={[styles.statusText, {
                          color: getStatusColor(vital.heartRateStatus)
                        }]}>
                          {vital.heartRateStatus}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Temperature */}
                  <View style={styles.vitalItem}>
                    <View style={[styles.vitalIcon, { backgroundColor: '#fef3c7' }]}>
                      <Thermometer size={20} color="#f59e0b" />
                    </View>
                    <View style={styles.vitalDetails}>
                      <Text style={styles.vitalLabel}>Temperature</Text>
                      <Text style={styles.vitalValue}>{vital.temperature}°C</Text>
                      <View style={[styles.statusBadge, {
                        backgroundColor: getStatusBgColor(vital.temperatureStatus)
                      }]}>
                        <Text style={[styles.statusText, {
                          color: getStatusColor(vital.temperatureStatus)
                        }]}>
                          {vital.temperatureStatus}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Optional Vitals */}
                {(vital.spO2 || vital.bloodPressureSystolic) && (
                  <View style={styles.vitalsGrid}>
                    {/* SpO2 */}
                    {vital.spO2 && (
                      <View style={styles.vitalItem}>
                        <View style={[styles.vitalIcon, { backgroundColor: '#dbeafe' }]}>
                          <Wind size={20} color="#3b82f6" />
                        </View>
                        <View style={styles.vitalDetails}>
                          <Text style={styles.vitalLabel}>SpO2</Text>
                          <Text style={styles.vitalValue}>{vital.spO2}%</Text>
                          <View style={[styles.statusBadge, {
                            backgroundColor: getStatusBgColor(vital.spO2Status)
                          }]}>
                            <Text style={[styles.statusText, {
                              color: getStatusColor(vital.spO2Status)
                            }]}>
                              {vital.spO2Status}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Blood Pressure */}
                    {vital.bloodPressureSystolic && (
                      <View style={styles.vitalItem}>
                        <View style={[styles.vitalIcon, { backgroundColor: '#e0e7ff' }]}>
                          <Activity size={20} color="#6366f1" />
                        </View>
                        <View style={styles.vitalDetails}>
                          <Text style={styles.vitalLabel}>Blood Pressure</Text>
                          <Text style={styles.vitalValue}>
                            {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}
                          </Text>
                          <View style={[styles.statusBadge, {
                            backgroundColor: getStatusBgColor(vital.bloodPressureStatus)
                          }]}>
                            <Text style={[styles.statusText, {
                              color: getStatusColor(vital.bloodPressureStatus)
                            }]}>
                              {vital.bloodPressureStatus}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Device Info */}
                {vital.deviceId && (
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceLabel}>Device: {vital.deviceId}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
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
    backgroundColor: '#0d9488',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  vitalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  vitalsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  vitalItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vitalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vitalDetails: {
    flex: 1,
  },
  vitalLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  deviceInfo: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  deviceLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
