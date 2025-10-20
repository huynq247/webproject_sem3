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
  role?: 'STUDENT' | 'TEACHER' | 'ADMIN';
  is_active?: boolean;
}

// Updated service with proper API Gateway URLs and authentication
const userService = {
  getUsers: async (): Promise<{ users: User[] }> => {
    try {
      console.log('🔑 Using apiClient for users request');
      
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

  updateUser: async ({ userId, userData }: { userId: number; userData: UpdateUserRequest }) => {
    try {
      console.log('� Updating user with ID:', userId, 'Data:', userData);
      
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
    formState: { errors },
  } = useForm<CreateUserRequest>({
    defaultValues: {
      role: 'STUDENT'
    }
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    control: controlEdit,
    formState: { errors: errorsEdit },
    setValue,
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
    mutationFn: userService.updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['my-students'] });
      setOpenEditDialog(false);
      resetEdit();
      setSelectedUser(null);
      setError('');
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to update user');
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleCreateUser = (data: CreateUserRequest) => {
    console.log('🔧 Creating user with data from form:', data);
    console.log('🔧 Current user role:', user?.role);
    createUserMutation.mutate(data);
  };

  const handleEditUser = (userData: User) => {
    setSelectedUser(userData);
    setValue('username', userData.username);
    setValue('email', userData.email);
    setValue('full_name', userData.full_name);
    setValue('is_active', userData.is_active);
    setOpenEditDialog(true);
    setError('');
  };

  const handleUpdateUser = (data: UpdateUserRequest) => {
    if (!selectedUser) return;
    console.log('🔧 Updating user:', selectedUser.id, 'with data:', data);
    updateUserMutation.mutate({ userId: selectedUser.id, userData: data });
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
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
            onClick={() => setOpenCreateDialog(true)}
          >
            Create User
          </Button>
        </Box>

        {/* Users Table */}
        <TableContainer 
          component={Paper}
          sx={{
            bgcolor: '#ffffff',
            backgroundImage: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
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
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Create User Dialog */}
        <Dialog 
          open={openCreateDialog} 
          onClose={() => setOpenCreateDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: '#ffffff',  // Solid white background
              backgroundImage: 'none',  // Remove any gradient
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            }
          }}
          BackdropProps={{
            sx: {
              bgcolor: 'rgba(0, 0, 0, 0.5)',  // Darker backdrop
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: '#3b82f6', 
            color: 'white',
            fontWeight: 600 
          }}>
            Create New User
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <TextField
              {...register('username', { required: 'Username is required' })}
              label="Username"
              fullWidth
              margin="normal"
              error={!!errors.username}
              helperText={errors.username?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
              }}
            />
            
            <TextField
              {...register('email', { required: 'Email is required' })}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
              }}
            />
            
            <TextField
              {...register('password', { required: 'Password is required', minLength: 8 })}
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
              }}
            />
            
            <TextField
              {...register('full_name', { required: 'Full name is required' })}
              label="Full Name"
              fullWidth
              margin="normal"
              error={!!errors.full_name}
              helperText={errors.full_name?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
              }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      '&:hover fieldset': {
                        borderColor: '#3b82f6',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#3b82f6',
                      },
                    },
                  }}
                >
                  <MenuItem value="STUDENT">Student</MenuItem>
                  {user?.role?.toUpperCase() === 'ADMIN' && (
                    <>
                      <MenuItem value="TEACHER">Teacher</MenuItem>
                      <MenuItem value="ADMIN">Admin</MenuItem>
                    </>
                  )}
                </TextField>
              )}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
            <Button 
              onClick={() => setOpenCreateDialog(false)}
              sx={{ color: '#64748b' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(handleCreateUser)}
              variant="contained"
              disabled={createUserMutation.isPending}
              sx={{
                bgcolor: '#3b82f6',
                '&:hover': {
                  bgcolor: '#2563eb',
                },
              }}
            >
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog 
          open={openEditDialog} 
          onClose={() => {
            setOpenEditDialog(false);
            setSelectedUser(null);
            resetEdit();
            setError('');
          }} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: '#ffffff',
              backgroundImage: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            }
          }}
          BackdropProps={{
            sx: {
              bgcolor: 'rgba(0, 0, 0, 0.5)',
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: '#3b82f6', 
            color: 'white',
            fontWeight: 600 
          }}>
            Edit User: {selectedUser?.username}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <TextField
              {...registerEdit('username', { required: 'Username is required' })}
              label="Username"
              fullWidth
              margin="normal"
              error={!!errorsEdit.username}
              helperText={errorsEdit.username?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
              }}
            />
            
            <TextField
              {...registerEdit('email', { required: 'Email is required' })}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!errorsEdit.email}
              helperText={errorsEdit.email?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
              }}
            />
            
            <TextField
              {...registerEdit('full_name', { required: 'Full name is required' })}
              label="Full Name"
              fullWidth
              margin="normal"
              error={!!errorsEdit.full_name}
              helperText={errorsEdit.full_name?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
              }}
            />
            
            <TextField
              label="Role"
              value={selectedUser?.role || ''}
              fullWidth
              margin="normal"
              disabled
              InputProps={{
                readOnly: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f8fafc',
                  '&:hover fieldset': {
                    borderColor: '#e2e8f0',
                  },
                  '&.Mui-disabled': {
                    bgcolor: '#f8fafc',
                  },
                },
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: '#64748b',
                },
              }}
              helperText="Role cannot be changed by teachers"
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      '&:hover fieldset': {
                        borderColor: '#3b82f6',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#3b82f6',
                      },
                    },
                  }}
                >
                  <MenuItem value={true as any}>Active</MenuItem>
                  <MenuItem value={false as any}>Inactive</MenuItem>
                </TextField>
              )}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
            <Button 
              onClick={() => {
                setOpenEditDialog(false);
                setSelectedUser(null);
                resetEdit();
                setError('');
              }}
              sx={{ color: '#64748b' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEdit(handleUpdateUser)}
              variant="contained"
              disabled={updateUserMutation.isPending}
              sx={{
                bgcolor: '#3b82f6',
                '&:hover': {
                  bgcolor: '#2563eb',
                },
              }}
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
