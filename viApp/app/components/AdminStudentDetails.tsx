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
  Modal,
  TextInput,
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
  FileText,
  Plus,
  Edit,
  Trash2,
  X,
} from 'lucide-react-native';
import { adminService } from '../../src/services/api';
import { websocketService } from '../../src/services/websocket';

interface AdminStudentDetailsProps {
  studentId: string;
  onBack: () => void;
}

export function AdminStudentDetails({ studentId, onBack }: AdminStudentDetailsProps) {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [showAddMedical, setShowAddMedical] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState({ year: '2024', month: '01', day: '01' });
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [medicalForm, setMedicalForm] = useState({
    type: 'CONDITION',
    description: '',
    diagnosedAt: new Date().toISOString().split('T')[0], // Default to today
    notes: '',
  });

  const medicalTypes = ['CONDITION', 'INJURY', 'MEDICATION', 'ALLERGY'];

  useEffect(() => {
    loadStudentDetails();
    loadMedicalHistory();

    // Set up 5-second polling for silent background updates
    const pollingInterval = setInterval(() => {
      console.log('🔄 Polling: Updating student details silently...');
      loadStudentDetails(true); // Silent update - no loading spinner
    }, 5000); // 5 seconds

    // Subscribe to real-time vital signs updates
    const unsubscribeVitals = websocketService.onVitalSignsUpdate((data) => {
      // Only update if this is for the current student
      if (data.studentId === studentId) {
        console.log('📊 Real-time vital signs update for student:', studentId);
        // Update the student's latest vital signs
        setStudent((prevStudent: any) => {
          if (!prevStudent) return prevStudent;
          
          return {
            ...prevStudent,
            vitalSigns: data.data ? [data.data, ...(prevStudent.vitalSigns || [])] : prevStudent.vitalSigns,
          };
        });
      }
    });

    // Subscribe to real-time alerts
    const unsubscribeAlerts = websocketService.onAlert((data) => {
      if (data.studentId === studentId) {
        console.log('🚨 Real-time alert for student:', studentId);
        // Optionally show an alert notification
        Alert.alert('New Alert', `Alert received for ${student?.firstName || 'student'}`);
        // Reload to get updated alerts
        loadStudentDetails();
      }
    });

    // Cleanup subscriptions and polling on unmount
    return () => {
      clearInterval(pollingInterval);
      unsubscribeVitals();
      unsubscribeAlerts();
    };
  }, [studentId]);

  const loadStudentDetails = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await adminService.getStudentById(studentId, true);
      setStudent(data);
    } catch (error: any) {
      console.error('Failed to load student details:', error);
      if (!silent) {
        Alert.alert('Error', error.message || 'Failed to load student details');
      }
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMedicalHistory = async () => {
    try {
      const history = await adminService.getMedicalHistory(studentId);
      setMedicalHistory(history);
    } catch (error: any) {
      console.error('Failed to load medical history:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStudentDetails();
    loadMedicalHistory();
  };

  const handleAddMedical = async () => {
    if (!medicalForm.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    try {
      if (editingRecord) {
        // Update existing record
        await adminService.updateMedicalHistory(editingRecord.id, {
          type: medicalForm.type,
          description: medicalForm.description.trim(),
          diagnosedAt: medicalForm.diagnosedAt,
          notes: medicalForm.notes.trim() || undefined,
        });
        Alert.alert('Success', 'Medical history updated successfully');
      } else {
        // Add new record - use today's date if not set
        const diagnosedDate = medicalForm.diagnosedAt || new Date().toISOString().split('T')[0];
        await adminService.addMedicalHistory(studentId, {
          type: medicalForm.type,
          description: medicalForm.description.trim(),
          diagnosedAt: diagnosedDate,
          notes: medicalForm.notes.trim() || undefined,
        });
        Alert.alert('Success', 'Medical history added successfully');
      }
      
      setShowAddMedical(false);
      setEditingRecord(null);
      setMedicalForm({ 
        type: 'CONDITION', 
        description: '', 
        diagnosedAt: new Date().toISOString().split('T')[0], 
        notes: '' 
      });
      loadMedicalHistory();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save medical history');
    }
  };

  const handleDeleteMedical = (recordId: string, description: string) => {
    Alert.alert(
      'Delete Record',
      `Are you sure you want to delete this medical record: "${description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteMedicalHistory(recordId);
              Alert.alert('Success', 'Medical history deleted');
              loadMedicalHistory();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete record');
            }
          },
        },
      ]
    );
  };

  const handleEditMedical = (record: any) => {
    setEditingRecord(record);
    setMedicalForm({
      type: record.type,
      description: record.description,
      diagnosedAt: record.diagnosedAt ? new Date(record.diagnosedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: record.notes || '',
    });
    setShowAddMedical(true);
  };

  const getMedicalTypeColor = (type: string) => {
    switch (type) {
      case 'CONDITION':
        return { bg: '#fef3c7', text: '#f59e0b' };
      case 'INJURY':
        return { bg: '#fee2e2', text: '#dc2626' };
      case 'MEDICATION':
        return { bg: '#dbeafe', text: '#3b82f6' };
      case 'ALLERGY':
        return { bg: '#ede9fe', text: '#8b5cf6' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280' };
    }
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

        {/* Medical History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medical History</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddMedical(true)}
            >
              <Plus size={20} color="#ffffff" />
              <Text style={styles.addButtonText}>Add Record</Text>
            </TouchableOpacity>
          </View>

          {medicalHistory.length > 0 ? (
            medicalHistory.map((record: any, index: number) => (
              <TouchableOpacity 
                key={record.id} 
                style={[styles.medicalCard, index > 0 && { marginTop: 12 }]}
                onPress={() => handleEditMedical(record)}
                activeOpacity={0.7}
              >
                <View style={styles.medicalHeader}>
                  <View style={[styles.medicalTypeBadge, { 
                    backgroundColor: getMedicalTypeColor(record.type).bg 
                  }]}>
                    <Text style={[styles.medicalTypeText, { 
                      color: getMedicalTypeColor(record.type).text 
                    }]}>
                      {record.type}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteMedical(record.id, record.description);
                    }}
                    style={styles.deleteIconButton}
                  >
                    <Trash2 size={18} color="#dc2626" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.medicalDescription}>{record.description}</Text>

                {record.diagnosedAt && (
                  <View style={styles.medicalInfo}>
                    <Calendar size={14} color="#6b7280" />
                    <Text style={styles.medicalInfoText}>
                      Diagnosed: {new Date(record.diagnosedAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                {record.notes && (
                  <View style={styles.medicalNotes}>
                    <FileText size={14} color="#6b7280" />
                    <Text style={styles.medicalNotesText}>{record.notes}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyMedical}>
              <FileText size={32} color="#d1d5db" />
              <Text style={styles.emptyMedicalText}>No medical history recorded</Text>
              <Text style={styles.emptyMedicalSubtext}>
                Add past illnesses, conditions, or allergies
              </Text>
            </View>
          )}
        </View>

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

      {/* Add Medical History Modal */}
      <Modal
        visible={showAddMedical}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddMedical(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingRecord ? 'Edit Medical History' : 'Add Medical History'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowAddMedical(false);
                setEditingRecord(null);
                setMedicalForm({ 
                  type: 'CONDITION', 
                  description: '', 
                  diagnosedAt: new Date().toISOString().split('T')[0], 
                  notes: '' 
                });
              }}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Type *</Text>
                <View style={styles.typeButtons}>
                  {medicalTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        medicalForm.type === type && styles.typeButtonActive,
                        { backgroundColor: getMedicalTypeColor(type).bg },
                      ]}
                      onPress={() => setMedicalForm({ ...medicalForm, type })}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          { color: getMedicalTypeColor(type).text },
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={medicalForm.description}
                  onChangeText={(text) => setMedicalForm({ ...medicalForm, description: text })}
                  placeholder="E.g., Asthma, Heart condition, etc."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Diagnosed Date</Text>
                <TouchableOpacity
                  style={[styles.input, styles.datePickerButton]}
                  onPress={() => {
                    const date = medicalForm.diagnosedAt ? new Date(medicalForm.diagnosedAt) : new Date();
                    setTempDate({
                      year: date.getFullYear().toString(),
                      month: (date.getMonth() + 1).toString().padStart(2, '0'),
                      day: date.getDate().toString().padStart(2, '0'),
                    });
                    setShowDatePicker(true);
                  }}
                >
                  <Calendar size={20} color="#9ca3af" />
                  <Text style={[styles.datePickerText, medicalForm.diagnosedAt && styles.datePickerTextSelected]}>
                    {medicalForm.diagnosedAt ? new Date(medicalForm.diagnosedAt).toLocaleDateString() : 'Select date'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Additional Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={medicalForm.notes}
                  onChangeText={(text) => setMedicalForm({ ...medicalForm, notes: text })}
                  placeholder="Any additional information..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddMedical(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddMedical}
              >
                <Text style={styles.saveButtonText}>
                  {editingRecord ? 'Update Record' : 'Add Record'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerContent}>
            <Text style={styles.modalTitle}>Select Diagnosed Date</Text>
            
            <View style={styles.datePickerContainer}>
              {/* Year Picker */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Year</Text>
                <ScrollView style={styles.dateScrollView}>
                  {Array.from({ length: 50 }, (_, i) => 1980 + i).reverse().map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.dateOption,
                        tempDate.year === year.toString() && styles.dateOptionSelected
                      ]}
                      onPress={() => setTempDate(prev => ({ ...prev, year: year.toString() }))}
                    >
                      <Text style={[
                        styles.dateOptionText,
                        tempDate.year === year.toString() && styles.dateOptionTextSelected
                      ]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month Picker */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Month</Text>
                <ScrollView style={styles.dateScrollView}>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = (i + 1).toString().padStart(2, '0');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.dateOption,
                          tempDate.month === month && styles.dateOptionSelected
                        ]}
                        onPress={() => setTempDate(prev => ({ ...prev, month }))}
                      >
                        <Text style={[
                          styles.dateOptionText,
                          tempDate.month === month && styles.dateOptionTextSelected
                        ]}>
                          {monthNames[i]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Day Picker */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Day</Text>
                <ScrollView style={styles.dateScrollView}>
                  {Array.from({ length: 31 }, (_, i) => {
                    const day = (i + 1).toString().padStart(2, '0');
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dateOption,
                          tempDate.day === day && styles.dateOptionSelected
                        ]}
                        onPress={() => setTempDate(prev => ({ ...prev, day }))}
                      >
                        <Text style={[
                          styles.dateOptionText,
                          tempDate.day === day && styles.dateOptionTextSelected
                        ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  setMedicalForm({ 
                    ...medicalForm, 
                    diagnosedAt: `${tempDate.year}-${tempDate.month}-${tempDate.day}` 
                  });
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.saveButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d9488',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  medicalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  medicalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicalTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  medicalTypeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  deleteIconButton: {
    padding: 4,
  },
  medicalDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  medicalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  medicalInfoText: {
    fontSize: 13,
    color: '#6b7280',
  },
  medicalNotes: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  medicalNotesText: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  emptyMedical: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyMedicalText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  emptyMedicalSubtext: {
    marginTop: 4,
    fontSize: 13,
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    borderColor: '#0d9488',
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#0d9488',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  datePickerText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  datePickerTextSelected: {
    color: '#111827',
  },
  datePickerContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
    marginVertical: 'auto',
  },
  datePickerContainer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  datePickerColumn: {
    flex: 1,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  dateScrollView: {
    maxHeight: 200,
  },
  dateOption: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 4,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  dateOptionSelected: {
    backgroundColor: '#0d9488',
  },
  dateOptionText: {
    fontSize: 14,
    color: '#111827',
  },
  dateOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
