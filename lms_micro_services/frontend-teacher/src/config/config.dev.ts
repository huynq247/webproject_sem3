export const config = {
  API_BASE_URL: 'http://localhost:8000',
  AUTH_SERVICE_URL: 'http://localhost:8001',
  CONTENT_SERVICE_URL: 'http://localhost:8082',
  ASSIGNMENT_SERVICE_URL: 'http://localhost:8004',
  
  // Feature flags
  ENABLE_DEBUG_LOGS: true,
  ENABLE_ANALYTICS: false,
  
  // UI settings
  ITEMS_PER_PAGE: 10,
  TIMEOUT_MS: 30000,
  
  // App info
  APP_NAME: 'LMS Platform',
  VERSION: '1.0.0',
  ENVIRONMENT: 'development'
};
