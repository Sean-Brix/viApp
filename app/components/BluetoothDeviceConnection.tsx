import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { Bluetooth, RefreshCw, Check, X, Watch, Wifi, WifiOff, AlertCircle } from 'lucide-react-native';

// Type definitions for BLE (will be null if not available)
interface BluetoothDevice {
  id: string;
  name: string;
  rssi?: number;
  connected?: boolean;
}

interface BluetoothDeviceConnectionProps {
  onBack: () => void;
  onDeviceConnected: (device: BluetoothDevice) => void;
}

// Lazy load BLE manager to avoid crashes in Expo Go
let BleManager: any = null;
let bleManagerInstance: any = null;

try {
  const BleModule = require('react-native-ble-plx');
  BleManager = BleModule.BleManager;
  console.log('[BLE] Module loaded successfully');
} catch (error) {
  console.log('[BLE] Module not available (Expo Go):', error);
}

export function BluetoothDeviceConnection({ onBack, onDeviceConnected }: BluetoothDeviceConnectionProps) {
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [scanningStatus, setScanningStatus] = useState<string>('');
  const [bleAvailable, setBleAvailable] = useState(false);

  useEffect(() => {
    console.log('[BLE] Component mounted, initializing...');
    
    // Initialize BLE manager if available
    if (BleManager && !bleManagerInstance) {
      try {
        bleManagerInstance = new BleManager();
        setBleAvailable(true);
        console.log('[BLE] Manager initialized successfully');
        checkBluetoothStatus();
        loadSavedDevice();
      } catch (error) {
        console.log('[BLE] Failed to initialize manager:', error);
        setBleAvailable(false);
      }
    } else {
      console.log('[BLE] BLE not available in this environment');
      setBleAvailable(false);
    }

    // Cleanup on unmount
    return () => {
      console.log('[BLE] Component unmounting, stopping scan...');
      if (bleManagerInstance) {
        try {
          bleManagerInstance.stopDeviceScan();
        } catch (error) {
          console.log('[BLE] Error stopping scan:', error);
        }
      }
    };
  }, []);

  const checkBluetoothStatus = async () => {
    if (!bleManagerInstance) return;
    try {
      console.log('[BLE] Checking Bluetooth state...');
      const state = await bleManagerInstance.state();
      console.log('[BLE] Current state:', state);
      const State = require('react-native-ble-plx').State;
      setBluetoothEnabled(state === State.PoweredOn);
      
      // Listen for Bluetooth state changes
      const subscription = bleManagerInstance.onStateChange((newState) => {
        console.log('[BLE] State changed to:', newState);
        setBluetoothEnabled(newState === State.PoweredOn);
        if (newState !== State.PoweredOn) {
          Alert.alert(
            'Bluetooth is Off',
            'Please enable Bluetooth to scan for devices.',
            [{ text: 'OK' }]
          );
        }
      }, true);

      return () => subscription.remove();
    } catch (error) {
      console.error('[BLE] Bluetooth state check error:', error);
      setBluetoothEnabled(false);
    }
  };

  const loadSavedDevice = async () => {
    // Load previously connected device from storage
    // Placeholder for now
  };

  const requestBluetoothPermissions = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        // Android 12+
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);

          const allGranted = Object.values(granted).every(
            (status) => status === PermissionsAndroid.RESULTS.GRANTED
          );

          if (!allGranted) {
            Alert.alert(
              'Permissions Required',
              'Bluetooth permissions are required to scan for and connect to health devices.'
            );
            return false;
          }
          return true;
        } catch (error) {
          console.error('Permission request error:', error);
          return false;
        }
      } else {
        // Android < 12
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert(
              'Location Permission Required',
              'Location permission is required for Bluetooth scanning on Android.'
            );
            return false;
          }
          return true;
        } catch (error) {
          console.error('Permission request error:', error);
          return false;
        }
      }
    }
    return true;
  };

  const startScan = async () => {
    if (!bleManagerInstance) {
      Alert.alert(
        'BLE Not Available',
        'Bluetooth Low Energy is not available in Expo Go. Please use a development build:\n\nnpx expo run:android\nor\nnpx expo run:ios',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('[BLE] Start scan button pressed');
    setScanningStatus('Requesting permissions...');
    
    const hasPermission = await requestBluetoothPermissions();
    if (!hasPermission) {
      setScanningStatus('Permission denied');
      return;
    }

    console.log('[BLE] Permissions granted, checking Bluetooth state...');
    setScanningStatus('Checking Bluetooth...');
    
    // Check Bluetooth state
    const State = require('react-native-ble-plx').State;
    const state = await bleManagerInstance.state();
    console.log('[BLE] Bluetooth state:', state);
    
    if (state !== State.PoweredOn) {
      Alert.alert(
        'Bluetooth is Off',
        'Please enable Bluetooth in your device settings to scan for devices.',
        [{ text: 'OK' }]
      );
      setScanningStatus('Bluetooth is off');
      return;
    }

    setScanning(true);
    setDevices([]);
    setScanningStatus('Scanning for devices...');

    console.log('[BLE] Starting device scan...');

    try {
      bleManagerInstance.startDeviceScan(
        null, // null means scan for all devices
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error('[BLE] Scan error:', error);
            setScanning(false);
            setScanningStatus('Scan error: ' + error.message);
            Alert.alert('Scan Error', error.message);
            return;
          }

          if (device) {
            console.log('[BLE] Found device:', device.name || 'Unknown', device.id, 'RSSI:', device.rssi);
            
            // Add all devices, even without names (you can filter later if needed)
            setDevices((prev) => {
              const exists = prev.find((d) => d.id === device.id);
              if (exists) return prev;
              return [
                ...prev,
                {
                  id: device.id,
                  name: device.name || device.localName || `Device ${device.id.substring(0, 8)}`,
                  rssi: device.rssi || undefined,
                },
              ];
            });
            
            setScanningStatus(`Found ${devices.length + 1} device(s)...`);
          }
        }
      );

      // Stop scanning after 15 seconds
      setTimeout(() => {
        console.log('[BLE] Stopping scan after timeout');
        bleManagerInstance.stopDeviceScan();
        setScanning(false);
        setScanningStatus(devices.length > 0 ? `Found ${devices.length} device(s)` : 'No devices found');
      }, 15000);
    } catch (error: any) {
      console.error('[BLE] Scan start error:', error);
      setScanning(false);
      setScanningStatus('Failed to start scan');
      Alert.alert('Error', 'Failed to start scanning: ' + error.message);
    }
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    if (!bleManagerInstance) return;
    
    setConnecting(true);

    try {
      console.log('Connecting to device:', device.name, device.id);
      
      // Stop scanning before connecting
      bleManagerInstance.stopDeviceScan();
      
      // Connect to the device
      const connectedDevice = await bleManagerInstance.connectToDevice(device.id, {
        timeout: 10000, // 10 second timeout
      });

      console.log('Connected to device:', connectedDevice.name);

      // Discover services and characteristics
      await connectedDevice.discoverAllServicesAndCharacteristics();
      console.log('Services discovered');

      setConnectedDevice(device);
      setConnecting(false);
      onDeviceConnected(device);

      Alert.alert(
        'Device Connected',
        `Successfully connected to ${device.name}. Your health data will now sync automatically.`,
        [{ text: 'OK', onPress: onBack }]
      );

      // Optional: Start monitoring characteristics for health data
      // You would need to know the service and characteristic UUIDs
      // Example:
      // const SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb'; // Heart Rate Service
      // const CHARACTERISTIC_UUID = '00002a37-0000-1000-8000-00805f9b34fb'; // Heart Rate Measurement
      
      // connectedDevice.monitorCharacteristicForService(
      //   SERVICE_UUID,
      //   CHARACTERISTIC_UUID,
      //   (error, characteristic) => {
      //     if (error) {
      //       console.error('Monitoring error:', error);
      //       return;
      //     }
      //     if (characteristic?.value) {
      //       // Parse health data here
      //       console.log('Health data received:', characteristic.value);
      //     }
      //   }
      // );

    } catch (error: any) {
      console.error('Connection error:', error);
      setConnecting(false);
      
      let errorMessage = 'Could not connect to the device. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Connection Failed', errorMessage);
    }
  };

  const disconnectDevice = async () => {
    if (!connectedDevice || !bleManagerInstance) return;

    Alert.alert(
      'Disconnect Device',
      `Are you sure you want to disconnect from ${connectedDevice.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await bleManagerInstance.cancelDeviceConnection(connectedDevice.id);
              setConnectedDevice(null);
              console.log('Device disconnected');
            } catch (error) {
              console.error('Disconnect error:', error);
              // Even if disconnect fails, clear the connected device
              setConnectedDevice(null);
            }
          },
        },
      ]
    );
  };

  const getSignalStrength = (rssi?: number) => {
    if (!rssi) return 'Unknown';
    if (rssi > -50) return 'Excellent';
    if (rssi > -60) return 'Good';
    if (rssi > -70) return 'Fair';
    return 'Weak';
  };

  const getSignalColor = (rssi?: number) => {
    if (!rssi) return '#9ca3af';
    if (rssi > -50) return '#16a34a';
    if (rssi > -60) return '#65a30d';
    if (rssi > -70) return '#f59e0b';
    return '#dc2626';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <X size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connect Device</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* BLE Not Available Warning */}
          {!bleAvailable && (
            <View style={[styles.infoCard, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
              <View style={[styles.iconContainer, { backgroundColor: '#fbbf24' }]}>
                <AlertCircle size={32} color="#ffffff" />
              </View>
              <Text style={[styles.infoTitle, { color: '#92400e' }]}>BLE Not Available</Text>
              <Text style={[styles.infoText, { color: '#92400e' }]}>
                Bluetooth functionality requires a development build. Please run:{'\n\n'}
                <Text style={{ fontFamily: 'monospace' }}>expo run:android</Text> or{'\n'}
                <Text style={{ fontFamily: 'monospace' }}>expo run:ios</Text>{'\n\n'}
                Expo Go does not support Bluetooth Low Energy.
              </Text>
            </View>
          )}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.iconContainer}>
              <Watch size={32} color="#0d9488" />
            </View>
            <Text style={styles.infoTitle}>Connect Your Health Device</Text>
            <Text style={styles.infoText}>
              Pair your smartwatch or health monitoring device to automatically sync your vitals (heart rate, temperature, SpO2, and more) in real-time.
            </Text>
          </View>

          {/* Bluetooth Status */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Bluetooth size={24} color={bluetoothEnabled ? '#0d9488' : '#9ca3af'} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Bluetooth Status</Text>
                <Text style={[styles.statusValue, {
                  color: bluetoothEnabled ? '#16a34a' : '#dc2626'
                }]}>
                  {bluetoothEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
            {!bluetoothEnabled && (
              <Text style={styles.statusWarning}>
                Please enable Bluetooth in your device settings to connect to health devices.
              </Text>
            )}
          </View>

          {/* Connected Device */}
          {connectedDevice && (
            <View style={styles.connectedCard}>
              <View style={styles.connectedHeader}>
                <View style={styles.connectedIcon}>
                  <Wifi size={24} color="#ffffff" />
                </View>
                <View style={styles.connectedInfo}>
                  <Text style={styles.connectedLabel}>Connected Device</Text>
                  <Text style={styles.connectedName}>{connectedDevice.name}</Text>
                </View>
                <View style={styles.connectedBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.connectedStatus}>Active</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={disconnectDevice}
              >
                <WifiOff size={16} color="#dc2626" />
                <Text style={styles.disconnectButtonText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Scan Button */}
          <TouchableOpacity
            style={[styles.scanButton, (scanning || !bluetoothEnabled || !bleAvailable) && styles.scanButtonDisabled]}
            onPress={startScan}
            disabled={scanning || !bluetoothEnabled || !bleAvailable}
          >
            {scanning ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.scanButtonText}>Scanning...</Text>
              </>
            ) : (
              <>
                <RefreshCw size={20} color="#ffffff" />
                <Text style={styles.scanButtonText}>
                  {devices.length > 0 ? 'Scan Again' : 'Scan for Devices'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Scanning Status */}
          {scanningStatus && (
            <View style={styles.scanningStatusContainer}>
              <Text style={styles.scanningStatusText}>{scanningStatus}</Text>
            </View>
          )}

          {/* Device List */}
          {devices.length > 0 && (
            <View style={styles.deviceList}>
              <Text style={styles.deviceListTitle}>Available Devices</Text>
              {devices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  style={[
                    styles.deviceCard,
                    connectedDevice?.id === device.id && styles.deviceCardConnected
                  ]}
                  onPress={() => connectToDevice(device)}
                  disabled={connecting || connectedDevice?.id === device.id}
                >
                  <View style={styles.deviceIcon}>
                    <Watch size={24} color="#0d9488" />
                  </View>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <View style={styles.deviceMeta}>
                      <View style={[styles.signalDot, {
                        backgroundColor: getSignalColor(device.rssi)
                      }]} />
                      <Text style={styles.deviceSignal}>
                        {getSignalStrength(device.rssi)} Signal
                      </Text>
                    </View>
                  </View>
                  {connecting ? (
                    <ActivityIndicator size="small" color="#0d9488" />
                  ) : connectedDevice?.id === device.id ? (
                    <View style={styles.connectedCheck}>
                      <Check size={20} color="#16a34a" />
                    </View>
                  ) : (
                    <View style={styles.connectArrow}>
                      <Text style={styles.connectText}>Connect</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Setup Instructions</Text>
            <View style={styles.instruction}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Turn on your health device and ensure Bluetooth is enabled
              </Text>
            </View>
            <View style={styles.instruction}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Tap "Scan for Devices" to discover nearby devices
              </Text>
            </View>
            <View style={styles.instruction}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                Select your device from the list to connect
              </Text>
            </View>
            <View style={styles.instruction}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.instructionText}>
                Once connected, your vitals will sync automatically
              </Text>
            </View>
          </View>
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
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusWarning: {
    marginTop: 12,
    fontSize: 13,
    color: '#dc2626',
    lineHeight: 18,
  },
  connectedCard: {
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  connectedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedInfo: {
    flex: 1,
  },
  connectedLabel: {
    fontSize: 12,
    color: '#166534',
    marginBottom: 2,
  },
  connectedName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  connectedStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 8,
  },
  disconnectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: '#0d9488',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  scanningStatusContainer: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  scanningStatusText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
  },
  deviceList: {
    marginBottom: 24,
  },
  deviceListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deviceCardConnected: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  deviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deviceSignal: {
    fontSize: 13,
    color: '#6b7280',
  },
  connectedCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectArrow: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  connectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0d9488',
  },
  instructionsCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 16,
  },
  instruction: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});
