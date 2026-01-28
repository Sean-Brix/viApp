import React, { useState } from 'react';
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
import { ChevronLeft, Bluetooth, Check } from 'lucide-react-native';
import { adminService } from '../../src/services/api';

interface DeviceRegistrationProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function DeviceRegistration({ onBack, onSuccess }: DeviceRegistrationProps) {
  const [formData, setFormData] = useState({
    deviceId: '',
    serialNumber: '',
    model: 'ViBand Pro',
    manufacturer: 'ViHealth Technologies',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.deviceId.trim()) {
      newErrors.deviceId = 'Device ID is required';
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Serial Number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await adminService.registerDevice({
        deviceId: formData.deviceId.trim(),
        serialNumber: formData.serialNumber.trim(),
        model: formData.model.trim() || undefined,
        manufacturer: formData.manufacturer.trim() || undefined,
      });

      Alert.alert(
        'Success',
        'Device registered successfully',
        [
          {
            text: 'OK',
            onPress: onSuccess,
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to register device');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        <Text style={styles.title}>Register Device</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Bluetooth size={32} color="#14b8a6" />
          <Text style={styles.infoTitle}>ViBand Device Registration</Text>
          <Text style={styles.infoText}>
            Register a new ViBand device to the system. Once registered, the device can be
            assigned to students for vital signs monitoring.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Device ID */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Device ID <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.deviceId && styles.inputError]}
              value={formData.deviceId}
              onChangeText={(value) => updateField('deviceId', value)}
              placeholder="e.g., VB-001-2024"
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
            />
            {errors.deviceId && <Text style={styles.errorText}>{errors.deviceId}</Text>}
            <Text style={styles.hint}>Unique identifier for the device</Text>
          </View>

          {/* Serial Number */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Serial Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.serialNumber && styles.inputError]}
              value={formData.serialNumber}
              onChangeText={(value) => updateField('serialNumber', value)}
              placeholder="e.g., SN123456789"
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
            />
            {errors.serialNumber && <Text style={styles.errorText}>{errors.serialNumber}</Text>}
            <Text style={styles.hint}>Hardware serial number</Text>
          </View>

          {/* Model */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Model</Text>
            <TextInput
              style={styles.input}
              value={formData.model}
              onChangeText={(value) => updateField('model', value)}
              placeholder="e.g., ViBand Pro"
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.hint}>Device model name</Text>
          </View>

          {/* Manufacturer */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Manufacturer</Text>
            <TextInput
              style={styles.input}
              value={formData.manufacturer}
              onChangeText={(value) => updateField('manufacturer', value)}
              placeholder="e.g., ViHealth Technologies"
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.hint}>Device manufacturer</Text>
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
            style={[styles.button, styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Check size={20} color="#ffffff" />
                <Text style={styles.registerButtonText}>Register Device</Text>
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
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formGroup: {
    marginBottom: 20,
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
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
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
  registerButton: {
    backgroundColor: '#14b8a6',
  },
  registerButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
