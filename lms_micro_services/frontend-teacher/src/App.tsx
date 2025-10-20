import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CoursesPage from './pages/courses/CoursesPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import LessonsPage from './pages/lessons/LessonsPage';
import AssignmentsPage from './pages/assignments/AssignmentsPage';
import AssignmentDetailPage from './pages/assignments/AssignmentDetailPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import DecksPage from './pages/decks/DecksPage';
import DeckDetailPage from './pages/decks/DeckDetailPage';
import FlashcardStudyPage from './pages/decks/FlashcardStudyPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';

// Layout
import Layout from './components/layout/Layout';

// Teacher theme
const teacherTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1e3c72',
      light: '#4a69bd',
      dark: '#0c2461',
    },
    secondary: {
      main: '#87CEEB',
      light: '#B0E0E6',
      dark: '#4682B4',
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

// Protected Route Component for Teacher only
const TeacherProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '50vh' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only allow TEACHER users
  if (user.role !== 'TEACHER') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: 'white',
        fontSize: '1.5rem',
        textAlign: 'center'
      }}>
        🎓 Access Denied: Teacher Only
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={teacherTheme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Teacher Routes */}
              <Route
                path="/"
                element={
                  <TeacherProtectedRoute>
                    <Layout />
                  </TeacherProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="courses/:courseId" element={<CourseDetailPage />} />
                <Route path="lessons" element={<LessonsPage />} />
                <Route path="assignments" element={<AssignmentsPage />} />
                <Route path="assignments/:assignmentId" element={<AssignmentDetailPage />} />
                <Route path="decks" element={<DecksPage />} />
                <Route path="decks/:deckId" element={<DeckDetailPage />} />
                <Route path="decks/:deckId/study" element={<FlashcardStudyPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
