import { useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { AlertsScreen } from './components/AlertsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { BottomNav } from './components/BottomNav';
import { mockStudents, mockAlerts } from './mockData';
import { Student, Screen, UserType } from './types';

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<UserType>('admin');
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [students] = useState<Student[]>(mockStudents);

  const handleLogin = (type: UserType) => {
    setUserType(type);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType('admin');
    setActiveScreen('home');
  };

  const handleStudentClick = (student: Student) => {
    // For now, just show an alert. Full detail view can be added later
    console.log('Student clicked:', student.name);
  };

  const handleNavigate = (screen: Screen) => {
    setActiveScreen(screen);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return (
          <Dashboard
            students={students}
            onStudentClick={handleStudentClick}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            onAddStudent={() => {}}
          />
        );
      
      case 'alerts':
        return <AlertsScreen alerts={mockAlerts} />;
      
      case 'settings':
        return <SettingsScreen onLogout={handleLogout} />;
      
      default:
        return (
          <Dashboard
            students={students}
            onStudentClick={handleStudentClick}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            onAddStudent={() => {}}
          />
        );
    }
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
            alertCount={mockAlerts.length}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
