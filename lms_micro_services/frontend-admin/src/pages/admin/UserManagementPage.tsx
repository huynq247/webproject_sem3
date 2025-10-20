import React, { useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { Add, Edit, Delete, Person } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { RoleBasedComponent } from '../../components/common/RoleBasedComponent';
import { GlassContainer } from '../../components/common/GlassContainer';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

interface UpdateUserRequest {
  username?: string;
  email?: string;
  full_name?: string;
  password?: string;
  is_active?: boolean;
}

// Updated service with proper API Gateway URLs and authentication
const userService = {
  getUsers: async (): Promise<{ users: User[] }> => {
    try {
      console.log('🔑 Using apiClient for users request');
      console.log('🌐 API URL:', `${process.env.REACT_APP_API_GATEWAY_URL}/api/v1/users`);
      
      const response = await apiClient.get('/api/v1/users');
      
      console.log('📡 Users API Response status:', response.status);
      console.log('✅ Users API Data:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Users API Error:', error);
      throw error;
    }
  },

  // Get students created by current teacher
  getMyStudents: async (): Promise<{ users: User[] }> => {
    try {
      const response = await apiClient.get('/api/v1/users/my-students');
      return response.data;
    } catch (error) {
      console.error('❌ My students API Error:', error);
      throw error;
    }
  },
  
  createUser: async (userData: CreateUserRequest) => {
    try {
      console.log('🔧 Creating user with data:', userData);
      const response = await apiClient.post('/api/v1/users', userData);
      
      console.log('📡 Create user response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Create user error:', error);
      throw error;
    }
  },
  
  updateUser: async (userId: number, userData: Partial<UpdateUserRequest>) => {
    try {
      console.log('📡 Updating user with ID:', userId, 'Data:', userData);
      
      const response = await apiClient.put(`/api/v1/users/${userId}`, userData);
      
      console.log('📡 Update user response status:', response.status);
      console.log('✅ Update successful');
      return response.data;
    } catch (error) {
      console.error('❌ Update user error:', error);
      throw error;
    }
  },

  deleteUser: async (userId: number) => {
    try {
      console.log('📡 Deleting user with ID:', userId);
      
      const response = await apiClient.delete(`/api/v1/users/${userId}`);
      
      console.log('📡 Delete user response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Delete user error:', error);
      throw error;
    }
  }
};

const UserManagementPage: React.FC = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateUserRequest>({
    defaultValues: {
      role: 'STUDENT'
    }
  });

  // Watch role value for debugging
  const watchedRole = watch('role');
  console.log('Current form role value:', watchedRole);
  console.log('Current user:', user);
  console.log('Current user role:', user?.role);
  console.log('User role uppercase:', user?.role?.toUpperCase());

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    control: controlEdit,
    formState: { errors: errorsEdit },
    setValue: setValueEdit,
  } = useForm<UpdateUserRequest>();

  // Fetch users based on role
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', user?.role],
    queryFn: () => {
      if (user?.role?.toUpperCase() === 'ADMIN') {
        return userService.getUsers(); // Admin sees all users
      } else if (user?.role?.toUpperCase() === 'TEACHER') {
        return userService.getMyStudents(); // Teacher sees only their students
      } else {
        throw new Error('Unauthorized');
      }
    },
    enabled: !!user,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      // Invalidate appropriate queries based on user role
      if (user?.role === 'TEACHER') {
        queryClient.invalidateQueries({ queryKey: ['my-students'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['users'] });
      }
      setOpenCreateDialog(false);
      reset();
      setError('');
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create user');
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, userData }: { userId: number; userData: Partial<UpdateUserRequest> }) => 
      userService.updateUser(userId, userData),
    onSuccess: () => {
      // Invalidate appropriate queries based on user role
      if (user?.role === 'TEACHER') {
        queryClient.invalidateQueries({ queryKey: ['my-students'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['users'] });
      }
      setOpenEditDialog(false);
      resetEdit();
      setSelectedUser(null);
      setError('');
    },
    onError: (err: any) => {
      console.error('❌ Update user mutation error:', err);
      setError(err.message || 'Failed to update user');
      
      // Check if it's an auth error
      if (err.message && (err.message.includes('401') || err.message.includes('403'))) {
        console.error('🔒 Authentication error detected in mutation');
        // The AuthContext should handle token cleanup
      }
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      // Invalidate appropriate queries based on user role
      if (user?.role === 'TEACHER') {
        queryClient.invalidateQueries({ queryKey: ['my-students'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['users'] });
      }
      setError('');
    },
    onError: (err: any) => {
      console.error('❌ Delete user error:', err);
      setError(err.message || 'Failed to delete user');
    },
  });

  const handleCreateUser = (data: CreateUserRequest) => {
    console.log('🔧 Creating user with data from form:', data);
    console.log('🔧 Current user role:', user?.role);
    createUserMutation.mutate(data);
  };

  const handleEditUser = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setValueEdit('username', userToEdit.username);
    setValueEdit('email', userToEdit.email);
    setValueEdit('full_name', userToEdit.full_name);
    setValueEdit('is_active', userToEdit.is_active);
    setOpenEditDialog(true);
  };

  const handleUpdateUser = (data: UpdateUserRequest) => {
    if (!selectedUser) return;
    
    // Remove password from data if it's empty (don't change password)
    const updateData = { ...data };
    if (!updateData.password || updateData.password.trim() === '') {
      delete updateData.password;
    }
    
    console.log('🔧 Updating user with data from form:', updateData);
    updateUserMutation.mutate({ userId: selectedUser.id, userData: updateData });
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('Are you sure you want to deactivate this user? They will not be able to login until reactivated.')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'error';
      case 'TEACHER':
        return 'warning';
      case 'STUDENT':
        return 'primary';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Typography>Loading users...</Typography>
      </Container>
    );
  }

  return (
    <RoleBasedComponent 
      allowedRoles={['ADMIN', 'TEACHER']} 
      fallback={
        <Container maxWidth="lg">
          <Alert severity="error">Access denied. Admin privileges required.</Alert>
        </Container>
      }
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              reset({ role: 'STUDENT' }); // Reset form with default values
              setError(''); // Clear any previous errors
              setOpenCreateDialog(true);
            }}
          >
            Create User
          </Button>
        </Box>

        {/* Main page error display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Users Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersData?.users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      color={getRoleColor(user.role)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.is_active ? 'Active' : 'Inactive'} 
                      color={user.is_active ? 'success' : 'default'}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      sx={{ mr: 1 }}
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </Button>
                    {user.is_active ? (
                      <Button
                        size="small"
                        color="warning"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleEditUser(user)}
                      >
                        Reactivate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Create User Dialog */}
        <Dialog 
          open={openCreateDialog} 
          onClose={() => {
            reset({ role: 'STUDENT' }); // Reset form when closing
            setError('');
            setOpenCreateDialog(false);
          }} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>
            Create New User 
            <Typography variant="caption" display="block" color="text.secondary">
              Current user role: {user?.role} | Can create all roles: {user?.role?.toUpperCase() === 'ADMIN' ? 'Yes' : 'No'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <TextField
              {...register('username', { required: 'Username is required' })}
              label="Username"
              fullWidth
              margin="normal"
              error={!!errors.username}
              helperText={errors.username?.message}
            />
            
            <TextField
              {...register('email', { required: 'Email is required' })}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            
            <TextField
              {...register('password', { required: 'Password is required', minLength: 8 })}
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            
            <TextField
              {...register('full_name', { required: 'Full name is required' })}
              label="Full Name"
              fullWidth
              margin="normal"
              error={!!errors.full_name}
              helperText={errors.full_name?.message}
            />
            
            <Controller
              name="role"
              control={control}
              rules={{ required: 'Role is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Role"
                  select
                  fullWidth
                  margin="normal"
                  error={!!errors.role}
                  helperText={errors.role?.message}
                  value={field.value || 'STUDENT'}
                  onChange={(e) => {
                    console.log('Role changed to:', e.target.value);
                    field.onChange(e.target.value);
                  }}
                >
                  <MenuItem value="STUDENT">Student</MenuItem>
                  <MenuItem value="TEACHER">Teacher</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </TextField>
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              reset({ role: 'STUDENT' });
              setError('');
              setOpenCreateDialog(false);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(handleCreateUser)}
              variant="contained"
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              {...registerEdit('username', { required: 'Username is required' })}
              label="Username"
              fullWidth
              margin="normal"
              error={!!errorsEdit.username}
              helperText={errorsEdit.username?.message}
            />
            
            <TextField
              {...registerEdit('email', { required: 'Email is required' })}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!errorsEdit.email}
              helperText={errorsEdit.email?.message}
            />
            
            <TextField
              {...registerEdit('full_name', { required: 'Full name is required' })}
              label="Full Name"
              fullWidth
              margin="normal"
              error={!!errorsEdit.full_name}
              helperText={errorsEdit.full_name?.message}
            />

            <TextField
              {...registerEdit('password', { 
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              label="New Password (leave empty to keep current)"
              type="password"
              fullWidth
              margin="normal"
              error={!!errorsEdit.password}
              helperText={errorsEdit.password?.message || "Leave empty if you don't want to change password"}
              placeholder="Enter new password to reset"
            />

            <Controller
              name="is_active"
              control={controlEdit}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Status"
                  select
                  fullWidth
                  margin="normal"
                  value={field.value ? 'true' : 'false'}
                  onChange={(e) => field.onChange(e.target.value === 'true')}
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </TextField>
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEdit(handleUpdateUser)}
              variant="contained"
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </RoleBasedComponent>
  );
};

export default UserManagementPage;
