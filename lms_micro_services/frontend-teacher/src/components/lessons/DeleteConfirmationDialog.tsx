import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Delete, Warning } from '@mui/icons-material';
import contentService, { Lesson } from '../../services/content.service';

interface DeleteConfirmationDialogProps {
  open: boolean;
  lesson: Lesson | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  lesson,
  onClose,
  onSuccess
}) => {
  const [error, setError] = useState<string>('');
  
  const queryClient = useQueryClient();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (lessonId: string) => contentService.deleteLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      onSuccess();
      handleClose();
    },
    onError: (error: any) => {
      console.error('Delete lesson error:', error);
      setError('Failed to delete lesson. Please try again.');
    }
  });

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleDelete = () => {
    if (!lesson) return;
    
    setError('');
    deleteMutation.mutate(lesson.id);
  };

  if (!lesson) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.98)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning sx={{ color: 'warning.main' }} />
        Delete Lesson
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this lesson?
          </Typography>

          <Box sx={{ 
            p: 2, 
            bgcolor: 'grey.50', 
            borderRadius: 1, 
            border: '1px solid',
            borderColor: 'grey.200'
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {lesson.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {lesson.content ? lesson.content.substring(0, 100) + (lesson.content.length > 100 ? '...' : '') : 'No content'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Course ID: {lesson.course_id} | Order: {lesson.order}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            <strong>Note:</strong> This action will mark the lesson as inactive. 
            Students will no longer be able to access this lesson, but the data will be preserved.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={deleteMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={deleteMutation.isPending}
          startIcon={deleteMutation.isPending ? <CircularProgress size={20} /> : <Delete />}
        >
          {deleteMutation.isPending ? 'Deleting...' : 'Delete Lesson'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
