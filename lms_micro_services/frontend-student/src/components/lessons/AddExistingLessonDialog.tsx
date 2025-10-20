import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Typography,
  Alert,
  Box,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search, PlayCircleOutline } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService } from '../../services/content.service';

interface AddExistingLessonDialogProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
}

const AddExistingLessonDialog: React.FC<AddExistingLessonDialogProps> = ({
  open,
  onClose,
  courseId
}) => {
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string>('');
  const queryClient = useQueryClient();

  // Fetch all available lessons (not in current course)
  const { data: lessonsData, isLoading } = useQuery({
    queryKey: ['available-lessons', courseId],
    queryFn: () => contentService.getAllLessons(),
    enabled: open,
  });

  // Fetch current course lessons to exclude them
  const { data: currentLessonsData } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => contentService.getAllLessons({ course_id: courseId }),
    enabled: open,
  });

  // Filter lessons not already in current course
  const availableLessons = lessonsData?.items?.filter(lesson => 
    lesson.course_id !== courseId &&
    !currentLessonsData?.items?.some(currentLesson => currentLesson.id === lesson.id)
  ) || [];

  // Filter by search term
  const filteredLessons = availableLessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add lessons to course mutation
  const addLessonsMutation = useMutation({
    mutationFn: async (lessonIds: string[]) => {
      // Add each selected lesson to the course
      const promises = lessonIds.map(lessonId => 
        contentService.assignLessonToCourse(courseId, lessonId)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      onClose();
      setSelectedLessons([]);
      setError('');
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to add lessons to course');
    },
  });

  const handleToggleLesson = (lessonId: string) => {
    setSelectedLessons(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const handleAddLessons = () => {
    if (selectedLessons.length === 0) {
      setError('Please select at least one lesson');
      return;
    }
    addLessonsMutation.mutate(selectedLessons);
  };

  const handleClose = () => {
    setSelectedLessons([]);
    setSearchTerm('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Existing Lessons to Course</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          placeholder="Search lessons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {isLoading ? (
          <Typography>Loading lessons...</Typography>
        ) : filteredLessons.length === 0 ? (
          <Typography color="text.secondary" align="center">
            {searchTerm 
              ? 'No lessons found matching your search.' 
              : 'No available lessons to add. All lessons are either already in this course or you need to create new ones.'
            }
          </Typography>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Select lessons to add to this course ({selectedLessons.length} selected):
            </Typography>
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {filteredLessons.map((lesson) => (
                <ListItem 
                  key={lesson.id} 
                  onClick={() => handleToggleLesson(lesson.id)}
                  sx={{ 
                    border: 1, 
                    borderColor: 'divider', 
                    mb: 1, 
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      checked={selectedLessons.includes(lesson.id)}
                      onChange={() => handleToggleLesson(lesson.id)}
                    />
                  </ListItemIcon>
                  <ListItemIcon>
                    <PlayCircleOutline color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={lesson.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {lesson.content.substring(0, 100)}...
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          From course: {lesson.course_id}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          variant="contained"
          onClick={handleAddLessons}
          disabled={selectedLessons.length === 0 || addLessonsMutation.isPending}
        >
          {addLessonsMutation.isPending 
            ? 'Adding...' 
            : `Add ${selectedLessons.length} Lesson${selectedLessons.length !== 1 ? 's' : ''}`
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddExistingLessonDialog;
