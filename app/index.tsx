import { useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LoginScreen } from './components/LoginScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentVitalsHistory } from './components/StudentVitalsHistory';
import { StudentProfile } from './components/StudentProfile';
import { AdminStudentsList } from './components/AdminStudentsList';
import { BluetoothDeviceConnection } from './components/BluetoothDeviceConnection';
import { AlertsScreen } from './components/AlertsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { BottomNav } from './components/BottomNav';
import { Screen, UserType } from './types';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<UserType>('admin');
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const handleLogin = (type: UserType) => {
    setUserType(type);
    setIsLoggedIn(true);
    setActiveScreen('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType('admin');
    setActiveScreen('home');
    setSelectedStudentId(null);
  };

  const handleNavigate = (screen: Screen | string) => {
    if (screen === 'vitalsHistory' || screen === 'profile' || screen === 'studentsList' || screen === 'connectDevice') {
      setActiveScreen(screen as any);
    } else {
      setActiveScreen(screen as Screen);
    }
  };

  const handleDeviceConnected = (device: any) => {
    console.log('Device connected:', device);
    // Optionally refresh dashboard data after device connection
    setActiveScreen('home');
  };

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudentId(studentId);
    // Navigate to student detail screen when implemented
    console.log('Selected student:', studentId);
  };

  const renderScreen = () => {
    // Render admin screens
    if (userType === 'admin') {
      switch (activeScreen) {
        case 'home':
          return <AdminDashboard onNavigate={handleNavigate} />;
        
        case 'studentsList':
          return (
            <AdminStudentsList
              onBack={() => setActiveScreen('home')}
              onStudentSelect={handleStudentSelect}
            />
          );
        
        case 'alerts':
          return <AlertsScreen userType="admin" />;
        
        case 'settings':
          return <SettingsScreen onLogout={handleLogout} />;
        
        default:
          return <AdminDashboard onNavigate={handleNavigate} />;
      }
    }

    // Render student screens
    if (userType === 'student') {
      switch (activeScreen) {
        case 'home':
          return <StudentDashboard onNavigate={handleNavigate} />;
        
        case 'vitalsHistory':
          return (
            <StudentVitalsHistory onBack={() => setActiveScreen('home')} />
          );
        
        case 'profile':
          return (
            <StudentProfile onBack={() => setActiveScreen('home')} />
          );
        
        case 'connectDevice':
          return (
            <BluetoothDeviceConnection 
              onBack={() => setActiveScreen('home')}
              onDeviceConnected={handleDeviceConnected}
            />
          );
        
        case 'alerts':
          return <AlertsScreen userType="student" />;
        
        case 'settings':
          return <SettingsScreen onLogout={handleLogout} />;
        
        default:
          return <StudentDashboard onNavigate={handleNavigate} />;
      }
    }

    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar style="auto" />
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <View style={{ flex: 1 }}>
          {renderScreen()}
          <BottomNav
            activeScreen={activeScreen}
            onNavigate={handleNavigate}
            alertCount={0}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
