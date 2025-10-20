import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/auth/LoginPage';
import AssignmentsPage from './pages/assignments/AssignmentsPage';
import AssignmentDetailPage from './pages/assignments/AssignmentDetailPage';
import DecksPage from './pages/decks/DecksPage';
import DeckDetailPage from './pages/decks/DeckDetailPage';
import StudyFlashcardsPage from './pages/flashcards/StudyFlashcardsPage';

// Layout
import Layout from './components/layout/Layout';

// Student theme
const studentTheme = createTheme({
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

// Protected Route Component for Student only
const StudentProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '50vh' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only allow STUDENT users
  if (user.role !== 'STUDENT') {
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
        📚 Access Denied: Student Only
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={studentTheme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Student Routes */}
              <Route
                path="/"
                element={
                  <StudentProtectedRoute>
                    <Layout />
                  </StudentProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/assignments" replace />} />
                <Route path="assignments" element={<AssignmentsPage />} />
                <Route path="assignments/:assignmentId" element={<AssignmentDetailPage />} />
                <Route path="decks" element={<DecksPage />} />
                <Route path="decks/:deckId" element={<DeckDetailPage />} />
                <Route path="decks/:deckId/study" element={<StudyFlashcardsPage />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/assignments" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
