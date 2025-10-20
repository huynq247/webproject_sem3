// Type definition for config
export interface AppConfig {
  API_BASE_URL: string;
  AUTH_SERVICE_URL: string;
  CONTENT_SERVICE_URL: string;
  ASSIGNMENT_SERVICE_URL: string;
  ENABLE_DEBUG_LOGS: boolean;
  ENABLE_ANALYTICS: boolean;
  ITEMS_PER_PAGE: number;
  TIMEOUT_MS: number;
  APP_NAME: string;
  VERSION: string;
  ENVIRONMENT: string;
}

// Load config from environment variables
export const config: AppConfig = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  AUTH_SERVICE_URL: process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:8001',
  CONTENT_SERVICE_URL: process.env.REACT_APP_CONTENT_SERVICE_URL || 'http://localhost:8002',
  ASSIGNMENT_SERVICE_URL: process.env.REACT_APP_ASSIGNMENT_SERVICE_URL || 'http://localhost:8004',
  
  ENABLE_DEBUG_LOGS: process.env.REACT_APP_DEBUG === 'true',
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  
  ITEMS_PER_PAGE: parseInt(process.env.REACT_APP_ITEMS_PER_PAGE || '10'),
  TIMEOUT_MS: parseInt(process.env.REACT_APP_TIMEOUT_MS || '30000'),
  
  APP_NAME: process.env.REACT_APP_NAME || 'LMS Teacher Portal',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  ENVIRONMENT: process.env.NODE_ENV || 'development'
};

// Helper functions
export const isDev = () => config.ENVIRONMENT === 'development';
export const isProd = () => config.ENVIRONMENT === 'production';

// API endpoints builder
export const getApiUrl = (path: string) => `${config.API_BASE_URL}${path}`;

// Debug logger
export const debugLog = (...args: any[]) => {
  if (config.ENABLE_DEBUG_LOGS) {
    console.log('[LMS DEBUG]', new Date().toISOString(), ...args);
  }
};

// Info logger (always visible)
export const infoLog = (...args: any[]) => {
  console.info('[LMS INFO]', new Date().toISOString(), ...args);
};

// Error logger (always visible)
export const errorLog = (...args: any[]) => {
  console.error('[LMS ERROR]', new Date().toISOString(), ...args);
};

// Display current config on app start
debugLog('🚀 App starting with config:', {
  environment: config.ENVIRONMENT,
  apiUrl: config.API_BASE_URL,
  debugEnabled: config.ENABLE_DEBUG_LOGS
});

export default config;
