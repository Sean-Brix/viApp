import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, Search, UserPlus, Users, Activity, AlertTriangle, Trash2, Edit } from 'lucide-react-native';
import { adminService } from '../../src/services/api';

interface AdminStudentsListProps {
  onBack: () => void;
  onStudentSelect: (studentId: string) => void;
  onEditStudent?: (studentId: string) => void;
}

export function AdminStudentsList({ onBack, onStudentSelect, onEditStudent }: AdminStudentsListProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadStudents();
  }, [filterStatus]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await adminService.getStudents({ page: 1, limit: 50 });
      setStudents(response.students || []);
      setHasMore(response.students?.length >= 50);
    } catch (error: any) {
      console.error('Failed to load students:', error);
      Alert.alert('Error', error.message || 'Failed to load students');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadStudents();
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    Alert.alert(
      'Deactivate Student',
      `Are you sure you want to deactivate ${studentName}? This will disable their account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deactivateStudent(studentId);
              Alert.alert('Success', 'Student deactivated successfully');
              loadStudents();
            } catch (error: any) {
              console.error('Failed to deactivate student:', error);
              Alert.alert('Error', error.message || 'Failed to deactivate student');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'STABLE': return '#16a34a';
      case 'WARNING': return '#f59e0b';
      case 'CRITICAL': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'STABLE': return '#dcfce7';
      case 'WARNING': return '#fef3c7';
      case 'CRITICAL': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || 
      student.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: students.length,
    STABLE: students.filter(s => s.status === 'STABLE').length,
    WARNING: students.filter(s => s.status === 'WARNING').length,
    CRITICAL: students.filter(s => s.status === 'CRITICAL').length,
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
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Students</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Users size={20} color="#0d9488" />
          <Text style={styles.statValue}>{statusCounts.all}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Activity size={20} color="#16a34a" />
          <Text style={styles.statValue}>{statusCounts.STABLE}</Text>
          <Text style={styles.statLabel}>Stable</Text>
        </View>
        <View style={styles.statItem}>
          <AlertTriangle size={20} color="#f59e0b" />
          <Text style={styles.statValue}>{statusCounts.WARNING}</Text>
          <Text style={styles.statLabel}>Warning</Text>
        </View>
        <View style={styles.statItem}>
          <AlertTriangle size={20} color="#dc2626" />
          <Text style={styles.statValue}>{statusCounts.CRITICAL}</Text>
          <Text style={styles.statLabel}>Critical</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or student ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterTab, filterStatus === 'all' && styles.activeFilterTab]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[styles.filterTabText, filterStatus === 'all' && styles.activeFilterTabText]}>
              All ({statusCounts.all})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filterStatus === 'STABLE' && styles.activeFilterTab]}
            onPress={() => setFilterStatus('STABLE')}
          >
            <Text style={[styles.filterTabText, filterStatus === 'STABLE' && styles.activeFilterTabText]}>
              Stable ({statusCounts.STABLE})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filterStatus === 'WARNING' && styles.activeFilterTab]}
            onPress={() => setFilterStatus('WARNING')}
          >
            <Text style={[styles.filterTabText, filterStatus === 'WARNING' && styles.activeFilterTabText]}>
              Warning ({statusCounts.WARNING})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filterStatus === 'CRITICAL' && styles.activeFilterTab]}
            onPress={() => setFilterStatus('CRITICAL')}
          >
            <Text style={[styles.filterTabText, filterStatus === 'CRITICAL' && styles.activeFilterTabText]}>
              Critical ({statusCounts.CRITICAL})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Students List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {filteredStudents.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={64} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No students found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'Try adjusting your search' : 'Add a new student to get started'}
              </Text>
            </View>
          ) : (
            filteredStudents.map((student) => (
              <View key={student.id} style={styles.studentCard}>
                <TouchableOpacity 
                  style={styles.studentInfo}
                  onPress={() => onStudentSelect(student.id)}
                >
                  <View style={styles.studentAvatar}>
                    <Text style={styles.avatarText}>
                      {student.firstName[0]}{student.lastName[0]}
                    </Text>
                  </View>
                  <View style={styles.studentDetails}>
                    <Text style={styles.studentName}>
                      {student.firstName} {student.lastName}
                    </Text>
                    <Text style={styles.studentId}>ID: {student.studentId}</Text>
                    <View style={styles.studentMeta}>
                      <Text style={styles.metaText}>
                        Grade {student.gradeLevel} • {student.section}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, {
                    backgroundColor: getStatusBgColor(student.status)
                  }]}>
                    <Text style={[styles.statusText, {
                      color: getStatusColor(student.status)
                    }]}>
                      {student.status}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onEditStudent ? onEditStudent(student.id) : onStudentSelect(student.id)}
                  >
                    <Edit size={16} color="#0d9488" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteStudent(student.id, `${student.firstName} ${student.lastName}`)}
                  >
                    <Trash2 size={16} color="#dc2626" />
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
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
  statsBar: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  activeFilterTab: {
    backgroundColor: '#0d9488',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeFilterTabText: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  studentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  studentId: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  studentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0d9488',
  },
  deleteButton: {
    borderLeftWidth: 1,
    borderLeftColor: '#f3f4f6',
  },
  deleteButtonText: {
    color: '#dc2626',
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
