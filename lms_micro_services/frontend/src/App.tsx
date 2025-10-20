import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { config, infoLog, isDev } from './config';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CoursesPage from './pages/courses/CoursesPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import LessonsPage from './pages/lessons/LessonsPage';
import AssignmentsPage from './pages/assignments/AssignmentsPage';
import AssignmentDetailPage from './pages/assignments/AssignmentDetailPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import FlashcardsListPage from './pages/admin/FlashcardsListPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import DecksPage from './pages/decks/DecksPage';
import DeckDetailPage from './pages/decks/DeckDetailPage';
import FlashcardStudyPage from './pages/decks/FlashcardStudyPage';

// Layout
import Layout from './components/layout/Layout';

// Enhanced theme with glass morphism support
const glassTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1e3c72',
      light: '#4a69bd',
      dark: '#0c2461',
    },
    secondary: {
      main: '#ffd89b',
      light: '#ffe4b5',
      dark: '#ffcc80',
    },
    background: {
      default: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      paper: 'rgba(255, 255, 255, 0.15)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
      },
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
};

function App() {
  // Initialize config and log app start
  React.useEffect(() => {
    infoLog(`🚀 ${config.APP_NAME} v${config.VERSION} starting...`);
    infoLog(`🌍 Environment: ${config.ENVIRONMENT}`);
    infoLog(`🔗 API Base URL: ${config.API_BASE_URL}`);
    
    if (isDev()) {
      infoLog('🛠️ Development mode - Debug logs enabled');
    }
  }, []);

  return (
    <ThemeProvider theme={glassTheme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="courses/:courseId" element={<CourseDetailPage />} />
                <Route path="lessons" element={<LessonsPage />} />
                <Route path="assignments" element={<AssignmentsPage />} />
                <Route path="assignments/:assignmentId" element={<AssignmentDetailPage />} />
                <Route path="decks" element={<DecksPage />} />
                <Route path="decks/:deckId" element={<DeckDetailPage />} />
                <Route path="decks/:deckId/study" element={<FlashcardStudyPage />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="flashcards" element={<FlashcardsListPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
