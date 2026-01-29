import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  ChevronLeft,
  User,
  Heart,
  Thermometer,
  Wind,
  Activity,
  Calendar,
  Ruler,
  Weight,
  Phone,
  MapPin,
  Smartphone,
  AlertTriangle,
} from 'lucide-react-native';
import { adminService } from '../../src/services/api';

interface AdminStudentDetailsProps {
  studentId: string;
  onBack: () => void;
}

export function AdminStudentDetails({ studentId, onBack }: AdminStudentDetailsProps) {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStudentDetails();
  }, [studentId]);

  const loadStudentDetails = async () => {
    try {
      setLoading(true);
      const data = await adminService.getStudentById(studentId, true);
      setStudent(data);
    } catch (error: any) {
      console.error('Failed to load student details:', error);
      Alert.alert('Error', error.message || 'Failed to load student details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStudentDetails();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NORMAL':
        return '#16a34a';
      case 'WARNING':
        return '#f59e0b';
      case 'CRITICAL':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'NORMAL':
        return '#dcfce7';
      case 'WARNING':
        return '#fef3c7';
      case 'CRITICAL':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  };

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
        timeAgo: `${diffSec}s ago`,
      };
    } else if (diffSec <= 60) {
      return {
        isFresh: false,
        label: 'Recent',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        timeAgo: `${diffSec}s ago`,
      };
    } else {
      const diffMin = Math.floor(diffSec / 60);
      return {
        isFresh: false,
        label: 'Outdated',
        color: '#dc2626',
        bgColor: '#fee2e2',
        timeAgo: `${diffMin}m ago`,
      };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={styles.loadingText}>Loading student details...</Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle size={48} color="#dc2626" />
        <Text style={styles.errorText}>Failed to load student details</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadStudentDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const latestVitals = student.vitals && student.vitals.length > 0 ? student.vitals[0] : student.latestVital;
  const freshness = latestVitals ? getDataFreshness(latestVitals.timestamp) : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {student.firstName?.[0]}{student.lastName?.[0]}
            </Text>
          </View>
          <Text style={styles.studentName}>
            {student.firstName} {student.lastName}
          </Text>
          <Text style={styles.username}>@{student.user?.username}</Text>
          <View
            style={[
              styles.statusBadgeLarge,
              { backgroundColor: getStatusBgColor(student.status || 'STABLE') },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(student.status || 'STABLE') }]}>
              {student.status || 'STABLE'}
            </Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Calendar size={20} color="#0d9488" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>
                  {student.birthdate ? new Date(student.birthdate).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <User size={20} color="#0d9488" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>
                  {student.gender || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <User size={20} color="#0d9488" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Grade & Section</Text>
                <Text style={styles.infoValue}>
                  {student.gradeLevel} {student.section ? `- ${student.section}` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ruler size={20} color="#0d9488" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Height</Text>
                <Text style={styles.infoValue}>
                  {student.height ? `${student.height} cm` : 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Weight size={20} color="#0d9488" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Weight</Text>
                <Text style={styles.infoValue}>
                  {student.weight ? `${student.weight} kg` : 'N/A'}
                </Text>
              </View>
            </View>

            {student.bmi && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Activity size={20} color="#0d9488" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>BMI</Text>
                    <Text style={styles.infoValue}>
                      {student.bmi.toFixed(1)}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoCard}>
            {student.user?.contactNumber && (
              <>
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Phone size={20} color="#0d9488" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Student Contact</Text>
                    <Text style={styles.infoValue}>{student.user.contactNumber}</Text>
                  </View>
                </View>
              </>
            )}

            {student.user?.email && (
              <>
                {student.user?.contactNumber && <View style={styles.infoDivider} />}
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Phone size={20} color="#0d9488" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{student.user.email}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Emergency Contacts */}
        {student.emergencyContacts && student.emergencyContacts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            {student.emergencyContacts.map((contact: any, index: number) => (
              <View key={contact.id} style={[styles.infoCard, index > 0 && { marginTop: 12 }]}>
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <User size={20} color="#0d9488" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>
                      {contact.relationship || 'Guardian'}
                      {contact.isPrimary && ' (Primary)'}
                    </Text>
                    <Text style={styles.infoValue}>{contact.name}</Text>
                  </View>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Phone size={20} color="#0d9488" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Contact Number</Text>
                    <Text style={styles.infoValue}>{contact.phoneNumber}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Device Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Device</Text>
          <View style={styles.infoCard}>
            {student.device ? (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Smartphone size={20} color="#0d9488" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Device ID</Text>
                  <Text style={styles.infoValue}>{student.device.deviceId}</Text>
                  {student.device.deviceName && (
                    <Text style={styles.infoSubtext}>
                      {student.device.deviceName}
                      {student.device.deviceType ? ` • ${student.device.deviceType}` : ''}
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.deviceStatusBadge,
                    {
                      backgroundColor:
                        student.device.status === 'ACTIVE' ? '#dcfce7' : '#f3f4f6',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.deviceStatusText,
                      { color: student.device.status === 'ACTIVE' ? '#16a34a' : '#6b7280' },
                    ]}
                  >
                    {student.device.status}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyDevice}>
                <Smartphone size={32} color="#d1d5db" />
                <Text style={styles.emptyDeviceText}>No device assigned</Text>
              </View>
            )}
          </View>
        </View>

        {/* Latest Vitals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Vital Signs</Text>
          {latestVitals ? (
            <>
              {/* Freshness Indicator */}
              {freshness && (
                <View style={[styles.freshnessBadge, { backgroundColor: freshness.bgColor }]}>
                  <View style={[styles.freshnessDot, { backgroundColor: freshness.color }]} />
                  <Text style={[styles.freshnessLabel, { color: freshness.color }]}>
                    {freshness.label}
                  </Text>
                  <Text style={[styles.freshnessTime, { color: freshness.color }]}>
                    • {freshness.timeAgo}
                  </Text>
                </View>
              )}

              <View style={styles.vitalsGrid}>
                {/* Heart Rate */}
                <View style={styles.vitalCard}>
                  <View style={[styles.vitalIcon, { backgroundColor: '#fee2e2' }]}>
                    <Heart size={24} color="#dc2626" />
                  </View>
                  <Text style={styles.vitalLabel}>Heart Rate</Text>
                  <View style={styles.vitalValueContainer}>
                    <Text style={styles.vitalValue}>{latestVitals.heartRate}</Text>
                    <Text style={styles.vitalUnit}>bpm</Text>
                  </View>
                  <View
                    style={[
                      styles.vitalStatus,
                      { backgroundColor: getStatusBgColor(latestVitals.heartRateStatus) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.vitalStatusText,
                        { color: getStatusColor(latestVitals.heartRateStatus) },
                      ]}
                    >
                      {latestVitals.heartRateStatus}
                    </Text>
                  </View>
                </View>

                {/* Temperature */}
                <View style={styles.vitalCard}>
                  <View style={[styles.vitalIcon, { backgroundColor: '#fef3c7' }]}>
                    <Thermometer size={24} color="#f59e0b" />
                  </View>
                  <Text style={styles.vitalLabel}>Temperature</Text>
                  <View style={styles.vitalValueContainer}>
                    <Text style={styles.vitalValue}>{latestVitals.temperature}</Text>
                    <Text style={styles.vitalUnit}>°C</Text>
                  </View>
                  <View
                    style={[
                      styles.vitalStatus,
                      { backgroundColor: getStatusBgColor(latestVitals.temperatureStatus) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.vitalStatusText,
                        { color: getStatusColor(latestVitals.temperatureStatus) },
                      ]}
                    >
                      {latestVitals.temperatureStatus}
                    </Text>
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
                    <Text style={styles.vitalLabel}>SpO2</Text>
                    <View style={styles.vitalValueContainer}>
                      <Text style={styles.vitalValue}>{latestVitals.spO2}</Text>
                      <Text style={styles.vitalUnit}>%</Text>
                    </View>
                    <View
                      style={[
                        styles.vitalStatus,
                        { backgroundColor: getStatusBgColor(latestVitals.spO2Status) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.vitalStatusText,
                          { color: getStatusColor(latestVitals.spO2Status) },
                        ]}
                      >
                        {latestVitals.spO2Status}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Blood Pressure */}
                {latestVitals.bloodPressureSystolic && (
                  <View style={styles.vitalCard}>
                    <View style={[styles.vitalIcon, { backgroundColor: '#e0e7ff' }]}>
                      <Activity size={24} color="#6366f1" />
                    </View>
                    <Text style={styles.vitalLabel}>Blood Pressure</Text>
                    <View style={styles.vitalValueContainer}>
                      <Text style={styles.vitalValue}>
                        {latestVitals.bloodPressureSystolic}/{latestVitals.bloodPressureDiastolic}
                      </Text>
                      <Text style={styles.vitalUnit}>mmHg</Text>
                    </View>
                    <View
                      style={[
                        styles.vitalStatus,
                        { backgroundColor: getStatusBgColor(latestVitals.bloodPressureStatus) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.vitalStatusText,
                          { color: getStatusColor(latestVitals.bloodPressureStatus) },
                        ]}
                      >
                        {latestVitals.bloodPressureStatus}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.lastUpdated}>
                <Text style={styles.lastUpdatedText}>
                  Recorded: {new Date(latestVitals.timestamp).toLocaleString()}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.infoCard}>
              <View style={styles.emptyVitals}>
                <Activity size={32} color="#d1d5db" />
                <Text style={styles.emptyVitalsText}>No vital signs recorded yet</Text>
              </View>
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0d9488',
    borderBottomWidth: 1,
    borderBottomColor: '#0f766e',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0d9488',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  statusBadgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  infoSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  deviceStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deviceStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyDevice: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyDeviceText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
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
  emptyVitals: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyVitalsText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
  },
});
