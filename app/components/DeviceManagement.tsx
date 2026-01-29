import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ChevronLeft, Plus, Smartphone, UserPlus, UserMinus, AlertCircle } from 'lucide-react-native';
import { adminService } from '../../src/services/api';
import { StudentSelectionModal } from './StudentSelectionModal';

interface Device {
  id: string;
  deviceId: string;
  deviceName?: string;
  deviceType?: string;
  macAddress?: string;
  status: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    gradeLevel?: string;
  };
  lastSyncedAt?: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
  section?: string;
  user?: {
    username: string;
    email: string;
  };
}

interface DeviceManagementProps {
  onBack: () => void;
  onRegisterDevice: () => void;
}

export function DeviceManagement({ onBack, onRegisterDevice }: DeviceManagementProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [devicesData, studentsData] = await Promise.all([
        adminService.getDevices(),
        adminService.getStudents({ forceRefresh: true, limit: 1000 }),
      ]);
      console.log('Devices loaded:', devicesData.devices?.length || 0);
      console.log('Students loaded:', studentsData.students?.length || 0);
      console.log('First student sample:', studentsData.students?.[0]);
      console.log('Students data structure:', JSON.stringify(studentsData, null, 2).substring(0, 500));
      setDevices(devicesData.devices || []);
      setStudents(studentsData.students || []);
    } catch (error: any) {
      console.error('Load data error:', error);
      Alert.alert('Error', error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAssignDevice = (device: Device) => {
    // Filter out students who already have devices assigned
    const filtered = students.filter(
      (student) => {
        // Check if this student has a device assigned (excluding the current device being reassigned)
        const hasDevice = devices.some(
          (d) => d.student?.id === student.id && d.id !== device.id
        );
        return !hasDevice;
      }
    );

    console.log('=== ASSIGNMENT DEBUG ===');
    console.log('Total students:', students.length);
    console.log('Available students:', filtered.length);
    console.log('Device:', device.deviceId);
    console.log('First available student:', filtered[0]);
    console.log('========================');

    if (filtered.length === 0) {
      Alert.alert(
        'No Available Students', 
        'All students already have assigned devices. Please add more students or unassign devices first.'
      );
      return;
    }

    setAvailableStudents(filtered);
    setSelectedDevice(device);
    setShowStudentModal(true);
  };

  const confirmAssignment = async (studentId: string) => {
    if (!selectedDevice) return;
    
    try {
      await adminService.assignDevice(selectedDevice.deviceId, studentId);
      Alert.alert('Success', 'Device assigned successfully');
      setSelectedDevice(null);
      await loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to assign device');
    }
  };

  const handleUnassignDevice = (device: Device) => {
    if (!device.student) {
      return;
    }

    Alert.alert(
      'Unassign Device',
      `Are you sure you want to unassign ${device.deviceId} from ${device.student.firstName} ${device.student.lastName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unassign',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.unassignDevice(device.id);
              Alert.alert('Success', 'Device unassigned successfully');
              await loadData();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to unassign device');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#10b981';
      case 'INACTIVE':
        return '#6b7280';
      case 'MAINTENANCE':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const formatLastSync = (date?: string) => {
    if (!date) return 'Never';
    const syncDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - syncDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14b8a6" />
        <Text style={styles.loadingText}>Loading devices...</Text>
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
        <Text style={styles.title}>Device Management</Text>
        <TouchableOpacity onPress={onRegisterDevice} style={styles.addButton}>
          <Plus size={24} color="#14b8a6" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#14b8a6']} />
        }
      >
        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{devices.length}</Text>
            <Text style={styles.statLabel}>Total Devices</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {devices.filter((d) => d.student).length}
            </Text>
            <Text style={styles.statLabel}>Assigned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {devices.filter((d) => !d.student).length}
            </Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
        </View>

        {/* Devices List */}
        {devices.length === 0 ? (
          <View style={styles.emptyState}>
            <Smartphone size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Devices Registered</Text>
            <Text style={styles.emptyText}>
              Register a new ViBand device to get started
            </Text>
            <TouchableOpacity style={styles.registerButton} onPress={onRegisterDevice}>
              <Plus size={20} color="#ffffff" />
              <Text style={styles.registerButtonText}>Register Device</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.devicesList}>
            {devices.map((device) => (
              <View key={device.id} style={styles.deviceCard}>
                <View style={styles.deviceHeader}>
                  <View style={styles.deviceInfo}>
                    <View style={styles.deviceIconContainer}>
                      <Smartphone size={24} color="#14b8a6" />
                    </View>
                    <View style={styles.deviceDetails}>
                      <Text style={styles.deviceId}>{device.deviceId}</Text>
                      {device.deviceName && (
                        <Text style={styles.deviceSerial}>{device.deviceName}</Text>
                      )}
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(device.status)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(device.status) },
                      ]}
                    >
                      {device.status}
                    </Text>
                  </View>
                </View>

                {device.deviceType && (
                  <View style={styles.deviceSpecs}>
                    <Text style={styles.specText}>
                      {device.deviceType}
                      {device.macAddress && ` • ${device.macAddress}`}
                    </Text>
                  </View>
                )}

                {device.student ? (
                  <View style={styles.assignmentSection}>
                    <View style={styles.assignedTo}>
                      <Text style={styles.assignedLabel}>Assigned to:</Text>
                      <Text style={styles.assignedStudent}>
                        {device.student.firstName} {device.student.lastName}
                      </Text>
                    </View>
                    <View style={styles.lastSync}>
                      <Text style={styles.lastSyncLabel}>Last sync:</Text>
                      <Text style={styles.lastSyncValue}>
                        {formatLastSync(device.lastSyncedAt)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.unassignButton}
                      onPress={() => handleUnassignDevice(device)}
                    >
                      <UserMinus size={16} color="#ef4444" />
                      <Text style={styles.unassignButtonText}>Unassign</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.unassignedSection}>
                    <View style={styles.unassignedInfo}>
                      <AlertCircle size={16} color="#f59e0b" />
                      <Text style={styles.unassignedText}>Not assigned to any student</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.assignButton}
                      onPress={() => handleAssignDevice(device)}
                    >
                      <UserPlus size={16} color="#14b8a6" />
                      <Text style={styles.assignButtonText}>Assign Student</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Student Selection Modal */}
      {selectedDevice && (
        <StudentSelectionModal
          visible={showStudentModal}
          students={availableStudents}
          deviceId={selectedDevice.deviceId}
          onSelect={confirmAssignment}
          onClose={() => {
            setShowStudentModal(false);
            setSelectedDevice(null);
            setAvailableStudents([]);
          }}
        />
      )}
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
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#14b8a6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#14b8a6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  devicesList: {
    gap: 16,
  },
  deviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  deviceSerial: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deviceSpecs: {
    marginBottom: 12,
    paddingLeft: 60,
  },
  specText: {
    fontSize: 13,
    color: '#6b7280',
  },
  assignmentSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  assignedTo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignedLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginRight: 8,
  },
  assignedStudent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  lastSync: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  lastSyncLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginRight: 8,
  },
  lastSyncValue: {
    fontSize: 13,
    color: '#374151',
  },
  unassignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  unassignButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  unassignedSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  unassignedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  unassignedText: {
    fontSize: 13,
    color: '#f59e0b',
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f0fdfa',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccfbf1',
  },
  assignButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14b8a6',
  },
});
