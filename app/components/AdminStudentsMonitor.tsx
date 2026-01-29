import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { ChevronLeft, Heart, Thermometer, Droplet, Activity as ActivityIcon, Battery, Smartphone, UserX } from 'lucide-react-native';
import { adminService } from '../../src/services/api';

interface Device {
  deviceId: string;
  deviceName: string;
  status: string;
  batteryLevel?: number;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
  section?: string;
  user: {
    username: string;
    email: string;
  };
  device?: Device;
  vitals?: Array<{
    heartRate?: number;
    temperature?: number;
    spO2?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    timestamp: string;
  }>;
}

interface AdminStudentsMonitorProps {
  onBack: () => void;
  onAssignDevice: (studentId: string) => void;
}

export function AdminStudentsMonitor({ onBack, onAssignDevice }: AdminStudentsMonitorProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStudents();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadStudents();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await adminService.getStudents({ limit: 100 });
      setStudents(response.students);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load students');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStudents();
  };

  const getLatestVital = (student: Student) => {
    if (!student.vitals || student.vitals.length === 0) return null;
    return student.vitals[0];
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const renderVitalStatus = (label: string, value: number | undefined, icon: React.ReactNode, unit: string, normalRange: [number, number]) => {
    if (value === undefined || value === null) {
      return (
        <View style={styles.vitalBox}>
          {icon}
          <Text style={styles.vitalLabel}>{label}</Text>
          <Text style={styles.vitalValueEmpty}>--</Text>
          <Text style={styles.vitalUnit}>{unit}</Text>
        </View>
      );
    }

    const [min, max] = normalRange;
    const isNormal = value >= min && value <= max;
    const isHigh = value > max;
    const isLow = value < min;

    return (
      <View style={[
        styles.vitalBox,
        isNormal && styles.vitalBoxNormal,
        isHigh && styles.vitalBoxHigh,
        isLow && styles.vitalBoxLow,
      ]}>
        {icon}
        <Text style={styles.vitalLabel}>{label}</Text>
        <Text style={[
          styles.vitalValue,
          isNormal && styles.vitalValueNormal,
          isHigh && styles.vitalValueHigh,
          isLow && styles.vitalValueLow,
        ]}>{value}</Text>
        <Text style={styles.vitalUnit}>{unit}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Students Monitor</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Summary Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{students.length}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{students.filter(s => s.device).length}</Text>
          <Text style={styles.statLabel}>With Device</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{students.filter(s => !s.device).length}</Text>
          <Text style={styles.statLabel}>No Device</Text>
        </View>
      </View>

      {/* Students List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />
        }
      >
        {students.map((student) => {
          const latestVital = getLatestVital(student);
          const hasDevice = !!student.device;

          return (
            <View key={student.id} style={styles.studentCard}>
              {/* Student Header */}
              <View style={styles.studentHeader}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>
                    {student.firstName} {student.lastName}
                  </Text>
                  <Text style={styles.studentDetails}>
                    {student.gradeLevel}{student.section ? ` - ${student.section}` : ''} • @{student.user.username}
                  </Text>
                </View>
                <View style={[styles.statusBadge, hasDevice ? styles.statusActive : styles.statusInactive]}>
                  <Text style={[styles.statusText, hasDevice ? styles.statusTextActive : styles.statusTextInactive]}>
                    {hasDevice ? 'Active' : 'No Device'}
                  </Text>
                </View>
              </View>

              {/* Device Info */}
              {hasDevice && student.device ? (
                <View style={styles.deviceInfo}>
                  <Smartphone size={16} color="#0d9488" />
                  <Text style={styles.deviceText}>
                    {student.device.deviceName} ({student.device.deviceId})
                  </Text>
                  {student.device.batteryLevel !== undefined && (
                    <View style={styles.batteryInfo}>
                      <Battery size={14} color="#6b7280" />
                      <Text style={styles.batteryText}>{student.device.batteryLevel}%</Text>
                    </View>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={() => onAssignDevice(student.id)}
                >
                  <Smartphone size={16} color="#0d9488" />
                  <Text style={styles.assignButtonText}>Assign Device</Text>
                </TouchableOpacity>
              )}

              {/* Vitals Display */}
              {hasDevice ? (
                latestVital ? (
                  <>
                    <View style={styles.vitalsGrid}>
                      {renderVitalStatus(
                        'Heart Rate',
                        latestVital.heartRate,
                        <Heart size={20} color="#ef4444" />,
                        'bpm',
                        [60, 100]
                      )}
                      {renderVitalStatus(
                        'Temperature',
                        latestVital.temperature,
                        <Thermometer size={20} color="#f59e0b" />,
                        '°C',
                        [36.1, 37.2]
                      )}
                      {renderVitalStatus(
                        'SpO₂',
                        latestVital.spO2,
                        <Droplet size={20} color="#3b82f6" />,
                        '%',
                        [95, 100]
                      )}
                      {latestVital.bloodPressureSystolic !== undefined && (
                        <View style={styles.vitalBox}>
                          <ActivityIcon size={20} color="#8b5cf6" />
                          <Text style={styles.vitalLabel}>BP</Text>
                          <Text style={styles.vitalValue}>
                            {latestVital.bloodPressureSystolic}/{latestVital.bloodPressureDiastolic}
                          </Text>
                          <Text style={styles.vitalUnit}>mmHg</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.lastUpdate}>
                      Last update: {formatTimestamp(latestVital.timestamp)}
                    </Text>
                  </>
                ) : (
                  <View style={styles.noDataContainer}>
                    <UserX size={32} color="#9ca3af" />
                    <Text style={styles.noDataText}>No vital signs recorded yet</Text>
                  </View>
                )
              ) : (
                <View style={styles.noDataContainer}>
                  <UserX size={32} color="#9ca3af" />
                  <Text style={styles.noDataText}>Assign a device to monitor vitals</Text>
                </View>
              )}
            </View>
          );
        })}

        {students.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No students found</Text>
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
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0d9488',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  studentCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  studentDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#d1fae5',
  },
  statusInactive: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#065f46',
  },
  statusTextInactive: {
    color: '#991b1b',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0fdfa',
    borderRadius: 8,
    marginBottom: 12,
  },
  deviceText: {
    fontSize: 14,
    color: '#0d9488',
    marginLeft: 8,
    flex: 1,
  },
  batteryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  batteryText: {
    fontSize: 12,
    color: '#6b7280',
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f0fdfa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#99f6e4',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  assignButtonText: {
    fontSize: 14,
    color: '#0d9488',
    fontWeight: '600',
    marginLeft: 8,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  vitalBox: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  vitalBoxNormal: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  vitalBoxHigh: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  vitalBoxLow: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  vitalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  vitalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  vitalValueNormal: {
    color: '#16a34a',
  },
  vitalValueHigh: {
    color: '#dc2626',
  },
  vitalValueLow: {
    color: '#2563eb',
  },
  vitalValueEmpty: {
    fontSize: 20,
    fontWeight: '700',
    color: '#d1d5db',
    marginTop: 4,
  },
  vitalUnit: {
    fontSize: 11,
    color: '#9ca3af',
  },
  lastUpdate: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noDataText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});
