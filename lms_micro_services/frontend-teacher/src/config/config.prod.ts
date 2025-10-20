export const config = {
  API_BASE_URL: 'http://192.168.1.100:8000', // Change this to your production IP
  AUTH_SERVICE_URL: 'http://192.168.1.100:8001',
  CONTENT_SERVICE_URL: 'http://192.168.1.100:8082',
  ASSIGNMENT_SERVICE_URL: 'http://192.168.1.100:8004',
  
  // Feature flags
  ENABLE_DEBUG_LOGS: false,
  ENABLE_ANALYTICS: true,
  
  // UI settings
  ITEMS_PER_PAGE: 20,
  TIMEOUT_MS: 10000,
  
  // App info
  APP_NAME: 'LMS Platform',
  VERSION: '1.0.0',
  ENVIRONMENT: 'production'
};
