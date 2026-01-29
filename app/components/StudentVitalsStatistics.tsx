import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ChevronLeft, TrendingUp, TrendingDown, Minus, Heart, Thermometer, Droplet, Activity as ActivityIcon } from 'lucide-react-native';
import { studentService } from '../../src/services/api';

interface StudentVitalsStatisticsProps {
  onBack: () => void;
}

export function StudentVitalsStatistics({ onBack }: StudentVitalsStatisticsProps) {
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const data = await studentService.getVitalsStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStatistics();
  };

  const renderStatCard = (
    title: string,
    icon: React.ReactNode,
    stats: any,
    unit: string,
    normalRange: [number, number]
  ) => {
    if (!stats || stats.avg === null) {
      return (
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            {icon}
            <Text style={styles.statTitle}>{title}</Text>
          </View>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      );
    }

    const avg = stats.avg.toFixed(1);
    const min = stats.min?.toFixed(1);
    const max = stats.max?.toFixed(1);
    const [normalMin, normalMax] = normalRange;
    const isNormal = stats.avg >= normalMin && stats.avg <= normalMax;
    const isHigh = stats.avg > normalMax;
    const isLow = stats.avg < normalMin;

    return (
      <View style={[
        styles.statCard,
        isNormal && styles.statCardNormal,
        isHigh && styles.statCardHigh,
        isLow && styles.statCardLow,
      ]}>
        <View style={styles.statHeader}>
          {icon}
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        
        <View style={styles.statContent}>
          <View style={styles.avgContainer}>
            <Text style={styles.avgLabel}>Average</Text>
            <Text style={[
              styles.avgValue,
              isNormal && styles.valueNormal,
              isHigh && styles.valueHigh,
              isLow && styles.valueLow,
            ]}>
              {avg}
              <Text style={styles.unit}> {unit}</Text>
            </Text>
          </View>

          <View style={styles.rangeContainer}>
            <View style={styles.rangeItem}>
              <TrendingDown size={16} color="#6b7280" />
              <Text style={styles.rangeLabel}>Min</Text>
              <Text style={styles.rangeValue}>{min} {unit}</Text>
            </View>
            <View style={styles.rangeDivider} />
            <View style={styles.rangeItem}>
              <TrendingUp size={16} color="#6b7280" />
              <Text style={styles.rangeLabel}>Max</Text>
              <Text style={styles.rangeValue}>{max} {unit}</Text>
            </View>
          </View>

          {!isNormal && (
            <View style={[
              styles.statusBadge,
              isHigh && styles.statusHigh,
              isLow && styles.statusLow,
            ]}>
              <Text style={styles.statusText}>
                {isHigh ? 'Above Normal' : 'Below Normal'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading && !statistics) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  const currentStats = statistics?.[selectedPeriod];
  const recordCount = currentStats?.count || 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Health Statistics</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['day', 'week', 'month'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive,
              ]}
            >
              {period === 'day' ? 'Past 24h' : period === 'week' ? 'Past Week' : 'Past Month'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Records Count */}
      <View style={styles.recordsCount}>
        <ActivityIcon size={16} color="#6b7280" />
        <Text style={styles.recordsText}>
          {recordCount} {recordCount === 1 ? 'reading' : 'readings'} recorded
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />
        }
      >
        {recordCount === 0 ? (
          <View style={styles.emptyContainer}>
            <Minus size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Data Available</Text>
            <Text style={styles.emptyText}>
              No vital signs recorded in this period.{'\n'}
              Make sure your device is connected and active.
            </Text>
          </View>
        ) : (
          <>
            {renderStatCard(
              'Heart Rate',
              <Heart size={24} color="#ef4444" />,
              currentStats?.heartRate,
              'bpm',
              [60, 100]
            )}

            {renderStatCard(
              'Temperature',
              <Thermometer size={24} color="#f59e0b" />,
              currentStats?.temperature,
              '°C',
              [36.1, 37.2]
            )}

            {renderStatCard(
              'Blood Oxygen (SpO₂)',
              <Droplet size={24} color="#3b82f6" />,
              currentStats?.spo2,
              '%',
              [95, 100]
            )}

            {currentStats?.bloodPressure?.systolic?.avg && (
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <ActivityIcon size={24} color="#8b5cf6" />
                  <Text style={styles.statTitle}>Blood Pressure</Text>
                </View>
                
                <View style={styles.statContent}>
                  <View style={styles.bpContainer}>
                    <View style={styles.bpItem}>
                      <Text style={styles.bpLabel}>Systolic (Avg)</Text>
                      <Text style={styles.avgValue}>
                        {currentStats.bloodPressure.systolic.avg.toFixed(0)}
                        <Text style={styles.unit}> mmHg</Text>
                      </Text>
                    </View>
                    <View style={styles.bpDivider} />
                    <View style={styles.bpItem}>
                      <Text style={styles.bpLabel}>Diastolic (Avg)</Text>
                      <Text style={styles.avgValue}>
                        {currentStats.bloodPressure.diastolic.avg.toFixed(0)}
                        <Text style={styles.unit}> mmHg</Text>
                      </Text>
                    </View>
                  </View>

                  <View style={styles.rangeContainer}>
                    <View style={styles.rangeItem}>
                      <Text style={styles.rangeLabel}>Sys Range</Text>
                      <Text style={styles.rangeValue}>
                        {currentStats.bloodPressure.systolic.min.toFixed(0)} - {currentStats.bloodPressure.systolic.max.toFixed(0)} mmHg
                      </Text>
                    </View>
                    <View style={styles.rangeDivider} />
                    <View style={styles.rangeItem}>
                      <Text style={styles.rangeLabel}>Dia Range</Text>
                      <Text style={styles.rangeValue}>
                        {currentStats.bloodPressure.diastolic.min.toFixed(0)} - {currentStats.bloodPressure.diastolic.max.toFixed(0)} mmHg
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
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
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#0d9488',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  recordsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f0fdfa',
    gap: 6,
  },
  recordsText: {
    fontSize: 13,
    color: '#0f766e',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  statCardNormal: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  statCardHigh: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  statCardLow: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statContent: {
    gap: 12,
  },
  avgContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  avgLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  avgValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  valueNormal: {
    color: '#16a34a',
  },
  valueHigh: {
    color: '#dc2626',
  },
  valueLow: {
    color: '#2563eb',
  },
  unit: {
    fontSize: 16,
    fontWeight: '400',
    color: '#9ca3af',
  },
  rangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  rangeItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  rangeDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  rangeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusHigh: {
    backgroundColor: '#fee2e2',
  },
  statusLow: {
    backgroundColor: '#dbeafe',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#991b1b',
  },
  bpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  bpItem: {
    flex: 1,
    alignItems: 'center',
  },
  bpLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  bpDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  noDataText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
