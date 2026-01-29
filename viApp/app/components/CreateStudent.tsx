import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { ChevronLeft, UserPlus, Calendar, ChevronDown, Eye, EyeOff } from 'lucide-react-native';
import { adminService } from '../../src/services/api';

interface CreateStudentProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function CreateStudent({ onBack, onSuccess }: CreateStudentProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    birthdate: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    gradeLevel: '',
    section: '',
    contactNumber: '',
    guardianName: '',
    guardianContact: '',
    weight: '',
    height: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState({ year: '2008', month: '01', day: '01' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const fieldRefs = useRef<{ [key: string]: View | null }>({});

  // Grade levels for high school and senior high school
  const gradeLevels = [
    'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12'
  ];

  // Sections
  const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name should only contain letters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name should only contain letters';
    }

    if (!formData.birthdate) {
      newErrors.birthdate = 'Date of birth is required';
    } else {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.birthdate)) {
        newErrors.birthdate = 'Date format must be YYYY-MM-DD';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.gradeLevel.trim()) {
      newErrors.gradeLevel = 'Grade level is required';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^(\+63|0)?[9]\d{9}$/.test(formData.contactNumber.replace(/[\s-]/g, ''))) {
      newErrors.contactNumber = 'Invalid Philippine phone number (e.g., +639123456789 or 09123456789)';
    }

    if (!formData.guardianName.trim()) {
      newErrors.guardianName = 'Guardian name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.guardianName)) {
      newErrors.guardianName = 'Guardian name should only contain letters';
    }

    if (!formData.guardianContact.trim()) {
      newErrors.guardianContact = 'Guardian contact is required';
    } else if (!/^(\+63|0)?[9]\d{9}$/.test(formData.guardianContact.replace(/[\s-]/g, ''))) {
      newErrors.guardianContact = 'Invalid Philippine phone number (e.g., +639123456789 or 09123456789)';
    }

    setErrors(newErrors);
    
    // Auto-scroll to first error
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      setTimeout(() => {
        if (fieldRefs.current[firstErrorField]) {
          fieldRefs.current[firstErrorField]?.measureLayout(
            scrollViewRef.current as any,
            (x, y) => {
              scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
            },
            () => {}
          );
        }
      }, 100);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Clean phone numbers - remove spaces and keep only digits and +
      const cleanContactNumber = formData.contactNumber.replace(/[\s-]/g, '');
      const cleanGuardianContact = formData.guardianContact.replace(/[\s-]/g, '');

      await adminService.createStudent({
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        birthdate: formData.birthdate,
        gender: formData.gender,
        gradeLevel: formData.gradeLevel.trim(),
        section: formData.section.trim() || undefined,
        contactNumber: cleanContactNumber,
        guardianName: formData.guardianName.trim(),
        guardianContact: cleanGuardianContact,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
      });

      Alert.alert(
        'Success',
        'Student created successfully',
        [
          {
            text: 'OK',
            onPress: onSuccess,
          },
        ]
      );
    } catch (error: any) {
      console.error('Create student error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      
      // Extract the most helpful error message
      let errorMessage = 'Failed to create student';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    // Format phone numbers as user types
    if (field === 'contactNumber' || field === 'guardianContact') {
      // Remove all non-digit characters except +
      let cleaned = value.replace(/[^\d+]/g, '');
      
      // If it starts with 0, keep it
      // If it starts with +63, keep it
      // Otherwise, just store digits
      if (cleaned.startsWith('0') && cleaned.length > 1) {
        // Format: 0912 345 6789
        if (cleaned.length > 4 && cleaned.length <= 7) {
          cleaned = cleaned.slice(0, 4) + ' ' + cleaned.slice(4);
        } else if (cleaned.length > 7) {
          cleaned = cleaned.slice(0, 4) + ' ' + cleaned.slice(4, 7) + ' ' + cleaned.slice(7, 11);
        }
      } else if (cleaned.startsWith('+63')) {
        // Format: +63 912 345 6789
        cleaned = cleaned.slice(0, 3);
        if (value.length > 3) {
          const digits = value.slice(3).replace(/\D/g, '');
          if (digits.length > 0) {
            cleaned += ' ' + digits.slice(0, 3);
          }
          if (digits.length > 3) {
            cleaned += ' ' + digits.slice(3, 6);
          }
          if (digits.length > 6) {
            cleaned += ' ' + digits.slice(6, 10);
          }
        }
      }
      
      setFormData(prev => ({ ...prev, [field]: cleaned }));
    } else if (field === 'firstName' || field === 'lastName' || field === 'guardianName') {
      // Only allow letters and spaces for names
      const cleaned = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData(prev => ({ ...prev, [field]: cleaned }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Student</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView ref={scrollViewRef} style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.form}>
            <View style={styles.formGroup} ref={(ref) => fieldRefs.current['username'] = ref}>
              <Text style={styles.label}>
                Username <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.username && styles.inputError]}
                value={formData.username}
                onChangeText={(value) => updateField('username', value)}
                placeholder="e.g., john.doe"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
              />
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
            </View>

            <View style={styles.formGroup} ref={(ref) => fieldRefs.current['email'] = ref}>
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

            <View style={styles.formGroup} ref={(ref) => fieldRefs.current['password'] = ref}>
              <Text style={styles.label}>
                Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                  value={formData.password}
                  onChangeText={(value) => updateField('password', value)}
                  placeholder="Min. 8 characters"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#9ca3af" />
                  ) : (
                    <Eye size={20} color="#9ca3af" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.formGroup} ref={(ref) => fieldRefs.current['confirmPassword'] = ref}>
              <Text style={styles.label}>
                Confirm Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, errors.confirmPassword && styles.inputError]}
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateField('confirmPassword', value)}
                  placeholder="Re-enter password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#9ca3af" />
                  ) : (
                    <Eye size={20} color="#9ca3af" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
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
              <TouchableOpacity
                style={[styles.input, styles.datePickerButton, errors.birthdate && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={20} color="#9ca3af" />
                <Text style={[styles.datePickerText, formData.birthdate && styles.datePickerTextSelected]}>
                  {formData.birthdate || 'Select date of birth'}
                </Text>
              </TouchableOpacity>
              {errors.birthdate && <Text style={styles.errorText}>{errors.birthdate}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Gender <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.genderButtons}>
                {(['MALE', 'FEMALE'] as const).map((gender) => (
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
              {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>
                  Grade Level <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.input, styles.dropdownButton, errors.gradeLevel && styles.inputError]}
                  onPress={() => setShowGradePicker(true)}
                >
                  <Text style={[styles.dropdownText, formData.gradeLevel && styles.dropdownTextSelected]}>
                    {formData.gradeLevel || 'Grade'}
                  </Text>
                  <ChevronDown size={20} color="#9ca3af" />
                </TouchableOpacity>
                {errors.gradeLevel && <Text style={styles.errorText}>{errors.gradeLevel}</Text>}
              </View>

              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>Section</Text>
                <TouchableOpacity
                  style={[styles.input, styles.dropdownButton]}
                  onPress={() => setShowSectionPicker(true)}
                >
                  <Text style={[styles.dropdownText, formData.section && styles.dropdownTextSelected]}>
                    {formData.section || 'Section'}
                  </Text>
                  <ChevronDown size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Contact Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.contactNumber && styles.inputError]}
                value={formData.contactNumber}
                onChangeText={(value) => updateField('contactNumber', value)}
                placeholder="e.g., +63 912 345 6789"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
              />
              {errors.contactNumber && <Text style={styles.errorText}>{errors.contactNumber}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Guardian Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.guardianName && styles.inputError]}
                value={formData.guardianName}
                onChangeText={(value) => updateField('guardianName', value)}
                placeholder="e.g., Maria Doe"
                placeholderTextColor="#9ca3af"
              />
              {errors.guardianName && <Text style={styles.errorText}>{errors.guardianName}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Guardian Contact <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.guardianContact && styles.inputError]}
                value={formData.guardianContact}
                onChangeText={(value) => updateField('guardianContact', value)}
                placeholder="e.g., +63 912 345 6789"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
              />
              {errors.guardianContact && <Text style={styles.errorText}>{errors.guardianContact}</Text>}
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.weight}
                  onChangeText={(value) => updateField('weight', value)}
                  placeholder="e.g., 52"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.height}
                  onChangeText={(value) => updateField('height', value)}
                  placeholder="e.g., 160"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onBack}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <UserPlus size={20} color="#ffffff" />
                <Text style={styles.createButtonText}>Create</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Grade Level Picker Modal */}
      <Modal
        visible={showGradePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGradePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGradePicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Grade Level</Text>
            <ScrollView style={styles.modalScrollView}>
              {gradeLevels.map((grade) => (
                <TouchableOpacity
                  key={grade}
                  style={[
                    styles.modalOption,
                    formData.gradeLevel === grade && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    updateField('gradeLevel', grade);
                    setShowGradePicker(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    formData.gradeLevel === grade && styles.modalOptionTextSelected
                  ]}>
                    {grade}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Section Picker Modal */}
      <Modal
        visible={showSectionPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSectionPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSectionPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Section</Text>
            <ScrollView style={styles.modalScrollView}>
              {sections.map((section) => (
                <TouchableOpacity
                  key={section}
                  style={[
                    styles.modalOption,
                    formData.section === section && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    updateField('section', section);
                    setShowSectionPicker(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    formData.section === section && styles.modalOptionTextSelected
                  ]}>
                    {section}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date of Birth</Text>
            
            <View style={styles.datePickerContainer}>
              {/* Year Picker */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Year</Text>
                <ScrollView style={styles.dateScrollView}>
                  {Array.from({ length: 30 }, (_, i) => 2000 + i).reverse().map((year) => (
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
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={() => {
                  updateField('birthdate', `${tempDate.year}-${tempDate.month}-${tempDate.day}`);
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.modalConfirmButtonText}>Confirm</Text>
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 14,
    padding: 4,
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
  createButton: {
    backgroundColor: '#14b8a6',
  },
  createButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  dropdownTextSelected: {
    color: '#111827',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  datePickerText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  datePickerTextSelected: {
    color: '#111827',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  modalOptionSelected: {
    backgroundColor: '#14b8a6',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#111827',
  },
  modalOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  datePickerContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
    backgroundColor: '#14b8a6',
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
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f3f4f6',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalConfirmButton: {
    backgroundColor: '#14b8a6',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
