import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import contentService from '../../services/content.service';

interface CreateLessonDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  courseId?: string; // Add courseId prop
}

interface LessonFormData {
  title: string;
  content: string;
  course_id: string;
  order: number;
  duration?: number;
  image_url?: string;
  video_url?: string;
  is_published: boolean;
}

const CreateLessonDialog: React.FC<CreateLessonDialogProps> = ({
  open,
  onClose,
  onSuccess,
  courseId
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<LessonFormData>({
    title: '',
    content: '',
    course_id: courseId || '',
    order: 1,
    duration: undefined,
    image_url: '',
    video_url: '',
    is_published: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch courses for dropdown
  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: () => contentService.getCourses()
  });

  const courses = coursesData?.courses || [];

  // Create lesson mutation
  const createLessonMutation = useMutation({
    mutationFn: (lessonData: any) => contentService.createLesson(lessonData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      onSuccess?.();
      handleClose();
    },
    onError: (error: any) => {
      console.error('Create lesson error:', error);
      setErrors({
        submit: error.response?.data?.detail || 'Failed to create lesson'
      });
    }
  });

  const handleInputChange = (field: keyof LessonFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.course_id) {
      newErrors.course_id = 'Course is required';
    }

    if (formData.order < 1) {
      newErrors.order = 'Order must be at least 1';
    }

    if (formData.duration && formData.duration < 1) {
      newErrors.duration = 'Duration must be at least 1 minute';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const lessonData = {
      ...formData,
      duration: formData.duration || undefined,
      image_url: formData.image_url || undefined,
      video_url: formData.video_url || undefined
    };

    createLessonMutation.mutate(lessonData);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      course_id: '',
      order: 1,
      duration: undefined,
      image_url: '',
      video_url: '',
      is_published: false
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.98)'
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
          Create New Lesson
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 1 }}>
          {/* Error Alert */}
          {errors.submit && (
            <Alert severity="error">{errors.submit}</Alert>
          )}

          {/* Title */}
          <TextField
            label="Lesson Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            required
          />

          {/* Course Selection */}
          <FormControl fullWidth required error={!!errors.course_id}>
            <InputLabel>Course</InputLabel>
            <Select
              value={formData.course_id}
              label="Course"
              onChange={(e) => handleInputChange('course_id', e.target.value)}
            >
              {courses.map((course: any) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.title}
                </MenuItem>
              ))}
            </Select>
            {errors.course_id && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.course_id}
              </Typography>
            )}
          </FormControl>

          {/* Order and Duration */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Order"
              type="number"
              value={formData.order}
              onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
              error={!!errors.order}
              helperText={errors.order}
              inputProps={{ min: 1 }}
              required
              sx={{ flex: 1 }}
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              value={formData.duration || ''}
              onChange={(e) => handleInputChange('duration', e.target.value ? parseInt(e.target.value) : undefined)}
              error={!!errors.duration}
              helperText={errors.duration}
              inputProps={{ min: 1 }}
              sx={{ flex: 1 }}
            />
          </Box>

          {/* Content */}
          <TextField
            label="Lesson Content"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            error={!!errors.content}
            helperText={errors.content}
            multiline
            rows={6}
            fullWidth
            required
          />

          {/* Image URL */}
          <TextField
            label="Image URL (optional)"
            value={formData.image_url}
            onChange={(e) => handleInputChange('image_url', e.target.value)}
            fullWidth
            placeholder="https://example.com/image.jpg"
          />

          {/* Video URL */}
          <TextField
            label="Video URL (optional)"
            value={formData.video_url}
            onChange={(e) => handleInputChange('video_url', e.target.value)}
            fullWidth
            placeholder="https://youtube.com/watch?v=..."
          />

          {/* Published Switch */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_published}
                onChange={(e) => handleInputChange('is_published', e.target.checked)}
              />
            }
            label="Publish immediately"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={handleClose}
          disabled={createLessonMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={createLessonMutation.isPending}
          startIcon={createLessonMutation.isPending ? <CircularProgress size={20} /> : null}
          sx={{ borderRadius: 2 }}
        >
          {createLessonMutation.isPending ? 'Creating...' : 'Create Lesson'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateLessonDialog;
