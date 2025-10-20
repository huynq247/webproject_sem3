import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  LinearProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fade,
  Grow,
} from '@mui/material';
import {
  ArrowBack,
  Assignment,
  Schedule,
  CheckCircle,
  PlayArrow,
  Pause,
  Edit,
  Timer,
  Person,
  School,
  ExpandMore,
  MenuBook,
  PlayCircle,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentService } from '../../services/assignment.service';
import { contentService } from '../../services/content.service';
import { useAuth } from '../../context/AuthContext';
import LessonViewer from '../../components/lessons/LessonViewer';
import LessonInlineViewer from '../../components/lessons/LessonInlineViewer';
import { GlassBackground } from '../../components/common/GlassTheme';
import { debugLog } from '../../config';

const AssignmentDetailPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isWorking, setIsWorking] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [lessonViewerOpen, setLessonViewerOpen] = useState(false);
  const [showInlineViewer, setShowInlineViewer] = useState(false);

  // Fetch assignment details
  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => assignmentService.getAssignment(Number(assignmentId)),
    enabled: !!assignmentId,
  });

  // Fetch course lessons if assignment is a course type
  const { data: courseLessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['course-lessons', assignment?.content_id],
    queryFn: () => contentService.getLessonsByCourse(assignment?.content_id || ''),
    enabled: !!assignment?.content_id && assignment?.content_type === 'course',
  });

  // Calculate progress from assignment data
  const progress = assignment ? {
    completion_percentage: assignment.course_progress_percentage || 0,
    time_spent: 0, // This would come from progress tracking in the future
    status: assignment.status
  } : null;

  // Update assignment status (simplified)
  const updateStatusMutation = useMutation({
    mutationFn: (status: 'pending' | 'in_progress' | 'completed' | 'overdue') =>
      assignmentService.updateAssignmentStatus(Number(assignmentId), status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });

  const handleStartWork = () => {
    setIsWorking(true);
    // Update assignment status to in_progress when first started
    if (assignment?.status === 'pending') {
      updateStatusMutation.mutate('in_progress');
    }
  };

  const handlePauseWork = () => {
    setIsWorking(false);
    // Pause timer and save progress
    updateStatusMutation.mutate('in_progress');
  };

  const handleCompleteAssignment = () => {
    updateStatusMutation.mutate('completed');
  };

  const handleStartLesson = (lesson: any) => {
    setSelectedLesson(lesson);
    setShowInlineViewer(true);
    
    // Mark assignment as in progress if not already
    if (assignment?.status === 'pending') {
      updateStatusMutation.mutate('in_progress');
    }
  };

  const handleLessonComplete = (lessonId: string) => {
    debugLog('Lesson completed:', lessonId);
    // Here you could track lesson completion in the assignment
    // For now, just log it
  };

  const handleCloseInlineViewer = () => {
    setShowInlineViewer(false);
    setSelectedLesson(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'in_progress':
        return <Schedule color="warning" />;
      default:
        return <Assignment color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <GlassBackground>
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>Loading assignment...</Typography>
        </Box>
      </GlassBackground>
    );
  }

  if (!assignment) {
    return (
      <GlassBackground>
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4, textAlign: 'center' }}>
          <Alert severity="error">Assignment not found</Alert>
        </Box>
      </GlassBackground>
    );
  }

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';
  const progressPercentage = progress?.completion_percentage || 0;
  const currentStatus = assignment.status;

  return (
    <GlassBackground>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/assignments')}
          variant="outlined"
          sx={{ 
            mb: 2,
            color: '#7c3aed',
            borderColor: '#c4b5fd',
            borderWidth: 2,
            fontWeight: 600,
            '&:hover': {
              borderColor: '#7c3aed',
              bgcolor: '#f5f3ff',
              borderWidth: 2
            }
          }}
        >
          Back to Assignments
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {getStatusIcon(currentStatus)}
              <Typography variant="h4" component="h1" sx={{ 
                ml: 2,
                color: '#5b21b6',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {assignment.title}
              </Typography>
              {isInstructor && (
                <IconButton sx={{ ml: 2, color: '#7c3aed' }}>
                  <Edit />
                </IconButton>
              )}
            </Box>

            <Typography variant="body1" sx={{ mb: 2, color: '#475569', fontWeight: 500 }}>
              {assignment.description}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={currentStatus.replace('_', ' ')} 
                color={getStatusColor(currentStatus) as any}
                sx={{ fontWeight: 600 }}
              />
              <Chip 
                label={assignment.content_title} 
                variant="outlined"
                icon={<School />}
                sx={{ 
                  borderColor: '#7c3aed',
                  color: '#7c3aed',
                  fontWeight: 600
                }}
              />
            </Box>

            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Created: {new Date(assignment.created_at).toLocaleDateString()}
              {assignment.due_date && (
                <> • Due: {new Date(assignment.due_date).toLocaleDateString()}</>
              )}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Progress Section */}
      <Card sx={{ 
        mb: 3,
        background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
        border: '2px solid #c4b5fd',
        borderRadius: 2
      }} elevation={0}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: '#5b21b6', fontWeight: 700 }}>
            📊 Progress Overview
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" fontWeight={600} color="#6b21a8">Completion</Typography>
              <Typography variant="body2" fontWeight={700} color="#7c3aed">{progressPercentage}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                bgcolor: '#e9d5ff',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#7c3aed',
                  borderRadius: 5
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Paper sx={{ 
              p: 2,
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              border: '2px solid #93c5fd',
              borderRadius: 2
            }} elevation={0}>
              <Typography variant="body2" color="#1e40af" fontWeight={600}>Time Spent</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Timer sx={{ mr: 1, fontSize: 24, color: '#2563eb' }} />
                <Typography variant="h6" fontWeight={700} color="#1e40af">{Math.floor((progress?.time_spent || 0) / 60)} min</Typography>
              </Box>
            </Paper>
            
            <Paper sx={{ 
              p: 2,
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              border: '2px solid #86efac',
              borderRadius: 2
            }} elevation={0}>
              <Typography variant="body2" color="#15803d" fontWeight={600}>Status</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getStatusIcon(currentStatus)}
                <Typography variant="h6" sx={{ ml: 1, textTransform: 'capitalize', fontWeight: 700, color: '#16a34a' }}>
                  {currentStatus.replace('_', ' ')}
                </Typography>
              </Box>
            </Paper>
            
            <Paper sx={{ 
              p: 2,
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '2px solid #fcd34d',
              borderRadius: 2
            }} elevation={0}>
              <Typography variant="body2" color="#b45309" fontWeight={600}>Assignment Date</Typography>
              <Typography variant="h6" fontWeight={700} color="#d97706" sx={{ mt: 1 }}>
                {assignment?.assigned_at 
                  ? new Date(assignment.assigned_at).toLocaleDateString()
                  : 'N/A'
                }
              </Typography>
            </Paper>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            {currentStatus === 'pending' && (
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={handleStartWork}
                sx={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                  color: '#ffffff',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(124, 58, 237, 0.5)',
                  }
                }}
              >
                Start Assignment
              </Button>
            )}
            
            {currentStatus === 'in_progress' && (
              <>
                {!isWorking ? (
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={handleStartWork}
                    sx={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                      color: '#ffffff',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(124, 58, 237, 0.5)',
                      }
                    }}
                  >
                    Continue Working
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<Pause />}
                    onClick={handlePauseWork}
                    sx={{
                      borderColor: '#f59e0b',
                      color: '#f59e0b',
                      borderWidth: 2,
                      fontWeight: 600,
                      px: 3,
                      '&:hover': {
                        borderColor: '#d97706',
                        bgcolor: '#fef3c7',
                        borderWidth: 2
                      }
                    }}
                  >
                    Pause Work
                  </Button>
                )}
                
                <Button
                  variant="contained"
                  startIcon={<CheckCircle />}
                  onClick={handleCompleteAssignment}
                  sx={{
                    background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
                    color: '#ffffff',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #15803d 0%, #047857 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(22, 163, 74, 0.5)',
                    }
                  }}
                >
                  Mark Complete
                </Button>
              </>
            )}
            
            {currentStatus === 'completed' && (
              <Chip 
                label="✅ Completed" 
                sx={{ 
                  fontSize: '1rem', 
                  py: 2.5, 
                  px: 3,
                  background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                  border: '2px solid #86efac',
                  color: '#15803d',
                  fontWeight: 700
                }}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Instructions Section */}
      <Card sx={{ 
        mb: 3,
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        border: '2px solid #fcd34d',
        borderRadius: 2
      }} elevation={0}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: '#b45309', fontWeight: 700 }}>
            📋 Instructions
          </Typography>
          <Paper sx={{ 
            p: 2.5,
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 2
          }} elevation={0}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: '#78350f', fontWeight: 500 }}>
              {assignment.instructions}
            </Typography>
          </Paper>
        </CardContent>
      </Card>

      {/* Supporting Flashcard Decks Section */}
      {assignment?.supporting_deck_titles && assignment.supporting_deck_titles.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              🃏 Supporting Flashcard Decks
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Practice with these flashcard decks to reinforce your learning
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {assignment.supporting_deck_titles.map((deckTitle, index) => {
                const deckId = assignment.supporting_decks?.[index];
                return (
                  <Paper 
                    key={index}
                    elevation={2}
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'secondary.main',
                      minWidth: '200px',
                      cursor: 'pointer',
                      '&:hover': {
                        elevation: 4,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease'
                      }
                    }}
                    onClick={() => {
                      // Navigate to deck detail page
                      if (deckId) {
                        navigate(`/decks/${deckId}`);
                      } else {
                        debugLog('No deck ID available for:', deckTitle);
                      }
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="600" sx={{ display: 'flex', alignItems: 'center' }}>
                      🃏 {deckTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click to view deck details
                    </Typography>
                    
                    {(currentStatus === 'in_progress' || currentStatus === 'pending') && (
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Navigate to flashcard study page
                          if (deckId) {
                            navigate(`/decks/${deckId}/study`);
                          } else {
                            debugLog('No deck ID available for study:', deckTitle);
                          }
                        }}
                      >
                        Study Cards
                      </Button>
                    )}
                  </Paper>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Course Content Section - Only show if assignment type is course */}
      {assignment?.content_type === 'course' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <MenuBook sx={{ mr: 1 }} />
              Course Content
            </Typography>
            
            {lessonsLoading ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography>Loading course lessons...</Typography>
              </Box>
            ) : courseLessons && courseLessons.length > 0 ? (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Complete all lessons to finish this assignment
                </Typography>
                
                {/* Inline Lesson Viewer */}
                {showInlineViewer && selectedLesson && (
                  <Box sx={{ mb: 3 }}>
                    <LessonInlineViewer
                      lesson={selectedLesson}
                      onComplete={handleLessonComplete}
                      onClose={handleCloseInlineViewer}
                      isAssignmentContext={true}
                    />
                  </Box>
                )}
                
                {courseLessons.map((lesson, index) => (
                  <Accordion 
                    key={lesson.id} 
                    sx={{ 
                      mb: 1,
                      // Highlight currently selected lesson
                      ...(selectedLesson?.id === lesson.id && showInlineViewer && {
                        border: '2px solid',
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.50'
                      })
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <PlayCircle sx={{ mr: 2, color: 'primary.main' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="600">
                            Lesson {lesson.order}: {lesson.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {lesson.duration ? `${lesson.duration} minutes` : 'Duration not specified'}
                          </Typography>
                        </Box>
                        <Chip 
                          label={lesson.is_published ? 'Available' : 'Draft'} 
                          size="small"
                          color={lesson.is_published ? 'success' : 'default'}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ pl: 6 }}>
                        {/* Only show content if lesson is not active */}
                        {selectedLesson?.id !== lesson.id && (
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {lesson.content || 'No content description available.'}
                          </Typography>
                        )}
                        
                        {lesson.is_published && (currentStatus === 'in_progress' || currentStatus === 'pending') && (
                          <Button
                            variant={selectedLesson?.id === lesson.id ? "outlined" : "contained"}
                            size="small"
                            startIcon={<PlayArrow />}
                            onClick={() => handleStartLesson(lesson)}
                            sx={{ mt: selectedLesson?.id === lesson.id ? 0 : 1 }}
                          >
                            {selectedLesson?.id === lesson.id ? 'Lesson Active' : 'Start Lesson'}
                          </Button>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="text.secondary">
                  No lessons available for this course yet.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assignment Details */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Assignment Details
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText
                primary="Instructor"
                secondary={`Instructor ID: ${assignment.instructor_id}`}
              />
            </ListItem>
            
            <Divider variant="inset" component="li" />
            
            <ListItem>
              <ListItemIcon>
                <School />
              </ListItemIcon>
              <ListItemText
                primary="Course"
                secondary={assignment.content_title}
              />
            </ListItem>
            
            <Divider variant="inset" component="li" />
            
            <ListItem>
              <ListItemIcon>
                <Assignment />
              </ListItemIcon>
              <ListItemText
                primary="Content Type"
                secondary={assignment.content_type}
              />
            </ListItem>
            
            {assignment.due_date && (
              <>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText
                    primary="Due Date"
                    secondary={new Date(assignment.due_date).toLocaleString()}
                  />
                </ListItem>
              </>
            )}
          </List>
        </CardContent>
      </Card>

      {/* Lesson Viewer Dialog - Backup option */}
      {/* 
      <LessonViewer
        lesson={selectedLesson}
        open={lessonViewerOpen}
        onClose={handleCloseLessonViewer}
        onComplete={handleLessonComplete}
        isAssignmentContext={true}
        assignmentId={assignmentId}
      />
      */}
      </Box>
    </GlassBackground>
  );
};

export default AssignmentDetailPage;
