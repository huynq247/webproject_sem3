import React, { useState } from 'react';
import {
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Box,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  LinearProgress,
  Paper,
  Fade,
  Grow,
} from '@mui/material';
import { Add, Assignment, Schedule, CheckCircle, RadioButtonUnchecked, School, BookOutlined } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { assignmentService, CreateAssignmentRequest } from '../../services/assignment.service';
import contentService from '../../services/content.service';
import { userService } from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';
import { RoleBasedComponent, useRolePermission } from '../../components/common/RoleBasedComponent';
import { GlassBackground } from '../../components/common/GlassTheme';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`assignment-tabpanel-${index}`}
      aria-labelledby={`assignment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AssignmentsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateAssignmentRequest>();

  // Fetch assignments
  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => assignmentService.getAssignments(),
  });

  // Fetch courses for dropdown
  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: () => contentService.getCourses(),
  });

  // Fetch decks for dropdown
  const { data: decksData } = useQuery({
    queryKey: ['decks'],
    queryFn: () => contentService.getDecks(),
  });

  // Fetch students for dropdown (teacher's students)
  const { data: studentsData } = useQuery({
    queryKey: ['my-students'],
    queryFn: () => userService.getMyStudents(),
    enabled: user?.role === 'TEACHER' || user?.role === 'ADMIN',
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: assignmentService.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setOpen(false);
      reset();
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to create assignment');
    },
  });

  const handleCreateAssignment = async (data: any) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    if (!data.student_id) {
      setError('Please select a student');
      return;
    }

    if (!data.content_id) {
      setError('Please select a course');
      return;
    }

    // Get the selected course title
    const selectedCourse = coursesData?.courses?.find(course => course.id === data.content_id);
    
    // Get supporting deck info if selected
    const supportingDecks = data.supporting_decks ? [data.supporting_decks] : [];
    const supportingDeckTitles = data.supporting_decks 
      ? [decksData?.decks?.find(deck => deck.id === data.supporting_decks)?.title || 'Unknown Deck']
      : [];
    
    const assignmentData: CreateAssignmentRequest = {
      instructor_id: parseInt(user.id.toString()),
      student_id: parseInt(data.student_id),
      content_type: 'course',
      content_id: data.content_id,
      content_title: selectedCourse?.title || 'Unknown Course',
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      due_date: data.due_date,
      supporting_decks: supportingDecks,
      supporting_deck_titles: supportingDeckTitles,
    };

    createAssignmentMutation.mutate(assignmentData);
  };

  const getFilteredAssignments = (tabIndex: number) => {
    if (!assignmentsData?.assignments) return [];
    
    switch (tabIndex) {
      case 0: return assignmentsData.assignments; // All
      case 1: return assignmentsData.assignments.filter(a => a.status === 'pending');
      case 2: return assignmentsData.assignments.filter(a => a.status === 'in_progress'); 
      case 3: return assignmentsData.assignments.filter(a => a.status === 'completed');
      default: return assignmentsData.assignments;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <GlassBackground>
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4, textAlign: 'center' }}>
          <Typography color="#1F2937" variant="h6">Loading assignments...</Typography>
        </Box>
      </GlassBackground>
    );
  }

  return (
    <GlassBackground>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ 
            fontWeight: 800,
            color: '#7b8ec8',
          }}>
            📚 My Assignments
          </Typography>
          <Typography variant="subtitle1" sx={{ 
            mb: 2,
            color: '#6B7280',
            fontSize: '1.1rem'
          }}>
            Track your learning progress and complete assignments
          </Typography>
          
          <RoleBasedComponent allowedRoles={['TEACHER', 'ADMIN']}>
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
                  boxShadow: '0 6px 10px 4px rgba(255, 105, 135, .3)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Create Assignment
            </Button>
          </RoleBasedComponent>
        </Box>

        {/* Assignment Statistics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3, mb: 4 }}>
          <Fade in timeout={600}>
            <Paper
              elevation={2}
              sx={{
                background: '#ffffff',
                border: '1px solid rgba(168, 184, 240, 0.2)',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(168, 184, 240, 0.25)',
                  borderColor: '#a8b8f0',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Assignment sx={{ mr: 2, color: '#64B5F6', fontSize: '2.5rem' }} />
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontSize: '2rem', 
                    fontWeight: 800, 
                    color: '#1F2937',
                  }}>
                    {assignmentsData?.assignments?.length || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 600, 
                    color: '#6B7280',
                  }}>
                    Total Assignments
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Fade>
          
          <Fade in timeout={700}>
            <Paper
              elevation={2}
              sx={{
                background: '#ffffff',
                border: '1px solid rgba(168, 184, 240, 0.2)',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 10px 30px rgba(255, 152, 0, 0.3)',
                  borderColor: '#a8b8f0',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <RadioButtonUnchecked sx={{ mr: 2, color: '#FFB74D', fontSize: '2.5rem' }} />
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontSize: '2rem', 
                    fontWeight: 800, 
                    color: '#1F2937',
                  }}>
                    {assignmentsData?.assignments?.filter(a => a.status === 'pending').length || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 600, 
                    color: '#6B7280',
                  }}>
                    Pending
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Fade>
          
          <Fade in timeout={800}>
            <Paper
              elevation={2}
              sx={{
                background: '#ffffff',
                border: '1px solid rgba(168, 184, 240, 0.2)',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(168, 184, 240, 0.25)',
                  borderColor: '#a8b8f0',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Schedule sx={{ mr: 2, color: '#FFB74D', fontSize: '2.5rem' }} />
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontSize: '2rem', 
                    fontWeight: 800, 
                    color: '#1F2937',
                  }}>
                    {assignmentsData?.assignments?.filter(a => a.status === 'in_progress').length || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 600, 
                    color: '#6B7280',
                  }}>
                    In Progress
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Fade>
          
          <Fade in timeout={900}>
            <Paper
              elevation={2}
              sx={{
                background: '#ffffff',
                border: '1px solid rgba(168, 184, 240, 0.2)',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(168, 184, 240, 0.25)',
                  borderColor: '#a8b8f0',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <CheckCircle sx={{ mr: 2, color: '#81C784', fontSize: '2.5rem' }} />
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontSize: '2rem', 
                    fontWeight: 800, 
                    color: '#1F2937',
                  }}>
                    {assignmentsData?.assignments?.filter(a => a.status === 'completed').length || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 600, 
                    color: '#6B7280',
                  }}>
                    Completed
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Fade>
        </Box>

        {/* Assignments Tabs */}
        <Grow in timeout={1000}>
          <Paper
            elevation={2}
            sx={{
              background: '#ffffff',
              border: '1px solid rgba(168, 184, 240, 0.2)',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(168, 184, 240, 0.1)',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'rgba(168, 184, 240, 0.2)', mb: 3 }}>
                <Tabs
                  value={tabValue}
                  onChange={(event, newValue) => setTabValue(newValue)}
                  sx={{
                    '& .MuiTab-root': {
                      color: '#6B7280',
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      '&.Mui-selected': {
                        color: '#7b8ec8',
                        fontWeight: 700,
                      },
                      '&:hover': {
                        color: '#7b8ec8',
                        background: 'rgba(168, 184, 240, 0.08)',
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#a8b8f0',
                      height: 3,
                      borderRadius: '2px 2px 0 0',
                    },
                  }}
                >
                  <Tab label={`All (${assignmentsData?.assignments?.length || 0})`} />
                  <Tab label={`Pending (${assignmentsData?.assignments?.filter(a => a.status === 'pending').length || 0})`} />
                  <Tab label={`In Progress (${assignmentsData?.assignments?.filter(a => a.status === 'in_progress').length || 0})`} />
                  <Tab label={`Completed (${assignmentsData?.assignments?.filter(a => a.status === 'completed').length || 0})`} />
                </Tabs>
              </Box>

              {[0, 1, 2, 3].map((index) => (
                <TabPanel key={index} value={tabValue} index={index}>
                  <Box sx={{ display: 'grid', gap: 3 }}>
                    {getFilteredAssignments(index).length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Assignment sx={{ fontSize: 80, color: '#a8b8f0', mb: 2 }} />
                        <Typography variant="h6" sx={{ 
                          color: '#1F2937', 
                          mb: 1,
                          fontWeight: 600,
                        }}>
                          No assignments found
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#6B7280',
                        }}>
                          {index === 0 ? 'No assignments available yet' : `No ${['', 'pending', 'in progress', 'completed'][index]} assignments`}
                        </Typography>
                      </Box>
                    ) : (
                      getFilteredAssignments(index).map((assignment) => (
                        <Fade in key={assignment.id} timeout={600}>
                          <Card 
                            sx={{
                              background: '#ffffff',
                              border: '1px solid rgba(168, 184, 240, 0.2)',
                              borderRadius: 2,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              cursor: 'pointer',
                              '&:hover': {
                                background: 'rgba(168, 184, 240, 0.05)',
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 24px rgba(168, 184, 240, 0.2)',
                                borderColor: '#a8b8f0',
                              },
                            }}
                          >
                            <CardContent sx={{ pb: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h6" sx={{ 
                                  color: '#1F2937', 
                                  fontWeight: 700,
                                }}>
                                  {assignment.title}
                                </Typography>
                                <Chip 
                                  label={assignment.status.replace('_', ' ')} 
                                  color={getStatusColor(assignment.status) as any}
                                  size="small"
                                  sx={{ fontWeight: 600 }}
                                />
                              </Box>
                              
                              <Typography variant="body2" sx={{ 
                                color: '#4B5563', 
                                mb: 2, 
                                lineHeight: 1.6,
                              }}>
                                {assignment.description}
                              </Typography>
                              
                              {assignment.status === 'in_progress' && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="caption" sx={{ 
                                    color: '#6B7280', 
                                    mb: 1, 
                                    display: 'block', 
                                    fontWeight: 600,
                                  }}>
                                    Progress
                                  </Typography>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={Math.random() * 100} // Replace with actual progress
                                    sx={{
                                      height: 8,
                                      borderRadius: 4,
                                      backgroundColor: 'rgba(168, 184, 240, 0.2)',
                                      '& .MuiLinearProgress-bar': {
                                        backgroundColor: '#a8b8f0',
                                        borderRadius: 4,
                                      },
                                    }}
                                  />
                                </Box>
                              )}
                            </CardContent>
                            
                            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                              <Typography variant="caption" sx={{ 
                                color: '#6B7280',
                              }}>
                                Created: {new Date(assignment.created_at).toLocaleDateString()}
                              </Typography>
                              <Button 
                                size="small" 
                                variant="contained"
                                onClick={() => navigate(`/assignments/${assignment.id}`)}
                                sx={{
                                  background: 'linear-gradient(135deg, #a8b8f0 0%, #7b8ec8 100%)',
                                  color: '#ffffff',
                                  fontWeight: 600,
                                  boxShadow: '0 2px 8px rgba(168, 184, 240, 0.3)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #7b8ec8 0%, #6674a8 100%)',
                                    boxShadow: '0 4px 12px rgba(168, 184, 240, 0.4)',
                                    transform: 'scale(1.02)',
                                  },
                                  transition: 'all 0.3s ease',
                                }}
                              >
                                View Details
                              </Button>
                            </CardActions>
                          </Card>
                        </Fade>
                      ))
                    )}
                  </Box>
                </TabPanel>
              ))}
            </Box>
          </Paper>
        </Grow>

        {/* Create Assignment Dialog */}
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
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <TextField
              autoFocus
              margin="dense"
              label="Assignment Title"
              fullWidth
              variant="outlined"
              {...register('title', { required: 'Assignment title is required' })}
              error={!!errors.title}
              helperText={errors.title?.message}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              {...register('description', { required: 'Description is required' })}
              error={!!errors.description}
              helperText={errors.description?.message}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              label="Instructor ID"
              fullWidth
              variant="outlined"
              value={user?.id || ''}
              disabled
              sx={{ mb: 2 }}
              helperText="This will be automatically filled"
            />
            
            <TextField
              margin="dense"
              label="Instructions"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              {...register('instructions')}
              sx={{ mb: 2 }}
              helperText="Optional: Provide specific instructions for this assignment"
            />
            
            <TextField
              margin="dense"
              label="Due Date"
              type="datetime-local"
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              {...register('due_date')}
              sx={{ mb: 2 }}
            />
            
            <TextField
              select
              margin="dense"
              label="Student"
              fullWidth
              variant="outlined"
              {...register('student_id', { required: 'Student selection is required' })}
              error={!!errors.student_id}
              helperText={errors.student_id?.message}
              sx={{ mb: 2 }}
            >
              {studentsData?.users?.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.full_name} ({student.username})
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              margin="dense"
              label="Course"
              fullWidth
              variant="outlined"
              {...register('content_id', { required: 'Course selection is required' })}
              error={!!errors.content_id}
              helperText={errors.content_id?.message}
              sx={{ mb: 2 }}
            >
              {coursesData?.courses?.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.title}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              margin="dense"
              label="Supporting Flashcard Deck (Optional)"
              fullWidth
              variant="outlined"
              {...register('supporting_decks')}
              sx={{ mb: 2 }}
            >
              <MenuItem value="">None</MenuItem>
              {decksData?.decks?.map((deck) => (
                <MenuItem key={deck.id} value={deck.id}>
                  {deck.title}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit(handleCreateAssignment)}
              variant="contained"
              disabled={createAssignmentMutation.isPending}
            >
              {createAssignmentMutation.isPending ? 'Creating...' : 'Create Assignment'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </GlassBackground>
  );
};

export default AssignmentsPage;
