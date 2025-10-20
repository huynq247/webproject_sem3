import { config as devConfig } from './config.dev';
import { config as prodConfig } from './config.prod';

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

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Select config based on environment
export const config: AppConfig = (() => {
  // Check for environment variable override
  if (process.env.REACT_APP_ENV === 'production' || isProduction) {
    return prodConfig;
  }
  return devConfig; // Default to development
})();

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
