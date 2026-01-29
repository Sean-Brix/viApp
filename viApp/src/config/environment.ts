/**
 * Environment Configuration
 * 
 * To switch between development and production:
 * 1. Set USE_PRODUCTION to true for production backend
 * 2. Set USE_PRODUCTION to false for local development
 * 3. Update DEVELOPMENT_API_URL to your local IP if needed
 */

export const ENV_CONFIG = {
  // Toggle this to switch between dev and prod
  USE_PRODUCTION: false, // Set to true to use production backend
  
  // API URLs
  DEVELOPMENT_API_URL: 'http://192.168.100.10:3001/api', // Update this to your local IP
  PRODUCTION_API_URL: 'https://viapp-qq6u.onrender.com/api',
  
  // Other configs
  REQUEST_TIMEOUT: 15000, // 15 seconds
  MAX_RETRY_ATTEMPTS: 3,
};

// Helper to get current API URL
export const getApiUrl = (): string => {
  if (ENV_CONFIG.USE_PRODUCTION) {
    console.log('🌐 Using PRODUCTION backend:', ENV_CONFIG.PRODUCTION_API_URL);
    return ENV_CONFIG.PRODUCTION_API_URL;
  }
  
  console.log('🔧 Using DEVELOPMENT backend:', ENV_CONFIG.DEVELOPMENT_API_URL);
  return ENV_CONFIG.DEVELOPMENT_API_URL;
};

// Export current environment
export const IS_PRODUCTION = ENV_CONFIG.USE_PRODUCTION;
export const API_BASE_URL = getApiUrl();
