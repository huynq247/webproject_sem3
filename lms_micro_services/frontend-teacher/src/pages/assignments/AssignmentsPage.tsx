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
} from '@mui/material';
import { Add, Assignment, Schedule, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { assignmentService, CreateAssignmentRequest } from '../../services/assignment.service';
import contentService from '../../services/content.service';
import { userService } from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';
import { RoleBasedComponent, useRolePermission } from '../../components/common/RoleBasedComponent';
import { GlassBackground, GlassHeader, GlassPaper } from '../../components/common/GlassTheme';

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
      <Container>
        <Typography>Loading assignments...</Typography>
      </Container>
    );
  }

  return (
    <GlassBackground>
      <Container maxWidth="lg">
        <GlassHeader
          icon="📝"
          title="Assignments"
          subtitle="Manage your assignments and track progress"
        >
          <RoleBasedComponent allowedRoles={['TEACHER', 'ADMIN']}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #D4AF37 30%, #FFD700 90%)',
                color: '#333333',
                fontWeight: 'bold',
                boxShadow: '0 3px 5px 2px rgba(212, 175, 55, .3)',
                borderRadius: 25,
                px: 3,
                py: 1,
                '&:hover': {
                  background: 'linear-gradient(45deg, #B8860B 30%, #D4AF37 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 10px 4px rgba(212, 175, 55, .4)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Create Assignment
            </Button>
          </RoleBasedComponent>
        </GlassHeader>

        {/* Assignment Statistics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3, mb: 4 }}>
          <GlassPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
              <Assignment sx={{ mr: 2, color: '#2196F3', fontSize: '2rem' }} />
              <Box>
                <Typography variant="h4" sx={{ fontSize: '2rem', fontWeight: 800, color: '#1e3c72' }}>
                  {assignmentsData?.assignments?.length || 0}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e3c72', opacity: 0.8 }}>
                  Total Assignments
                </Typography>
              </Box>
            </Box>
          </GlassPaper>
          
          <GlassPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
              <RadioButtonUnchecked sx={{ mr: 2, color: '#FF9800', fontSize: '2rem' }} />
              <Box>
                <Typography variant="h4" sx={{ fontSize: '2rem', fontWeight: 800, color: '#1e3c72' }}>
                  {assignmentsData?.assignments?.filter(a => a.status === 'pending').length || 0}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e3c72', opacity: 0.8 }}>
                  Pending
                </Typography>
              </Box>
            </Box>
          </GlassPaper>
          
          <GlassPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
              <Schedule sx={{ mr: 2, color: '#FF9800', fontSize: '2rem' }} />
              <Box>
                <Typography variant="h4" sx={{ fontSize: '2rem', fontWeight: 800, color: '#1e3c72' }}>
                  {assignmentsData?.assignments?.filter(a => a.status === 'in_progress').length || 0}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e3c72', opacity: 0.8 }}>
                  In Progress
                </Typography>
              </Box>
            </Box>
          </GlassPaper>
          
          <GlassPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
              <CheckCircle sx={{ mr: 2, color: '#4CAF50', fontSize: '2rem' }} />
              <Box>
                <Typography variant="h4" sx={{ fontSize: '2rem', fontWeight: 800, color: '#1e3c72' }}>
                  {assignmentsData?.assignments?.filter(a => a.status === 'completed').length || 0}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e3c72', opacity: 0.8 }}>
                  Completed
                </Typography>
              </Box>
            </Box>
          </GlassPaper>
        </Box>

        {/* Assignments Tabs */}
        <GlassPaper>
          <Box sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs
                value={tabValue}
                onChange={(event, newValue) => setTabValue(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    color: '#1e3c72',
                    fontWeight: 600,
                    '&.Mui-selected': {
                      color: '#2a5298',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#2a5298',
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
                <Box sx={{ display: 'grid', gap: 2 }}>
                  {getFilteredAssignments(index).length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Assignment sx={{ fontSize: 64, color: 'rgba(30, 60, 114, 0.5)', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#1e3c72', mb: 1 }}>
                        No assignments found
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1e3c72', opacity: 0.7 }}>
                        {index === 0 ? 'No assignments available yet' : `No ${['', 'pending', 'in progress', 'completed'][index]} assignments`}
                      </Typography>
                    </Box>
                  ) : (
                    getFilteredAssignments(index).map((assignment) => (
                      <Card 
                        key={assignment.id}
                        sx={{
                          background: 'linear-gradient(135deg, rgba(255, 248, 220, 0.9) 0%, rgba(255, 239, 153, 0.8) 100%)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 215, 0, 0.3)',
                          color: '#1e3c72',
                          '&:hover': {
                            background: 'linear-gradient(135deg, rgba(255, 248, 220, 0.95) 0%, rgba(255, 215, 0, 0.6) 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6" sx={{ color: '#1e3c72', fontWeight: 600 }}>
                              {assignment.title}
                            </Typography>
                            <Chip 
                              label={assignment.status.replace('_', ' ')} 
                              color={getStatusColor(assignment.status) as any}
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body2" sx={{ color: '#1e3c72', opacity: 0.8, mb: 2 }}>
                            {assignment.description}
                          </Typography>
                          
                          {assignment.status === 'in_progress' && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="caption" sx={{ color: '#1e3c72', opacity: 0.7, mb: 1, display: 'block' }}>
                                Progress
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.random() * 100} // Replace with actual progress
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: 'rgba(30, 60, 114, 0.2)',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#2a5298',
                                  },
                                }}
                              />
                            </Box>
                          )}
                        </CardContent>
                        
                        <CardActions sx={{ justifyContent: 'space-between' }}>
                          <Typography variant="caption" sx={{ color: '#1e3c72', opacity: 0.6 }}>
                            Created: {new Date(assignment.created_at).toLocaleDateString()}
                          </Typography>
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => navigate(`/assignments/${assignment.id}`)}
                            sx={{
                              color: '#1e3c72',
                              borderColor: '#1e3c72',
                              '&:hover': {
                                backgroundColor: 'rgba(30, 60, 114, 0.1)',
                                borderColor: '#2a5298',
                              },
                            }}
                          >
                            View Details
                          </Button>
                        </CardActions>
                      </Card>
                    ))
                  )}
                </Box>
              </TabPanel>
            ))}
          </Box>
        </GlassPaper>

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
      </Container>
    </GlassBackground>
  );
};

export default AssignmentsPage;
