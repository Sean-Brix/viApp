import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import { Users, Activity, AlertTriangle, Plus, Search, Filter } from 'lucide-react-native';
import { adminService } from '../../src/services/api';
import { websocketService } from '../../src/services/websocket';

interface AdminDashboardProps {
  onNavigate: (screen: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeDevices: 0,
    criticalAlerts: 0,
  });

  useEffect(() => {
    loadDashboardData();

    // Subscribe to real-time vital signs updates
    const unsubscribeVitals = websocketService.onVitalSignsUpdate((data) => {
      console.log('📊 Real-time vital signs update on dashboard:', data.studentId);
      
      // Update the specific student in the list
      setStudents(prevStudents => {
        return prevStudents.map(student => {
          if (student.id === data.studentId || student.user?.id === data.studentId) {
            // Add the new vital sign to the student's data
            return {
              ...student,
              vitalSigns: data.data ? [data.data, ...(student.vitalSigns || [])] : student.vitalSigns,
              lastUpdated: data.timestamp,
            };
          }
          return student;
        });
      });
    });

    // Subscribe to real-time alerts
    const unsubscribeAlerts = websocketService.onAlert((data) => {
      console.log('🚨 Real-time alert on dashboard:', data.studentId);
      
      // Add new alert to the list
      setAlerts(prevAlerts => [data.alert, ...prevAlerts]);
      
      // Update critical alerts count
      if (data.alert.severity === 'HIGH' || data.alert.severity === 'CRITICAL') {
        setStats(prevStats => ({
          ...prevStats,
          criticalAlerts: prevStats.criticalAlerts + 1,
        }));
      }
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
      
      // Load students
      const studentsResponse = await adminService.getStudents({ page: 1, limit: 10 });
      const studentsData = studentsResponse.students || [];
      setStudents(studentsData);
      
      // Load alerts
      const alertsResponse = await adminService.getAlerts({ page: 1, limit: 10 });
      const alertsData = alertsResponse.alerts || [];
      setAlerts(alertsData);
      
      // Load devices
      const devicesResponse = await adminService.getDevices({ page: 1, limit: 100 });
      const devicesData = devicesResponse.devices || [];
      setDevices(devicesData);
      
      // Calculate stats
      const criticalAlerts = alertsData.filter((a: any) => a.severity === 'HIGH' || a.severity === 'CRITICAL').length;
      const activeDevices = devicesData.filter((d: any) => d.status === 'ACTIVE').length;
      
      setStats({
        totalStudents: studentsResponse.total || studentsData.length,
        activeDevices,
        criticalAlerts,
      });
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

  const filteredStudents = students.filter(student => {
    const searchLower = searchQuery.toLowerCase();
    return (
      student.firstName?.toLowerCase().includes(searchLower) ||
      student.lastName?.toLowerCase().includes(searchLower) ||
      student.user?.username?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
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
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Health Monitoring System</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Users size={24} color="#0d9488" />
          </View>
          <Text style={styles.statValue}>{stats.totalStudents}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Activity size={24} color="#3b82f6" />
          </View>
          <Text style={styles.statValue}>{stats.activeDevices}</Text>
          <Text style={styles.statLabel}>Active Devices</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#fee2e2' }]}>
            <AlertTriangle size={24} color="#ef4444" />
          </View>
          <Text style={styles.statValue}>{stats.criticalAlerts}</Text>
          <Text style={styles.statLabel}>Critical Alerts</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onNavigate('createStudent')}
          >
            <Plus size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Add Student</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
            onPress={() => onNavigate('registerDevice')}
          >
            <Plus size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Register Device</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.actionsContainer, { marginTop: 12 }]}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#8b5cf6' }]}
            onPress={() => onNavigate('monitorStudents')}
          >
            <Activity size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Monitoring</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
            onPress={() => onNavigate('deviceManagement')}
          >
            <Users size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Manage Devices</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.section}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search students..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Recent Students */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Students</Text>
          <TouchableOpacity onPress={() => onNavigate('studentsList')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {filteredStudents.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>No students found</Text>
          </View>
        ) : (
          filteredStudents.map((student) => (
            <TouchableOpacity
              key={student.id}
              style={styles.studentCard}
              onPress={() => onNavigate(`studentDetail:${student.id}`)}
            >
              <View style={styles.studentAvatar}>
                <Text style={styles.studentAvatarText}>
                  {student.firstName?.[0]}{student.lastName?.[0]}
                </Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>
                  {student.firstName} {student.lastName}
                </Text>
                <Text style={styles.studentDetails}>
                  {student.gradeLevel} • {student.section}
                </Text>
              </View>
              <View style={[styles.statusBadge, { 
                backgroundColor: student.status === 'STABLE' ? '#dcfce7' : '#fee2e2' 
              }]}>
                <Text style={[styles.statusText, { 
                  color: student.status === 'STABLE' ? '#16a34a' : '#dc2626' 
                }]}>
                  {student.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Recent Alerts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          <TouchableOpacity onPress={() => onNavigate('alerts')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <AlertTriangle size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>No alerts at this time</Text>
          </View>
        ) : (
          alerts.slice(0, 5).map((alert) => (
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ccfbf1',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
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
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d9488',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  studentDetails: {
    fontSize: 14,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9ca3af',
  },
});
