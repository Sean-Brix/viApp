import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import { ArrowLeft, Plus, Calendar, FileText, Pill, Edit, Trash2 } from 'lucide-react-native';
import studentService, { MedicalHistoryRecord } from '../../src/services/api/student.service';

interface StudentMedicalHistoryProps {
  onBack: () => void;
}

export function StudentMedicalHistory({ onBack }: StudentMedicalHistoryProps) {
  const [records, setRecords] = useState<MedicalHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState({ year: '2024', month: '01', day: '01' });
  const [editingRecord, setEditingRecord] = useState<MedicalHistoryRecord | null>(null);
  
  // Form state - matching admin side exactly
  const [medicalForm, setMedicalForm] = useState({
    type: 'CONDITION',
    description: '',
    diagnosedAt: new Date().toISOString().split('T')[0],
  });

  const medicalTypes = ['CONDITION', 'INJURY', 'MEDICATION', 'ALLERGY'];

  useEffect(() => {
    loadMedicalHistory();
  }, []);

  const loadMedicalHistory = async () => {
    try {
      setLoading(true);
      const data = await studentService.getMedicalHistory();
      setRecords(data);
    } catch (error) {
      console.error('Failed to load medical history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMedicalHistory();
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setMedicalForm({
      type: 'CONDITION',
      description: '',
      diagnosedAt: new Date().toISOString().split('T')[0],
    });
    setShowAddModal(true);
  };

  const handleEdit = (record: MedicalHistoryRecord) => {
    setEditingRecord(record);
    setMedicalForm({
      type: record.type,
      description: record.description,
      diagnosedAt: record.diagnosedAt ? record.diagnosedAt.split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    try {
      if (!medicalForm.description.trim()) {
        alert('Please enter a description');
        return;
      }

      if (editingRecord) {
        // Update existing record
        await studentService.updateMedicalHistory(editingRecord.id, {
          type: medicalForm.type,
          description: medicalForm.description.trim(),
          diagnosedAt: medicalForm.diagnosedAt,
        });
      } else {
        // Add new record - use today's date if not set
        const diagnosedDate = medicalForm.diagnosedAt || new Date().toISOString().split('T')[0];
        await studentService.addMedicalHistory({
          type: medicalForm.type,
          description: medicalForm.description.trim(),
          diagnosedAt: diagnosedDate,
        });
      }

      setShowAddModal(false);
      setEditingRecord(null);
      setMedicalForm({
        type: 'CONDITION',
        description: '',
        diagnosedAt: new Date().toISOString().split('T')[0],
      });
      loadMedicalHistory();
    } catch (error: any) {
      alert(error.message || 'Failed to save medical record');
    }
  };

  const handleDelete = async (id: string, description: string) => {
    Alert.alert(
      'Delete Record',
      `Are you sure you want to delete this record: "${description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await studentService.deleteMedicalHistory(id);
              loadMedicalHistory();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete record');
            }
          },
        },
      ]
    );
  };

  const getMedicalTypeColor = (type: string) => {
    switch (type) {
      case 'CONDITION':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'INJURY':
        return { bg: '#fee2e2', text: '#991b1b' };
      case 'MEDICATION':
        return { bg: '#e0e7ff', text: '#4338ca' };
      case 'ALLERGY':
        return { bg: '#fef3c7', text: '#92400e' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={styles.loadingText}>Loading medical history...</Text>
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
        <Text style={styles.headerTitle}>Medical History</Text>
        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No medical records yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first record</Text>
          </View>
        ) : (
          <View style={styles.recordsList}>
            {records.map((record) => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.dateContainer}>
                    <Calendar size={18} color="#0d9488" />
                    <Text style={styles.dateText}>{formatDate(record.diagnosedAt)}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity 
                      onPress={() => handleEdit(record)}
                      style={styles.actionButton}
                    >
                      <Edit size={18} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDelete(record.id, record.description)}
                      style={styles.actionButton}
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.recordContent}>
                  <View style={styles.recordRow}>
                    <FileText size={16} color="#6b7280" />
                    <View style={styles.recordInfo}>
                      <Text style={styles.recordLabel}>Type</Text>
                      <Text style={styles.recordValue}>{record.type}</Text>
                    </View>
                  </View>

                  <View style={styles.recordRow}>
                    <FileText size={16} color="#6b7280" />
                    <View style={styles.recordInfo}>
                      <Text style={styles.recordLabel}>Description</Text>
                      <Text style={styles.recordValue}>{record.description}</Text>
                    </View>
                  </View>

                  {record.notes && (
                    <View style={styles.recordRow}>
                      <FileText size={16} color="#6b7280" />
                      <View style={styles.recordInfo}>
                        <Text style={styles.recordLabel}>Notes</Text>
                        <Text style={styles.recordValue}>{record.notes}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingRecord ? 'Edit Medical Record' : 'Add Medical Record'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
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
                  style={[styles.formInput, styles.formTextArea]}
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
                  style={[styles.formInput, styles.datePickerButton]}
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

              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>
                    {editingRecord ? 'Update Record' : 'Add Record'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerModal}>
            <Text style={styles.datePickerTitle}>Select Date</Text>
            
            <View style={styles.dateInputs}>
              <View style={styles.dateInput}>
                <Text style={styles.dateInputLabel}>Year</Text>
                <TextInput
                  style={styles.dateInputField}
                  value={tempDate.year}
                  onChangeText={(text) => setTempDate({ ...tempDate, year: text })}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
              <View style={styles.dateInput}>
                <Text style={styles.dateInputLabel}>Month</Text>
                <TextInput
                  style={styles.dateInputField}
                  value={tempDate.month}
                  onChangeText={(text) => setTempDate({ ...tempDate, month: text.padStart(2, '0') })}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              <View style={styles.dateInput}>
                <Text style={styles.dateInputLabel}>Day</Text>
                <TextInput
                  style={styles.dateInputField}
                  value={tempDate.day}
                  onChangeText={(text) => setTempDate({ ...tempDate, day: text.padStart(2, '0') })}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
            </View>

            <View style={styles.datePickerActions}>
              <TouchableOpacity
                style={[styles.datePickerButton, styles.datePickerCancelButton]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.datePickerButton, styles.datePickerSaveButton]}
                onPress={() => {
                  const dateStr = `${tempDate.year}-${tempDate.month}-${tempDate.day}`;
                  setMedicalForm({ ...medicalForm, diagnosedAt: dateStr });
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.datePickerSaveText}>Set Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#0d9488',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  recordsList: {
    padding: 16,
  },
  recordCard: {
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
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0d9488',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  recordContent: {
    gap: 12,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  recordValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  formTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
    fontSize: 14,
    fontWeight: '600',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  datePickerText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  datePickerTextSelected: {
    color: '#111827',
  },
  datePickerModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  dateInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateInput: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  dateInputField: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
  },
  datePickerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  datePickerButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerCancelButton: {
    backgroundColor: '#f3f4f6',
  },
  datePickerSaveButton: {
    backgroundColor: '#0d9488',
  },
  datePickerCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  datePickerSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0d9488',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
