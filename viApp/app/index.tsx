import { useState, useEffect } from 'react';
import { View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LoginScreen } from './components/LoginScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentVitalsStatistics } from './components/StudentVitalsStatistics';
import { StudentProfile } from './components/StudentProfile';
import { StudentMedicalHistory } from './components/StudentMedicalHistory';
import { ProfileSettings } from './components/ProfileSettings';
import { AdminStudentsList } from './components/AdminStudentsList';
import { AlertsScreen } from './components/AlertsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { CreateStudent } from './components/CreateStudent';
import { EditStudent } from './components/EditStudent';
import { DeviceRegistration } from './components/DeviceRegistration';
import { DeviceManagement } from './components/DeviceManagement';
import { AdminStudentsMonitor } from './components/AdminStudentsMonitor';
import { AdminStudentDetails } from './components/AdminStudentDetails';
import { SchoolHealthStats } from './components/SchoolHealthStats';
import { BottomNav } from './components/BottomNav';
import { Screen, UserType } from './types';
import { websocketService } from '../src/services/websocket';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<UserType>('admin');
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Connect to WebSocket when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      console.log('🔌 User logged in, connecting to WebSocket in 2000ms...');
      // Delay connection to ensure token is saved to AsyncStorage
      const timer = setTimeout(async () => {
        console.log('🔌 Starting WebSocket connection...');
        await websocketService.connect();
        console.log('🔌 WebSocket connection initiated');
        console.log('🔍 Connection state:', websocketService.getConnectionState());
      }, 2000); // Increased to 2 seconds
      
      return () => clearTimeout(timer);
    } else {
      console.log('🔌 User logged out, disconnecting from WebSocket...');
      websocketService.disconnect();
      websocketService.clearCallbacks();
    }
  }, [isLoggedIn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 App unmounting, cleaning up WebSocket...');
      websocketService.disconnect();
      websocketService.clearCallbacks();
    };
  }, []);

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
    // Handle student detail navigation
    if (screen.startsWith('studentDetail:')) {
      const studentId = screen.split(':')[1];
      setSelectedStudentId(studentId);
      setActiveScreen('studentDetail' as any);
    } else if (screen.startsWith('editStudent:')) {
      const studentId = screen.split(':')[1];
      setSelectedStudentId(studentId);
      setActiveScreen('editStudent' as any);
    } else if (screen === 'vitalsHistory' || screen === 'profile' || screen === 'studentsList' || 
        screen === 'connectDevice' || screen === 'createStudent' || screen === 'registerDevice' || 
        screen === 'deviceManagement' || screen === 'monitorStudents' || screen === 'editStudent' || 
        screen === 'editProfile' || screen === 'medicalHistory') {
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

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveScreen('studentDetail' as any);
  };

  const handleEditStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveScreen('editStudent' as any);
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
              onEditStudent={handleEditStudent}
            />
          );
        
        case 'createStudent' as any:
          return (
            <CreateStudent
              onBack={() => setActiveScreen('home')}
              onSuccess={() => setActiveScreen('home')}
            />
          );
        
        case 'editStudent' as any:
          return selectedStudentId ? (
            <EditStudent
              studentId={selectedStudentId}
              onBack={() => setActiveScreen('studentsList')}
              onSuccess={() => setActiveScreen('studentsList')}
            />
          ) : null;
        
        case 'registerDevice' as any:
          return (
            <DeviceRegistration
              onBack={() => setActiveScreen('home')}
              onSuccess={() => setActiveScreen('home')}
            />
          );
        
        case 'deviceManagement' as any:
          return (
            <DeviceManagement
              onBack={() => setActiveScreen('home')}
              onRegisterDevice={() => setActiveScreen('registerDevice' as any)}
            />
          );
        
        case 'monitorStudents' as any:
          return (
            <AdminStudentsMonitor
              onBack={() => setActiveScreen('home')}
              onAssignDevice={(studentId) => {
                setSelectedStudentId(studentId);
                setActiveScreen('deviceManagement' as any);
              }}
            />
          );
        
        case 'studentDetail' as any:
          return selectedStudentId ? (
            <AdminStudentDetails
              studentId={selectedStudentId}
              onBack={() => {
                setSelectedStudentId(null);
                setActiveScreen('home');
              }}
            />
          ) : (
            <AdminDashboard onNavigate={handleNavigate} />
          );
        
        case 'alerts':
          return <AlertsScreen userType="admin" />;
        
        case 'history':
          return <SchoolHealthStats onBack={() => setActiveScreen('home')} />;
        
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
            <StudentVitalsStatistics onBack={() => setActiveScreen('home')} />
          );
        
        case 'history':
        case 'medicalHistory' as any:
          return (
            <StudentMedicalHistory onBack={() => setActiveScreen('home')} />
          );
        
        case 'profile':
          return (
            <StudentProfile onBack={() => setActiveScreen('home')} />
          );
        
        case 'editProfile' as any:
          return (
            <ProfileSettings
              onBack={() => setActiveScreen('settings')}
              onSuccess={() => setActiveScreen('settings')}
            />
          );
        
        case 'alerts':
          return <AlertsScreen userType="student" />;
        
        case 'settings':
          return <SettingsScreen onLogout={handleLogout} onEditProfile={() => handleNavigate('editProfile')} />;
        
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
