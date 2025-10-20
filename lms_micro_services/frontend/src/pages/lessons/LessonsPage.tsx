import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Divider,
  Paper
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  School,
  Visibility,
  PlayArrow,
  PlayCircleOutline,
  AccessTime,
  Person
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import contentService, { Lesson } from '../../services/content.service';
import CreateLessonDialog from '../../components/lessons/CreateLessonDialog';
import EditLessonDialog from '../../components/lessons/EditLessonDialog';
import DeleteConfirmationDialog from '../../components/lessons/DeleteConfirmationDialog';
import { GlassBackground, GlassHeader, GlassPaper } from '../../components/common/GlassTheme';

const LessonsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch lessons
  const { data: lessonsData, isLoading, error, refetch } = useQuery({
    queryKey: ['lessons', searchTerm],
    queryFn: () => contentService.getAllLessons({
      search: searchTerm || undefined,
      page: 1,
      size: 50
    })
  });

  const lessons = lessonsData?.items || [];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, lesson: Lesson) => {
    setAnchorEl(event.currentTarget);
    setSelectedLesson(lesson);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLesson(null);
  };

  const handleCreateLesson = () => {
    setCreateDialogOpen(true);
  };

  const handleEditLesson = () => {
    setEditDialogOpen(true);
    setAnchorEl(null); // Chỉ đóng menu, không reset selectedLesson
  };

  const handleDeleteLesson = () => {
    setDeleteDialogOpen(true);
    setAnchorEl(null); // Chỉ đóng menu, không reset selectedLesson
  };

  const canCreateLesson = user?.role === 'ADMIN' || user?.role === 'TEACHER';
  const canEditDelete = (lesson: Lesson) => {
    return user?.role === 'ADMIN' || (user?.role === 'TEACHER' && lesson.instructor_id === user?.id);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <GlassBackground>
      <Container maxWidth="lg">
        {/* Header */}
        <GlassHeader
          icon="📚"
          title="Lessons"
          subtitle="Explore and manage your learning content"
        >
            {canCreateLesson && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateLesson}
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
                Create Lesson
              </Button>
            )}
        </GlassHeader>

        {/* Search */}
        <Paper 
          elevation={6}
          sx={{
            mb: 3,
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
            p: 2
          }}
        >
          <TextField
            fullWidth
            placeholder="Search lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(255,255,255,0.7)',
                },
              },
              '& .MuiOutlinedInput-input::placeholder': {
                color: 'rgba(255,255,255,0.6)',
                opacity: 1,
              }
            }}
          />
        </Paper>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load lessons. Please try again.
          </Alert>
        )}

        {/* Lessons List */}
        {lessons.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No lessons found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {canCreateLesson
                ? 'Create your first lesson to get started'
                : 'No lessons have been assigned to you yet'
              }
            </Typography>
            {canCreateLesson && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateLesson}
              >
                Create Lesson
              </Button>
            )}
          </Box>
        ) : (
          <GlassPaper>
            <List sx={{ color: 'white' }}>
              {lessons.map((lesson: any, index: number) => (
                <React.Fragment key={lesson.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      px: 3,
                      borderRadius: 2,
                      mb: 1,
                      mx: 1,
                      background: index % 2 === 0 
                        ? 'linear-gradient(90deg, rgba(255,248,220,0.6) 0%, rgba(255,235,59,0.4) 100%)'
                        : 'linear-gradient(90deg, rgba(30,60,114,0.6) 0%, rgba(42,82,152,0.4) 100%)',
                      border: '1px solid rgba(255,255,255,0.5)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, rgba(255,215,0,0.2) 0%, rgba(30,60,114,0.2) 100%)',
                        transform: 'translateX(8px)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Avatar
                      sx={{
                        background: lesson.is_published 
                          ? 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)' 
                          : 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)',
                        mr: 2,
                        width: 48,
                        height: 48,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        border: '2px solid rgba(255,255,255,0.5)',
                      }}
                    >
                      <PlayCircleOutline />
                    </Avatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="h6" component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                            {lesson.title}
                          </Typography>
                          <Chip
                            size="small"
                            label={lesson.is_published ? 'Published' : 'Draft'}
                            color={lesson.is_published ? 'success' : 'default'}
                            sx={{ mr: 1 }}
                          />
                          {lesson.duration && (
                            <Chip
                              size="small"
                              icon={<AccessTime sx={{ fontSize: 16 }} />}
                              label={`${lesson.duration} min`}
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                          )}
                          <Chip
                            size="small"
                            label={`Order: ${lesson.order}`}
                            variant="outlined"
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
                            {lesson.content || 'No description available'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Course ID: {lesson.course_id}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Created: {new Date(lesson.created_at).toLocaleDateString()}
                            </Typography>
                            {lesson.instructor_id && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Person sx={{ fontSize: 14, mr: 0.5 }} />
                                <Typography variant="caption" color="text.secondary">
                                  Instructor: {lesson.instructor_id}
                                </Typography>
                              </Box>
                            )}
                            <Button
                              variant="text"
                              size="small"
                              startIcon={<Visibility />}
                              sx={{ 
                                fontSize: '0.75rem',
                                minWidth: 'auto',
                                px: 1,
                                py: 0.5,
                                ml: 'auto'
                              }}
                            >
                              View
                            </Button>
                          </Box>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {canEditDelete(lesson) && (
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, lesson)}
                            sx={{ ml: 1 }}
                          >
                            <MoreVert />
                          </IconButton>
                        )}
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < lessons.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </GlassPaper>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)} // Chỉ đóng menu, không reset selectedLesson
        >
          <MenuItem onClick={handleEditLesson}>
            <Edit sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDeleteLesson} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Create Lesson Dialog */}
        <CreateLessonDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSuccess={() => {
            setCreateDialogOpen(false);
            refetch();
          }}
        />

        {/* Edit Lesson Dialog */}
        <EditLessonDialog
          open={editDialogOpen}
          lesson={selectedLesson}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedLesson(null);
          }}
          onSuccess={() => {
            setEditDialogOpen(false);
            setSelectedLesson(null);
            refetch();
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          lesson={selectedLesson}
          onClose={() => {
            setDeleteDialogOpen(false);
            setSelectedLesson(null);
          }}
          onSuccess={() => {
            setDeleteDialogOpen(false);
            setSelectedLesson(null);
            refetch();
          }}
        />
      </Container>
    </GlassBackground>
  );
};

export default LessonsPage;
