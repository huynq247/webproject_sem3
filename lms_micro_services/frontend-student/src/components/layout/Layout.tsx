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
    { text: 'My Assignments', icon: <Assignment />, path: '/assignments', roles: ['STUDENT'] },
    { text: 'Flashcard Decks', icon: <Quiz />, path: '/decks', roles: ['STUDENT'] },
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
          background: '#ffffff',
          boxShadow: '0 2px 12px rgba(168, 184, 240, 0.15)',
          color: '#1F2937',
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 800,
              color: '#7b8ec8',
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
                color: '#4B5563',
              }}
            >
              Welcome, {user?.full_name || user?.username} ({user?.role})
            </Typography>
            <Button 
              onClick={handleLogout} 
              startIcon={<ExitToApp />}
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #a8b8f0 0%, #7b8ec8 100%)',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #7b8ec8 0%, #6674a8 100%)',
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
            background: 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)',
            border: 'none',
            borderRight: '1px solid rgba(168, 184, 240, 0.2)',
            boxShadow: '4px 0 16px rgba(168, 184, 240, 0.1)',
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
                    background: location.pathname === item.path 
                      ? 'linear-gradient(135deg, #a8b8f0 0%, #7b8ec8 100%)'
                      : 'transparent',
                    border: location.pathname === item.path 
                      ? 'none'
                      : '1px solid transparent',
                    '&:hover': {
                      background: location.pathname === item.path 
                        ? 'linear-gradient(135deg, #7b8ec8 0%, #6674a8 100%)'
                        : 'rgba(168, 184, 240, 0.08)',
                      transform: 'translateX(4px)',
                      boxShadow: '4px 4px 15px rgba(168, 184, 240, 0.1)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: location.pathname === item.path ? '#ffffff' : '#7b8ec8',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        fontWeight: 600,
                        color: location.pathname === item.path ? '#ffffff' : '#1F2937',
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
          background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 50%, #e8f2ff 100%)',
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
