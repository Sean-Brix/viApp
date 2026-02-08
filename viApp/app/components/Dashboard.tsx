import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Activity, Heart, Droplet, Thermometer, Plus } from 'lucide-react-native';
import { Student } from '../types';

interface DashboardProps {
  students: Student[];
  onStudentClick: (student: Student) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: string;
  onFilterChange: (status: string) => void;
  onAddStudent: () => void;
}

export function Dashboard({
  students,
  onStudentClick,
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
}: DashboardProps) {
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.includes(searchQuery);
    const matchesFilter = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Stable':
        return { bg: '#dcfce7', text: '#166534' };
      case 'Needs Attention':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'Critical':
        return { bg: '#fee2e2', text: '#991b1b' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const getVitalStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#16a34a';
      case 'high':
      case 'low':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#14b8a6', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoBox}>
            <Activity size={24} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.headerSubtitle}>SFMNHS</Text>
            <Text style={styles.headerTitle}>ViApp – Real-Time Monitoring</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => onFilterChange('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === 'all' && styles.filterButtonTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === 'Critical' && styles.filterButtonCritical,
            ]}
            onPress={() => onFilterChange('Critical')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === 'Critical' && styles.filterButtonTextActive,
              ]}
            >
              Critical
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === 'Needs Attention' && styles.filterButtonAttention,
            ]}
            onPress={() => onFilterChange('Needs Attention')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === 'Needs Attention' && styles.filterButtonTextActive,
              ]}
            >
              Attention
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Students List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.studentsContainer}>
        {filteredStudents.map((student) => {
          const statusColors = getStatusColor(student.status);
          return (
            <TouchableOpacity
              key={student.id}
              style={styles.studentCard}
              onPress={() => onStudentClick(student)}
              activeOpacity={0.7}
            >
              {/* Student Header */}
              <View style={styles.studentHeader}>
                <View>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentInfo}>
                    {student.age} years • {student.gradeLevel}
                  </Text>
                </View>
                <View
                  style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}
                >
                  <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
                    {student.status}
                  </Text>
                </View>
              </View>

              {/* Vitals Grid */}
              <View style={styles.vitalsGrid}>
                <View style={styles.vitalItem}>
                  <Heart size={16} color="#ef4444" />
                  <Text style={styles.vitalLabel}>Heart Rate</Text>
                  <Text
                    style={[
                      styles.vitalValue,
                      { color: getVitalStatusColor(student.vitals.heartRate.status) },
                    ]}
                  >
                    {student.vitals.heartRate.value} {student.vitals.heartRate.unit}
                  </Text>
                </View>

                <View style={styles.vitalItem}>
                  <Droplet size={16} color="#3b82f6" />
                  <Text style={styles.vitalLabel}>SpO₂</Text>
                  <Text
                    style={[
                      styles.vitalValue,
                      { color: getVitalStatusColor(student.vitals.spO2.status) },
                    ]}
                  >
                    {student.vitals.spO2.value}{student.vitals.spO2.unit}
                  </Text>
                </View>

                <View style={styles.vitalItem}>
                  <Thermometer size={16} color="#f59e0b" />
                  <Text style={styles.vitalLabel}>Temp</Text>
                  <Text
                    style={[
                      styles.vitalValue,
                      { color: getVitalStatusColor(student.vitals.temperature.status) },
                    ]}
                  >
                    {parseFloat(student.vitals.temperature.value).toFixed(2)}{student.vitals.temperature.unit}
                  </Text>
                </View>
              </View>

              {/* Last Updated */}
              <Text style={styles.lastUpdated}>
                Updated {Math.round((Date.now() - student.vitals.lastUpdated.getTime()) / 1000)}s ago
              </Text>
            </TouchableOpacity>
          );
        })}
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
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 2,
  },
  searchSection: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    height: 44,
    paddingLeft: 40,
    paddingRight: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 16,
    color: '#111827',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#14b8a6',
  },
  filterButtonCritical: {
    backgroundColor: '#ef4444',
  },
  filterButtonAttention: {
    backgroundColor: '#f59e0b',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  studentsContainer: {
    padding: 16,
    gap: 12,
  },
  studentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  studentInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  vitalItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  vitalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
  },
});
