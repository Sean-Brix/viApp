import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import { X, Search, User } from 'lucide-react-native';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
  section?: string;
  user?: {
    username: string;
  };
}

interface StudentSelectionModalProps {
  visible: boolean;
  students: Student[];
  deviceId: string;
  onSelect: (studentId: string) => void;
  onClose: () => void;
}

export function StudentSelectionModal({
  visible,
  students,
  deviceId,
  onSelect,
  onClose,
}: StudentSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Debug logging
  React.useEffect(() => {
    if (visible) {
      console.log('Modal opened - Students count:', students.length);
      console.log('Students data:', JSON.stringify(students.slice(0, 2), null, 2));
    }
  }, [visible, students]);

  const filteredStudents = students.filter((student) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.user?.username.toLowerCase().includes(searchLower) ||
      student.gradeLevel.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Student</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Assign device {deviceId} to a student
          </Text>

          {/* Search */}
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

          {/* Students List */}
          <ScrollView style={styles.studentsList}>
            {filteredStudents.length === 0 ? (
              <View style={styles.emptyState}>
                <User size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No students found' : 'No available students'}
                </Text>
              </View>
            ) : (
              filteredStudents.map((student) => (
                <TouchableOpacity
                  key={student.id}
                  style={styles.studentItem}
                  onPress={() => {
                    onSelect(student.id);
                    onClose();
                  }}
                >
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentAvatarText}>
                      {student.firstName[0]}{student.lastName[0]}
                    </Text>
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>
                      {student.firstName} {student.lastName}
                    </Text>
                    <Text style={styles.studentDetails}>
                      {student.gradeLevel}
                      {student.section ? ` - ${student.section}` : ''}
                      {student.user?.username ? ` • @${student.user.username}` : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  studentsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    minHeight: 200,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 8,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
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
    fontSize: 13,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9ca3af',
  },
});
