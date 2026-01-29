import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { ChevronLeft, TrendingUp, TrendingDown, Minus, Users, Activity } from 'lucide-react-native';
import { adminService } from '../../src/services/api';

interface SchoolHealthStatsProps {
  onBack: () => void;
}

interface HealthStats {
  period: string;
  totalReadings: number;
  averageHeartRate: number;
  averageTemperature: number;
  averageSpO2: number;
  averageBP: { systolic: number; diastolic: number };
  normalCount: number;
  warningCount: number;
  criticalCount: number;
  activeStudents: number;
}

export function SchoolHealthStats({ onBack }: SchoolHealthStatsProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<HealthStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // Fetch all students with their latest vitals
      const studentsData = await adminService.getStudents({ limit: 1000 });
      const students = studentsData.students || [];

      // Calculate date range based on period
      const now = new Date();
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - 24); // Fixed to 24 hours

      // Aggregate vitals data
      let totalHeartRate = 0;
      let totalTemp = 0;
      let totalSpO2 = 0;
      let totalSystolic = 0;
      let totalDiastolic = 0;
      let count = 0;
      let normalCount = 0;
      let warningCount = 0;
      let criticalCount = 0;
      let activeStudents = 0;

      students.forEach((student: any) => {
        if (student.vitals && student.vitals.length > 0) {
          const vital = student.vitals[0];
          const vitalDate = new Date(vital.timestamp);

          if (vitalDate >= startDate && vitalDate <= now) {
            activeStudents++;
            count++;

            if (vital.heartRate) totalHeartRate += vital.heartRate;
            if (vital.temperature) totalTemp += vital.temperature;
            if (vital.spO2) totalSpO2 += vital.spO2;
            if (vital.bloodPressureSystolic) totalSystolic += vital.bloodPressureSystolic;
            if (vital.bloodPressureDiastolic) totalDiastolic += vital.bloodPressureDiastolic;

            // Count based on student status (STABLE, NEEDS_ATTENTION, CRITICAL)
            if (student.status === 'CRITICAL') {
              criticalCount++;
            } else if (student.status === 'NEEDS_ATTENTION') {
              warningCount++;
            } else {
              normalCount++;
            }
          }
        }
      });

      setStats({
        period: 'day',
        totalReadings: count,
        averageHeartRate: count > 0 ? Math.round(totalHeartRate / count) : 0,
        averageTemperature: count > 0 ? Number((totalTemp / count).toFixed(1)) : 0,
        averageSpO2: count > 0 ? Math.round(totalSpO2 / count) : 0,
        averageBP: {
          systolic: count > 0 ? Math.round(totalSystolic / count) : 0,
          diastolic: count > 0 ? Math.round(totalDiastolic / count) : 0,
        },
        normalCount,
        warningCount,
        criticalCount,
        activeStudents,
      });
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={styles.loadingText}>Loading school health data...</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const barWidth = (screenWidth - 80) / 3;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>School Health Overview</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {stats && (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <Users size={24} color="#0d9488" />
                <Text style={styles.summaryValue}>{stats.activeStudents}</Text>
                <Text style={styles.summaryLabel}>Active Students</Text>
              </View>
              <View style={styles.summaryCard}>
                <Activity size={24} color="#0d9488" />
                <Text style={styles.summaryValue}>{stats.totalReadings}</Text>
                <Text style={styles.summaryLabel}>Total Readings</Text>
              </View>
            </View>

            {/* Health Status Bar Chart */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Health Status Distribution</Text>
              <View style={styles.barChartContainer}>
                <View style={styles.barChart}>
                  <View style={styles.barGroup}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: stats.totalReadings > 0 ? Math.min(180, (stats.normalCount / stats.totalReadings) * 180) : 20,
                          backgroundColor: '#16a34a',
                          width: barWidth,
                        },
                      ]}
                    />
                    <Text style={styles.barValue}>{stats.normalCount}</Text>
                    <Text style={styles.barLabel}>Normal</Text>
                  </View>
                  <View style={styles.barGroup}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: stats.totalReadings > 0 ? Math.min(180, (stats.warningCount / stats.totalReadings) * 180) : 20,
                          backgroundColor: '#f59e0b',
                          width: barWidth,
                        },
                      ]}
                    />
                    <Text style={styles.barValue}>{stats.warningCount}</Text>
                    <Text style={styles.barLabel}>Warning</Text>
                  </View>
                  <View style={styles.barGroup}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: stats.totalReadings > 0 ? Math.min(180, (stats.criticalCount / stats.totalReadings) * 180) : 20,
                          backgroundColor: '#ef4444',
                          width: barWidth,
                        },
                      ]}
                    />
                    <Text style={styles.barValue}>{stats.criticalCount}</Text>
                    <Text style={styles.barLabel}>Critical</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Average Vitals */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Average Vital Signs (Last 24 Hours)</Text>
              
              <View style={styles.vitalCard}>
                <Text style={styles.vitalName}>Heart Rate</Text>
                <Text style={styles.vitalValue}>{stats.averageHeartRate} bpm</Text>
                <View style={styles.vitalRange}>
                  <Text style={styles.rangeText}>Normal: 60-100 bpm</Text>
                </View>
              </View>

              <View style={styles.vitalCard}>
                <Text style={styles.vitalName}>Temperature</Text>
                <Text style={styles.vitalValue}>{stats.averageTemperature} °C</Text>
                <View style={styles.vitalRange}>
                  <Text style={styles.rangeText}>Normal: 36.1-37.2 °C</Text>
                </View>
              </View>

              <View style={styles.vitalCard}>
                <Text style={styles.vitalName}>SpO₂</Text>
                <Text style={styles.vitalValue}>{stats.averageSpO2}%</Text>
                <View style={styles.vitalRange}>
                  <Text style={styles.rangeText}>Normal: 95-100%</Text>
                </View>
              </View>

              <View style={styles.vitalCard}>
                <Text style={styles.vitalName}>Blood Pressure</Text>
                <Text style={styles.vitalValue}>
                  {stats.averageBP.systolic}/{stats.averageBP.diastolic} mmHg
                </Text>
                <View style={styles.vitalRange}>
                  <Text style={styles.rangeText}>Normal: 90-120 / 60-80 mmHg</Text>
                </View>
              </View>
            </View>
          </>
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
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  periodButtonActive: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  barChartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
  },
  barGroup: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    height: 200,
  },
  bar: {
    borderRadius: 8,
    minHeight: 20,
    maxHeight: 180,
  },
  barValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  vitalCard: {
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
  vitalName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  vitalRange: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  rangeText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
