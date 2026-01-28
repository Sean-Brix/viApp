import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, Save, Calendar } from 'lucide-react-native';
import { adminService } from '../../src/services/api';

interface EditStudentProps {
  studentId: string;
  onBack: () => void;
  onSuccess: () => void;
}

interface StudentData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  contactNumber?: string;
  address?: string;
  guardianName?: string;
  guardianContact?: string;
}

export function EditStudent({ studentId, onBack, onSuccess }: EditStudentProps) {
  const [formData, setFormData] = useState<StudentData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    contactNumber: '',
    address: '',
    guardianName: '',
    guardianContact: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      const student = await adminService.getStudentById(studentId);
      
      setFormData({
        username: student.username,
        email: student.email,
        firstName: student.student.firstName,
        lastName: student.student.lastName,
        dateOfBirth: student.student.dateOfBirth.split('T')[0], // Convert to YYYY-MM-DD
        gender: student.student.gender,
        contactNumber: student.student.contactNumber || '',
        address: student.student.address || '',
        guardianName: student.student.guardianName || '',
        guardianContact: student.student.guardianContact || '',
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load student data');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.dateOfBirth)) {
        newErrors.dateOfBirth = 'Date format must be YYYY-MM-DD';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      await adminService.updateStudent(studentId, {
        email: formData.email.trim().toLowerCase(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        contactNumber: formData.contactNumber.trim() || undefined,
        address: formData.address.trim() || undefined,
        guardianName: formData.guardianName.trim() || undefined,
        guardianContact: formData.guardianContact.trim() || undefined,
      });

      Alert.alert(
        'Success',
        'Student updated successfully',
        [
          {
            text: 'OK',
            onPress: onSuccess,
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof StudentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14b8a6" />
        <Text style={styles.loadingText}>Loading student data...</Text>
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
        <Text style={styles.title}>Edit Student</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Account Information (Read-only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.username}
                editable={false}
              />
              <Text style={styles.hint}>Username cannot be changed</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                placeholder="john.doe@example.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.form}>
            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>
                  First Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.firstName && styles.inputError]}
                  value={formData.firstName}
                  onChangeText={(value) => updateField('firstName', value)}
                  placeholder="John"
                  placeholderTextColor="#9ca3af"
                />
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>

              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>
                  Last Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.lastName && styles.inputError]}
                  value={formData.lastName}
                  onChangeText={(value) => updateField('lastName', value)}
                  placeholder="Doe"
                  placeholderTextColor="#9ca3af"
                />
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Date of Birth <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWithIcon}>
                <Calendar size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIconPadding, errors.dateOfBirth && styles.inputError]}
                  value={formData.dateOfBirth}
                  onChangeText={(value) => updateField('dateOfBirth', value)}
                  placeholder="YYYY-MM-DD (e.g., 2005-01-15)"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderButtons}>
                {(['MALE', 'FEMALE', 'OTHER'] as const).map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderButton,
                      formData.gender === gender && styles.genderButtonActive,
                    ]}
                    onPress={() => updateField('gender', gender)}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        formData.gender === gender && styles.genderButtonTextActive,
                      ]}
                    >
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contact Number</Text>
              <TextInput
                style={styles.input}
                value={formData.contactNumber}
                onChangeText={(value) => updateField('contactNumber', value)}
                placeholder="e.g., +63 912 345 6789"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(value) => updateField('address', value)}
                placeholder="Enter full address"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>

        {/* Guardian Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guardian Information</Text>
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Guardian Name</Text>
              <TextInput
                style={styles.input}
                value={formData.guardianName}
                onChangeText={(value) => updateField('guardianName', value)}
                placeholder="e.g., Jane Doe"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Guardian Contact</Text>
              <TextInput
                style={styles.input}
                value={formData.guardianContact}
                onChangeText={(value) => updateField('guardianContact', value)}
                placeholder="e.g., +63 912 345 6789"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onBack}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Save size={20} color="#ffffff" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
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
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formGroup: {
    marginBottom: 20,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
    zIndex: 1,
  },
  inputWithIconPadding: {
    paddingLeft: 44,
  },
  textArea: {
    height: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  genderButtonActive: {
    backgroundColor: '#14b8a6',
    borderColor: '#14b8a6',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  genderButtonTextActive: {
    color: '#ffffff',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    backgroundColor: '#14b8a6',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
