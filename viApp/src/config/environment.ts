/**
 * Environment Configuration
 * 
 * Automatically detects environment:
 * - Production APK: Uses production backend
 * - Development/Expo: Uses local backend
 */

export const ENV_CONFIG = {
  // API URLs
  DEVELOPMENT_API_URL: 'http://192.168.100.3:3001/api',
  PRODUCTION_API_URL: 'https://viapp-qq6u.onrender.com/api',
  
  // Other configs
  REQUEST_TIMEOUT: 15000, // 15 seconds
  MAX_RETRY_ATTEMPTS: 3,
};

// Helper to get current API URL (auto-detects environment)
export const getApiUrl = (): string => {
  // In production builds, __DEV__ is false
  // In development (Expo), __DEV__ is true
  const isProduction = !__DEV__;
  
  if (isProduction) {
    console.log('🌐 Using PRODUCTION backend:', ENV_CONFIG.PRODUCTION_API_URL);
    return ENV_CONFIG.PRODUCTION_API_URL;
  }
  
  console.log('🔧 Using DEVELOPMENT backend:', ENV_CONFIG.DEVELOPMENT_API_URL);
  return ENV_CONFIG.DEVELOPMENT_API_URL;
};

// Export current environment
export const IS_PRODUCTION = !__DEV__;
export const API_BASE_URL = getApiUrl();
