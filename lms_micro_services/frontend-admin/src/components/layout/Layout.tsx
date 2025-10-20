import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  Dashboard,
  School,
  Assignment,
  Quiz,
  ExitToApp,
  AutoAwesome,
  SmartToy,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GlassButton } from '../common/GlassTheme';

const drawerWidth = 240;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['ADMIN'] },
    { text: 'User Management', icon: <Dashboard />, path: '/users', roles: ['ADMIN'] },
    { text: 'Courses', icon: <School />, path: '/courses', roles: ['ADMIN'] },
    { text: 'Lessons', icon: <School />, path: '/lessons', roles: ['ADMIN'] },
    { text: 'Flashcard Decks', icon: <Quiz />, path: '/decks', roles: ['ADMIN'] },
    { text: 'AI Flashcard Creator', icon: <SmartToy />, path: '/ai/flashcard-creator', roles: ['ADMIN'] },
    { text: 'AI Deck Creator', icon: <AutoAwesome />, path: '/ai/deck-creator', roles: ['ADMIN'] },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role?.toUpperCase() || '')
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 800,
              color: '#0f172a',
              fontSize: '1.5rem'
            }}
          >
            🎓 Learning Management System
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600, 
                color: '#64748b',
              }}
            >
              Welcome, {user?.full_name || user?.username} ({user?.role})
            </Typography>
            <Button 
              onClick={handleLogout} 
              startIcon={<ExitToApp />}
              size="small"
              sx={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#dc2626',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#f8fafc',
            borderRight: '1px solid #e2e8f0',
            boxShadow: 'none',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {filteredMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    margin: 1,
                    borderRadius: '12px',
                    fontWeight: 600,
                    backgroundColor: location.pathname === item.path 
                      ? '#e0e7ff'
                      : 'transparent',
                    border: '1px solid',
                    borderColor: location.pathname === item.path 
                      ? '#c7d2fe'
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: location.pathname === item.path ? '#2563eb' : '#64748b',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        fontWeight: 600,
                        color: location.pathname === item.path ? '#0f172a' : '#475569',
                      } 
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#f8fafc',
          minHeight: '100vh',
          p: 0,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
