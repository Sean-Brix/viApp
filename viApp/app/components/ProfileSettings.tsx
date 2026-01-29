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
import { 
  ChevronLeft, 
  Save, 
  Calendar, 
  User, 
  Phone, 
  Ruler, 
  Weight, 
  Mail,
  UserCircle,
  Users,
  Plus,
  Trash2,
  Star,
} from 'lucide-react-native';
import studentService, { EmergencyContact } from '../../src/services/api/student.service';

interface ProfileSettingsProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  gradeLevel: string;
  section?: string;
  height?: string;
  weight?: string;
  contactNumber?: string;
  email?: string;
  username?: string;
}

interface EmergencyContactForm {
  name: string;
  relationship: string;
  phoneNumber: string;
  isPrimary: boolean;
}

export function ProfileSettings({ onBack, onSuccess }: ProfileSettingsProps) {
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
    email: '',
    username: '',
  });
  
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState<EmergencyContactForm>({
    name: '',
    relationship: '',
    phoneNumber: '',
    isPrimary: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profile, contacts] = await Promise.all([
        studentService.getProfile(),
        studentService.getEmergencyContacts(),
      ]);
      
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        dateOfBirth: profile.birthdate ? new Date(profile.birthdate).toISOString().split('T')[0] : '',
        gender: (profile.gender === 'MALE' || profile.gender === 'FEMALE') ? profile.gender : 'MALE',
        gradeLevel: profile.gradeLevel || '',
        section: profile.section || '',
        height: profile.height ? profile.height.toString() : '',
        weight: profile.weight ? profile.weight.toString() : '',
        contactNumber: profile.contactNumber || '',
        email: profile.user?.email || '',
        username: profile.user?.username || '',
      });
      
      setEmergencyContacts(contacts);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load profile data');
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

  const handleAddContact = () => {
    setContactForm({
      name: '',
      relationship: '',
      phoneNumber: '',
      isPrimary: emergencyContacts.length === 0, // First contact is primary by default
    });
    setEditingContactId(null);
    setShowAddContact(true);
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setContactForm({
      name: contact.name,
      relationship: contact.relationship,
      phoneNumber: contact.phoneNumber,
      isPrimary: contact.isPrimary,
    });
    setEditingContactId(contact.id);
    setShowAddContact(true);
  };

  const handleSaveContact = async () => {
    if (!contactForm.name.trim() || !contactForm.relationship.trim() || !contactForm.phoneNumber.trim()) {
      Alert.alert('Error', 'Please fill in all contact fields');
      return;
    }

    try {
      if (editingContactId) {
        await studentService.updateEmergencyContact(editingContactId, contactForm);
      } else {
        await studentService.addEmergencyContact(contactForm);
      }
      
      const contacts = await studentService.getEmergencyContacts();
      setEmergencyContacts(contacts);
      setShowAddContact(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save contact');
    }
  };

  const handleDeleteContact = (contact: EmergencyContact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await studentService.deleteEmergencyContact(contact.id);
              const contacts = await studentService.getEmergencyContacts();
              setEmergencyContacts(contacts);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete contact');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14b8a6" />
        <Text style={styles.loadingText}>Loading profile settings...</Text>
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
        <Text style={styles.title}>Profile Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Account Information (Read-only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={[styles.input, styles.inputDisabled]}>
                <Text style={styles.inputText}>{formData.username}</Text>
              </View>
              <Text style={styles.hint}>Username cannot be changed</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.input, styles.inputDisabled]}>
                <Text style={styles.inputText}>{formData.email}</Text>
              </View>
              <Text style={styles.hint}>Contact admin to change email</Text>
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

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddContact}
            >
              <Plus size={20} color="#14b8a6" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {emergencyContacts.length === 0 && (
            <View style={styles.emptyState}>
              <Users size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No emergency contacts added</Text>
              <Text style={styles.emptyStateHint}>Add contacts who can be reached in case of emergency</Text>
            </View>
          )}

          {emergencyContacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <View style={styles.contactInfo}>
                  <View style={styles.contactName}>
                    <Text style={styles.contactNameText}>{contact.name}</Text>
                    {contact.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Star size={12} color="#f59e0b" fill="#f59e0b" />
                        <Text style={styles.primaryText}>Primary</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                  <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleEditContact(contact)}
                  >
                    <User size={20} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleDeleteContact(contact)}
                  >
                    <Trash2 size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {/* Add/Edit Contact Form */}
          {showAddContact && (
            <View style={styles.contactForm}>
              <Text style={styles.formTitle}>
                {editingContactId ? 'Edit Contact' : 'Add New Contact'}
              </Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={contactForm.name}
                  onChangeText={(value) => setContactForm({ ...contactForm, name: value })}
                  placeholder="Contact name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Relationship *</Text>
                <TextInput
                  style={styles.input}
                  value={contactForm.relationship}
                  onChangeText={(value) => setContactForm({ ...contactForm, relationship: value })}
                  placeholder="e.g., Parent, Guardian, Sibling"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  value={contactForm.phoneNumber}
                  onChangeText={(value) => setContactForm({ ...contactForm, phoneNumber: value })}
                  placeholder="e.g., +63 912 345 6789"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setContactForm({ ...contactForm, isPrimary: !contactForm.isPrimary })}
              >
                <View style={[styles.checkbox, contactForm.isPrimary && styles.checkboxChecked]}>
                  {contactForm.isPrimary && <Star size={16} color="#ffffff" fill="#ffffff" />}
                </View>
                <Text style={styles.checkboxLabel}>Set as primary contact</Text>
              </TouchableOpacity>

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddContact(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveContactButton}
                  onPress={handleSaveContact}
                >
                  <Save size={18} color="#ffffff" />
                  <Text style={styles.saveContactButtonText}>Save Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Save Button */}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 16,
  },
  formGroupHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
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
    height: 44,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  inputText: {
    fontSize: 16,
    color: '#111827',
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
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
    top: 12,
    zIndex: 1,
  },
  inputWithIconPadding: {
    paddingLeft: 40,
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
    color: '#6b7280',
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#ef4444',
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    height: 44,
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
    fontWeight: '600',
    color: '#6b7280',
  },
  genderButtonTextActive: {
    color: '#ffffff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#d1fae5',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14b8a6',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptyStateHint: {
    marginTop: 4,
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  contactNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
  },
  primaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  contactRelationship: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#14b8a6',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  contactForm: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#14b8a6',
    borderColor: '#14b8a6',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
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
  saveContactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#14b8a6',
  },
  saveContactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
