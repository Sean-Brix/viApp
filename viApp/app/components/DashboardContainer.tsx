import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { adminService } from '../../src/services/api';
import type { StudentListItem } from '../../src/services/api/admin.service';
import { Dashboard } from './Dashboard';
import { Student } from '../types';
import { websocketService } from '../../src/services/websocket';

interface DashboardContainerProps {
  onStudentClick: (student: Student) => void;
  onAddStudent: () => void;
}

export function DashboardContainer({ onStudentClick, onAddStudent }: DashboardContainerProps) {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const response = await adminService.getStudents({
        page: 1,
        limit: 100,
        search: searchQuery || undefined,
      });

      setStudents(response.students);
    } catch (err: any) {
      console.error('Failed to fetch students:', err);
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchStudents();
    
    // Set up 5-second polling for silent background updates
    const pollingInterval = setInterval(() => {
      console.log('🔄 Polling: Updating dashboard silently...');
      fetchStudents(true); // Silent update - no loading spinner
    }, 5000); // 5 seconds
    
    // Subscribe to real-time vital signs updates
    const unsubscribeVitals = websocketService.onVitalSignsUpdate((data) => {
      console.log('📊 Real-time vital signs update in dashboard container:', data);
      
      // Update the specific student's vital signs
      setStudents(prevStudents => {
        return prevStudents.map(student => {
          if (student.studentId === data.studentId) {
            return {
              ...student,
              latestVital: data.data || student.latestVital,
            };
          }
          return student;
        });
      });
    });

    // Subscribe to real-time alerts
    const unsubscribeAlerts = websocketService.onAlert((data) => {
      console.log('🚨 Real-time alert in dashboard container:', data);
      // Reload to get updated student status
      fetchStudents(true);
    });

    return () => {
      clearInterval(pollingInterval);
      unsubscribeVitals();
      unsubscribeAlerts();
    };
  }, [fetchStudents]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStudents(true);
  }, [fetchStudents]);

  // Transform backend data to match Dashboard component's expected format
  const transformedStudents: Student[] = students.map(student => {
    const latestVital = student.latestVital;
    
    // Use student status from backend
    let overallStatus = 'Stable';
    if (student.status === 'CRITICAL') {
      overallStatus = 'Critical';
    } else if (student.status === 'NEEDS_ATTENTION') {
      overallStatus = 'Needs Attention';
    }

    // Helper to determine vital status
    const getVitalStatus = (value: number, normal: number, threshold: number): 'normal' | 'high' | 'low' => {
      if (value > normal + threshold) return 'high';
      if (value < normal - threshold) return 'low';
      return 'normal';
    };

    return {
      id: student.studentId,
      name: `${student.firstName} ${student.lastName}`,
      age: student.dateOfBirth 
        ? new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear()
        : 0,
      gradeLevel: 'N/A', // Not available in backend data
      status: overallStatus,
      vitals: {
        heartRate: {
          value: latestVital?.heartRate ?? 0,
          unit: 'bpm',
          status: latestVital?.heartRate 
            ? getVitalStatus(latestVital.heartRate, 75, 15)
            : 'normal',
        },
        spO2: {
          value: latestVital?.spo2 ?? 0,
          unit: '%',
          status: latestVital?.spo2 
            ? (latestVital.spo2 < 95 ? 'low' : 'normal')
            : 'normal',
        },
        temperature: {
          value: latestVital?.temperature ?? 0,
          unit: '°C',
          status: latestVital?.temperature
            ? getVitalStatus(latestVital.temperature, 37, 0.5)
            : 'normal',
        },
        bloodPressureSystolic: {
          value: latestVital?.bloodPressureSystolic ?? 0,
          unit: 'mmHg',
          status: latestVital?.bloodPressureSystolic
            ? getVitalStatus(latestVital.bloodPressureSystolic, 120, 20)
            : 'normal',
        },
        bloodPressureDiastolic: {
          value: latestVital?.bloodPressureDiastolic ?? 0,
          unit: 'mmHg',
          status: latestVital?.bloodPressureDiastolic
            ? getVitalStatus(latestVital.bloodPressureDiastolic, 80, 10)
            : 'normal',
        },
        lastUpdated: latestVital?.timestamp 
          ? new Date(latestVital.timestamp)
          : new Date(),
      },
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
    <Dashboard
      students={transformedStudents}
      onStudentClick={onStudentClick}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      filterStatus={filterStatus}
      onFilterChange={setFilterStatus}
      onAddStudent={onAddStudent}
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
