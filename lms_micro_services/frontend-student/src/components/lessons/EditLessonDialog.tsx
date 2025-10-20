import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import contentService, { Lesson } from '../../services/content.service';

interface EditLessonDialogProps {
  open: boolean;
  lesson: Lesson | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditLessonDialog: React.FC<EditLessonDialogProps> = ({
  open,
  lesson,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    duration: '',
    order: '',
    image_url: '',
    video_url: '',
    is_published: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const queryClient = useQueryClient();

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { lessonId: string; updateData: any }) => 
      contentService.updateLesson(data.lessonId, data.updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      onSuccess();
      handleClose();
    },
    onError: (error: any) => {
      console.error('Update lesson error:', error);
      setErrors({ submit: 'Failed to update lesson. Please try again.' });
    }
  });

  // Initialize form data when lesson changes
  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title || '',
        content: lesson.content || '',
        duration: lesson.duration?.toString() || '',
        order: lesson.order?.toString() || '',
        image_url: lesson.image_url || '',
        video_url: lesson.video_url || '',
        is_published: lesson.is_published || false
      });
      setErrors({});
    }
  }, [lesson]);

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      duration: '',
      order: '',
      image_url: '',
      video_url: '',
      is_published: false
    });
    setErrors({});
    onClose();
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.duration && isNaN(Number(formData.duration))) {
      newErrors.duration = 'Duration must be a number';
    }

    if (formData.order && isNaN(Number(formData.order))) {
      newErrors.order = 'Order must be a number';
    }

    // URL validation
    const urlPattern = /^https?:\/\/.+/;
    if (formData.image_url && !urlPattern.test(formData.image_url)) {
      newErrors.image_url = 'Image URL must be a valid HTTP/HTTPS URL';
    }

    if (formData.video_url && !urlPattern.test(formData.video_url)) {
      newErrors.video_url = 'Video URL must be a valid HTTP/HTTPS URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!lesson || !validateForm()) {
      return;
    }

    const updateData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      duration: formData.duration ? Number(formData.duration) : undefined,
      order: formData.order ? Number(formData.order) : undefined,
      image_url: formData.image_url.trim() || undefined,
      video_url: formData.video_url.trim() || undefined,
      is_published: formData.is_published
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]
    );

    updateMutation.mutate({
      lessonId: lesson.id,
      updateData
    });
  };

  if (!lesson) return null;

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
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          Edit Lesson
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {errors.submit && (
              <Alert severity="error">
                {errors.submit}
              </Alert>
            )}

            <TextField
              label="Lesson Title"
              value={formData.title}
              onChange={handleChange('title')}
              error={!!errors.title}
              helperText={errors.title}
              fullWidth
              required
            />

            <TextField
              label="Content"
              value={formData.content}
              onChange={handleChange('content')}
              error={!!errors.content}
              helperText={errors.content}
              multiline
              rows={6}
              fullWidth
              required
            />

            <TextField
              label="Image URL"
              value={formData.image_url}
              onChange={handleChange('image_url')}
              error={!!errors.image_url}
              helperText={errors.image_url || 'Optional: URL for lesson thumbnail image'}
              fullWidth
              placeholder="https://example.com/image.jpg"
            />

            <TextField
              label="Video URL"
              value={formData.video_url}
              onChange={handleChange('video_url')}
              error={!!errors.video_url}
              helperText={errors.video_url || 'Optional: URL for lesson video'}
              fullWidth
              placeholder="https://youtube.com/watch?v=..."
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Duration (minutes)"
                value={formData.duration}
                onChange={handleChange('duration')}
                error={!!errors.duration}
                helperText={errors.duration}
                type="number"
                inputProps={{ min: 0 }}
                sx={{ flex: 1 }}
              />

              <TextField
                label="Order"
                value={formData.order}
                onChange={handleChange('order')}
                error={!!errors.order}
                helperText={errors.order}
                type="number"
                inputProps={{ min: 1 }}
                sx={{ flex: 1 }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_published}
                  onChange={handleChange('is_published')}
                  color="primary"
                />
              }
              label="Published"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateMutation.isPending}
            startIcon={updateMutation.isPending ? <CircularProgress size={20} /> : undefined}
          >
            {updateMutation.isPending ? 'Updating...' : 'Update Lesson'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditLessonDialog;
