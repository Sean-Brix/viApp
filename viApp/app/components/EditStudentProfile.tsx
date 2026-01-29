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
import { ChevronLeft, Save, Calendar, User, Phone, Ruler, Weight } from 'lucide-react-native';
import { studentService } from '../../src/services/api';

interface EditStudentProfileProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  gradeLevel: string;
  section?: string;
  height?: string;
  weight?: string;
  contactNumber?: string;
}

export function EditStudentProfile({ onBack, onSuccess }: EditStudentProfileProps) {
  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    gradeLevel: '',
    section: '',
    height: '',
    weight: '',
    contactNumber: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await studentService.getProfile();
      
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        dateOfBirth: profile.birthdate ? new Date(profile.birthdate).toISOString().split('T')[0] : '',
        gender: profile.gender || 'MALE',
        gradeLevel: profile.gradeLevel || '',
        section: profile.section || '',
        height: profile.height ? profile.height.toString() : '',
        weight: profile.weight ? profile.weight.toString() : '',
        contactNumber: profile.user?.contactNumber || '',
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load profile');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.gradeLevel.trim()) {
      newErrors.gradeLevel = 'Grade level is required';
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
      await studentService.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        birthdate: formData.dateOfBirth,
        gender: formData.gender,
        gradeLevel: formData.gradeLevel,
        section: formData.section?.trim() || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        contactNumber: formData.contactNumber?.trim() || undefined,
      });

      Alert.alert(
        'Success',
        'Profile updated successfully',
        [
          {
            text: 'OK',
            onPress: onSuccess,
          },
        ]
      );
    } catch (error: any) {
      console.error('Update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof ProfileData, value: string) => {
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
        <Text style={styles.loadingText}>Loading your profile...</Text>
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
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
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

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>
                  Grade Level <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.gradeLevel && styles.inputError]}
                  value={formData.gradeLevel}
                  onChangeText={(value) => updateField('gradeLevel', value)}
                  placeholder="e.g., Grade 10"
                  placeholderTextColor="#9ca3af"
                />
                {errors.gradeLevel && <Text style={styles.errorText}>{errors.gradeLevel}</Text>}
              </View>

              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>Section</Text>
                <TextInput
                  style={styles.input}
                  value={formData.section}
                  onChangeText={(value) => updateField('section', value)}
                  placeholder="e.g., A"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.height}
                  onChangeText={(value) => updateField('height', value)}
                  placeholder="e.g., 165"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.weight}
                  onChangeText={(value) => updateField('weight', value)}
                  placeholder="e.g., 55"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
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
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onBack}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Save size={18} color="#ffffff" />
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
    fontSize: 16,
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
    fontSize: 20,
    fontWeight: '700',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#ffffff',
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
    paddingLeft: 40,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  genderButtonActive: {
    borderColor: '#14b8a6',
    backgroundColor: '#f0fdfa',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  genderButtonTextActive: {
    color: '#14b8a6',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#14b8a6',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
