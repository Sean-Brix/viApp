import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { ChevronLeft, Heart, Users, Shield, Mail, Globe, Github } from 'lucide-react-native';

interface AboutScreenProps {
  onBack: () => void;
}

export function AboutScreen({ onBack }: AboutScreenProps) {
  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Heart size={48} color="#0d9488" />
            </View>
            <Text style={styles.appName}>ViApp</Text>
            <Text style={styles.appTagline}>Health Monitoring System</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.descriptionTitle}>About ViApp</Text>
            <Text style={styles.description}>
              ViApp is a comprehensive health monitoring system designed for San Francisco
              Memorial National High School (SFMNHS). Our platform enables real-time monitoring
              of student vital signs, providing immediate alerts for abnormal readings and
              maintaining comprehensive health records.
            </Text>
            <Text style={styles.description}>
              With ViApp, school health administrators can efficiently manage student health
              data, monitor multiple students simultaneously, and respond quickly to health
              concerns, ensuring the well-being of every student.
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.card}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Heart size={20} color="#ef4444" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Real-Time Monitoring</Text>
                <Text style={styles.featureDescription}>
                  Track heart rate, temperature, and SpO₂ levels in real-time
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Shield size={20} color="#3b82f6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Intelligent Alerts</Text>
                <Text style={styles.featureDescription}>
                  Automatic notifications for abnormal vital signs
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Users size={20} color="#8b5cf6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Student Management</Text>
                <Text style={styles.featureDescription}>
                  Comprehensive student profiles and health records
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* School Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>School Information</Text>
          <View style={styles.card}>
            <Text style={styles.schoolName}>
              San Francisco Memorial National High School
            </Text>
            <Text style={styles.schoolAbbr}>SFMNHS</Text>
            <Text style={styles.schoolDescription}>
              Committed to providing quality education and ensuring the health and well-being
              of all students through innovative health monitoring solutions.
            </Text>
          </View>
        </View>

        {/* Contact & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact & Support</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleOpenLink('mailto:support@viapp.edu.ph')}
            >
              <Mail size={20} color="#0d9488" />
              <Text style={styles.contactText}>support@viapp.edu.ph</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleOpenLink('https://www.viapp.edu.ph')}
            >
              <Globe size={20} color="#0d9488" />
              <Text style={styles.contactText}>www.viapp.edu.ph</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleOpenLink('https://github.com/viapp')}
            >
              <Github size={20} color="#0d9488" />
              <Text style={styles.contactText}>github.com/viapp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <View style={styles.card}>
            <TouchableOpacity style={styles.legalItem}>
              <Text style={styles.legalText}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.legalItem}>
              <Text style={styles.legalText}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.legalItem}>
              <Text style={styles.legalText}>Data Protection Notice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.legalItem}>
              <Text style={styles.legalText}>Open Source Licenses</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.section}>
          <Text style={styles.copyright}>
            © 2026 SFMNHS. All rights reserved.
          </Text>
          <Text style={styles.madeWith}>
            Made with <Heart size={12} color="#ef4444" /> for student health and safety
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
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
    backgroundColor: '#0d9488',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
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
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0d9488',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: '#9ca3af',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  schoolAbbr: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0d9488',
    marginBottom: 12,
  },
  schoolDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#111827',
  },
  legalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  legalText: {
    fontSize: 15,
    color: '#3b82f6',
    fontWeight: '500',
  },
  copyright: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  madeWith: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});
