import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CoursesPage from './pages/courses/CoursesPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import LessonsPage from './pages/lessons/LessonsPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import DecksPage from './pages/decks/DecksPage';
import DeckDetailPage from './pages/decks/DeckDetailPage';
import FlashcardStudyPage from './pages/decks/FlashcardStudyPage';
import AIFlashcardCreator from './pages/decks/AIFlashcardCreator';
import AIDeckCreator from './pages/decks/AIDeckCreator';

// Layout
import Layout from './components/layout/Layout';

// Import Bright Theme - Sáng, dễ nhìn, chuyên nghiệp
import brightTheme from './theme/brightTheme';

// Use the bright theme
const adminTheme = brightTheme;

// Backup: If you want to keep the old dark theme, uncomment below
// import modernTheme from './theme/modernTheme';
// const adminTheme = modernTheme;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component for Admin only
const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '50vh' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only allow ADMIN users
  if (user.role !== 'ADMIN') {
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
        🚫 Access Denied: Admin Only
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Admin Routes */}
              <Route
                path="/"
                element={
                  <AdminProtectedRoute>
                    <Layout />
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="courses/:courseId" element={<CourseDetailPage />} />
                <Route path="lessons" element={<LessonsPage />} />
                <Route path="decks" element={<DecksPage />} />
                <Route path="decks/:deckId" element={<DeckDetailPage />} />
                <Route path="decks/:deckId/study" element={<FlashcardStudyPage />} />
                <Route path="ai/flashcard-creator" element={<AIFlashcardCreator />} />
                <Route path="ai/deck-creator" element={<AIDeckCreator />} />
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
