import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import { ArrowLeft, User, Phone, MapPin, Ruler, Weight, Activity, Save } from 'lucide-react-native';
import { studentService } from '../../src/services/api';

interface StudentProfileProps {
  onBack: () => void;
}

export function StudentProfile({ onBack }: StudentProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Editable fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await studentService.getProfile();
      setProfile(data);
      
      // Initialize editable fields
      setPhoneNumber(data.phoneNumber || '');
      setAddress(data.address || '');
      setHeight(data.height?.toString() || '');
      setWeight(data.weight?.toString() || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await studentService.updateProfile({
        phoneNumber: phoneNumber || undefined,
        address: address || undefined,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
      });
      
      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
      await loadProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setPhoneNumber(profile?.phoneNumber || '');
    setAddress(profile?.address || '');
    setHeight(profile?.height?.toString() || '');
    setWeight(profile?.weight?.toString() || '');
    setEditing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity onPress={loadProfile} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity 
          onPress={() => setEditing(!editing)} 
          style={styles.editButton}
          disabled={saving}
        >
          <Text style={styles.editText}>{editing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <User size={48} color="#0d9488" />
            </View>
            <Text style={styles.name}>
              {profile.firstName} {profile.lastName}
            </Text>
            <Text style={styles.studentId}>Student ID: {profile.studentId}</Text>
            <View style={[styles.statusBadge, {
              backgroundColor: profile.status === 'STABLE' ? '#dcfce7' : '#fef3c7'
            }]}>
              <Text style={[styles.statusText, {
                color: profile.status === 'STABLE' ? '#16a34a' : '#f59e0b'
              }]}>
                {profile.status}
              </Text>
            </View>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>
                  {new Date(profile.dateOfBirth).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>{profile.gender}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Blood Type</Text>
                <Text style={styles.infoValue}>{profile.bloodType || 'Not specified'}</Text>
              </View>
            </View>
          </View>

          {/* Academic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Academic Information</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Grade Level</Text>
                <Text style={styles.infoValue}>{profile.gradeLevel}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Section</Text>
                <Text style={styles.infoValue}>{profile.section}</Text>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.card}>
              <View style={styles.editableRow}>
                <Phone size={20} color="#6b7280" />
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                  />
                ) : (
                  <View style={styles.infoColumn}>
                    <Text style={styles.infoLabel}>Phone Number</Text>
                    <Text style={styles.infoValue}>{phoneNumber || 'Not provided'}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.editableRow}>
                <MapPin size={20} color="#6b7280" />
                {editing ? (
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Address"
                    multiline
                  />
                ) : (
                  <View style={styles.infoColumn}>
                    <Text style={styles.infoLabel}>Address</Text>
                    <Text style={styles.infoValue}>{address || 'Not provided'}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Health Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Information</Text>
            <View style={styles.card}>
              <View style={styles.editableRow}>
                <Ruler size={20} color="#6b7280" />
                {editing ? (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={height}
                      onChangeText={setHeight}
                      placeholder="Height"
                      keyboardType="decimal-pad"
                    />
                    <Text style={styles.unitText}>cm</Text>
                  </View>
                ) : (
                  <View style={styles.infoColumn}>
                    <Text style={styles.infoLabel}>Height</Text>
                    <Text style={styles.infoValue}>{height || 'Not provided'} cm</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.editableRow}>
                <Weight size={20} color="#6b7280" />
                {editing ? (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={weight}
                      onChangeText={setWeight}
                      placeholder="Weight"
                      keyboardType="decimal-pad"
                    />
                    <Text style={styles.unitText}>kg</Text>
                  </View>
                ) : (
                  <View style={styles.infoColumn}>
                    <Text style={styles.infoLabel}>Weight</Text>
                    <Text style={styles.infoValue}>{weight || 'Not provided'} kg</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.editableRow}>
                <Activity size={20} color="#6b7280" />
                <View style={styles.infoColumn}>
                  <Text style={styles.infoLabel}>BMI</Text>
                  <Text style={styles.infoValue}>
                    {profile.bmi ? profile.bmi.toFixed(1) : 'Not calculated'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Medical Conditions */}
          {profile.medicalConditions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medical Conditions</Text>
              <View style={styles.card}>
                <Text style={styles.medicalText}>{profile.medicalConditions}</Text>
              </View>
            </View>
          )}

          {/* Allergies */}
          {profile.allergies && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Allergies</Text>
              <View style={styles.card}>
                <Text style={styles.medicalText}>{profile.allergies}</Text>
              </View>
            </View>
          )}

          {/* Save Button */}
          {editing && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Save size={20} color="#ffffff" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
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
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorText: {
    fontSize: 18,
    color: '#dc2626',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#0d9488',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  editButton: {
    padding: 8,
  },
  editText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  profileHeader: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  card: {
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  editableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoColumn: {
    flex: 1,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  unitText: {
    fontSize: 14,
    color: '#6b7280',
  },
  medicalText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
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
    backgroundColor: '#0d9488',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
