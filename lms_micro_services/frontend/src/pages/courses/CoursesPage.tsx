import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Divider,
  Paper,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { Add, School, Edit, Delete, MoreVert, Visibility, Person, CalendarToday } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { contentService, CreateCourseRequest } from '../../services/content.service';
import { assignmentService } from '../../services/assignment.service';
import { useAuth } from '../../context/AuthContext';
import { GlassBackground, GlassHeader, GlassPaper } from '../../components/common/GlassTheme';

const CoursesPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCourseRequest>();

  // Fetch courses (backend now handles role-based filtering)
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['courses', user?.role, user?.id],
    queryFn: contentService.getCourses,
    enabled: !!user,
  });

  console.log('📚 Courses Data:', coursesData);
  console.log('📚 Courses Array:', coursesData?.courses);
  console.log('📚 Courses Count:', coursesData?.courses?.length);
  console.log('📚 Is Loading:', isLoading);
  console.log('👤 User Role:', user?.role, 'User ID:', user?.id);

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: contentService.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', user?.role, user?.id] });
      setOpen(false);
      reset();
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to create course');
    },
  });

  const handleCreateCourse = (data: CreateCourseRequest) => {
    createCourseMutation.mutate({
      ...data,
      instructor_id: user?.id?.toString() || '1',
    });
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, course: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const handleEditCourse = () => {
    if (selectedCourse) {
      setEditOpen(true);
    }
    setAnchorEl(null); // Chỉ đóng menu, không reset selectedCourse
  };

  const handleDeleteCourse = () => {
    // TODO: Implement delete course
    console.log('Delete course:', selectedCourse);
    setAnchorEl(null); // Chỉ đóng menu, không reset selectedCourse
  };

  const canEditDelete = (course: any) => {
    return user?.role === 'ADMIN' || (user?.role === 'TEACHER' && course.instructor_id === user?.id);
  };

  if (isLoading) {
    return (
      <Container>
        <Typography>Loading courses...</Typography>
      </Container>
    );
  }

  return (
    <GlassBackground>
      <Container maxWidth="lg">
        <GlassHeader
          icon="🎓"
          title="Courses"
          subtitle="Discover and enroll in learning courses"
        >
          {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
            <Button
              variant="contained"
                startIcon={<Add />}
                onClick={() => setOpen(true)}
                sx={{
                  background: 'linear-gradient(45deg, #1e3c72 30%, #2a5298 90%)',
                  boxShadow: '0 3px 5px 2px rgba(30, 60, 114, .3)',
                  borderRadius: 25,
                  px: 3,
                  py: 1,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #2a5298 30%, #19547b 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 10px 4px rgba(30, 60, 114, .3)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Create Course
              </Button>
            )}
        </GlassHeader>

      {/* Courses List */}
      {coursesData?.courses?.length === 0 ? (
        <GlassPaper>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ color: 'white', fontWeight: 500 }}>
              No courses available. Create your first course!
            </Typography>
          </Box>
        </GlassPaper>
      ) : (
        <GlassPaper>
          <Box sx={{ p: 2 }}>
            <List sx={{ color: 'white' }}>
              {coursesData?.courses?.map((course, index) => (
                <React.Fragment key={course.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      px: 3,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: course.is_active ? 'primary.main' : 'grey.400',
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}
                    >
                      <School />
                    </Avatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="h6" component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                            {course.title}
                          </Typography>
                          <Chip
                            size="small"
                            label={course.is_active ? 'Active' : 'Inactive'}
                            color={course.is_active ? 'success' : 'warning'}
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            size="small"
                            label={`${course.total_lessons || course.lessons?.length || 0} Lessons`}
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {course.description || 'No description available'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                              <Typography variant="caption" color="text.secondary">
                                Created: {new Date(course.created_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                            {course.instructor_name && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Person sx={{ fontSize: 14, mr: 0.5 }} />
                                <Typography variant="caption" color="text.secondary">
                                  Instructor: {course.instructor_name}
                                </Typography>
                              </Box>
                            )}
                            <Button
                              variant="text"
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewCourse(course.id)}
                              sx={{ 
                                fontSize: '0.75rem',
                                minWidth: 'auto',
                                px: 1,
                                py: 0.5,
                                ml: 'auto'
                              }}
                            >
                              View Details
                            </Button>
                          </Box>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {canEditDelete(course) && (
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, course)}
                            sx={{ ml: 1 }}
                          >
                            <MoreVert />
                          </IconButton>
                        )}
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < coursesData.courses.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        </GlassPaper>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)} // Chỉ đóng menu, không reset selectedCourse
      >
        <MenuItem onClick={handleEditCourse}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteCourse} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Course Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
          }
        }}
      >
        <DialogTitle>Create New Course</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            autoFocus
            margin="dense"
            label="Course Title"
            fullWidth
            variant="outlined"
            {...register('title', { required: 'Course title is required' })}
            error={!!errors.title}
            helperText={errors.title?.message}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Course Description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            {...register('description', { required: 'Course description is required' })}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit(handleCreateCourse)}
            variant="contained"
            disabled={createCourseMutation.isPending}
          >
            {createCourseMutation.isPending ? 'Creating...' : 'Create Course'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog 
        open={editOpen} 
        onClose={() => {
          setEditOpen(false);
          setSelectedCourse(null);
        }} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
          }
        }}
      >
        <DialogTitle>Edit Course</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Course Title"
            fullWidth
            variant="outlined"
            defaultValue={selectedCourse?.title || ''}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Course Description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            defaultValue={selectedCourse?.description || ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditOpen(false);
            setSelectedCourse(null);
          }}>Cancel</Button>
          <Button 
            variant="contained"
          >
            Update Course
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </GlassBackground>
  );
};

export default CoursesPage;
