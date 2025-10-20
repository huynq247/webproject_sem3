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
  Typography,
  Alert,
  Box,
  Chip
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { assignmentService, CreateAssignmentRequest } from '../../services/assignment.service';
import { contentService } from '../../services/content.service';
import { userService } from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';

interface CreateAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  student_id: number;
  content_type: 'course' | 'deck'; // Add content type selection
  content_id: string;
  title: string;
  description: string;
  instructions: string;
  due_date: string;
  supporting_decks: string[]; // Array of supporting deck IDs
}

const CreateAssignmentDialog: React.FC<CreateAssignmentDialogProps> = ({
  open,
  onClose
}) => {
  const [error, setError] = useState<string>('');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const selectedCourseId = watch('content_id');
  const selectedContentType = watch('content_type');

  // Fetch courses for dropdown
  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: contentService.getCourses,
    enabled: open,
  });

  // Fetch decks for supporting content
  const { data: decksData } = useQuery({
    queryKey: ['decks'],
    queryFn: contentService.getDecks,
    enabled: open,
  });

  // Fetch students created by current teacher
  const { data: studentsData } = useQuery({
    queryKey: ['my-students'],
    queryFn: () => userService.getMyStudents({ limit: 100 }),
    enabled: open && user?.role === 'TEACHER',
  });

  // For admin, fetch all students
  const { data: allStudentsData } = useQuery({
    queryKey: ['all-students'],
    queryFn: () => userService.getUsers({ role: 'STUDENT', limit: 100 }),
    enabled: open && user?.role === 'ADMIN',
  });

  // Determine which students to show based on user role
  const availableStudents = user?.role === 'ADMIN' 
    ? allStudentsData?.users || []
    : studentsData?.users || [];

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: assignmentService.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      onClose();
      reset();
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to create assignment');
    },
  });

  const handleCreateAssignment = (data: FormData) => {
    // Find selected course or deck based on content type
    const selectedCourse = coursesData?.courses?.find(c => c.id === data.content_id);
    const selectedDeck = decksData?.decks?.find(d => d.id === data.content_id);
    
    // Determine content title based on content type
    let contentTitle = 'Unknown Content';
    if (data.content_type === 'course' && selectedCourse) {
      contentTitle = selectedCourse.title;
    } else if (data.content_type === 'deck' && selectedDeck) {
      contentTitle = selectedDeck.title;
    }
    
    // Get supporting deck titles from selected deck IDs
    const supportingDeckTitles = data.supporting_decks?.map(deckId => {
      const deck = decksData?.decks?.find(d => d.id === deckId);
      return deck?.title || `Deck ${deckId}`;
    }) || [];
    
    const assignmentData: CreateAssignmentRequest = {
      instructor_id: user?.id || 1,
      student_id: data.student_id,
      content_type: data.content_type, // Use selected content type
      content_id: data.content_id,
      content_title: contentTitle, // Use dynamic content title
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      due_date: data.due_date ? new Date(data.due_date).toISOString() : undefined,
      supporting_decks: data.supporting_decks && data.supporting_decks.length > 0 ? data.supporting_decks : undefined,
      supporting_deck_titles: supportingDeckTitles.length > 0 ? supportingDeckTitles : undefined,
    };

    createAssignmentMutation.mutate(assignmentData);
  };

  // Get selected course or deck based on content type
  const selectedCourse = selectedContentType === 'course' 
    ? coursesData?.courses?.find(c => c.id === selectedCourseId)
    : null;
  const selectedDeck = selectedContentType === 'deck'
    ? decksData?.decks?.find(d => d.id === selectedCourseId)
    : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          Create Assignment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create an assignment with course or deck content
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {/* Student Selection */}
          <FormControl fullWidth>
            <InputLabel>Select Student</InputLabel>
            <Controller
              name="student_id"
              control={control}
              rules={{ required: 'Student is required' }}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Select Student"
                  error={!!errors.student_id}
                  disabled={availableStudents.length === 0}
                >
                  {availableStudents.length === 0 ? (
                    <MenuItem disabled>
                      {user?.role === 'TEACHER' 
                        ? 'No students found. Create students first.' 
                        : 'Loading students...'}
                    </MenuItem>
                  ) : (
                    availableStudents.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.full_name || student.username} ({student.email})
                      </MenuItem>
                    ))
                  )}
                </Select>
              )}
            />
            {errors.student_id && (
              <Typography color="error" variant="caption">
                {errors.student_id.message}
              </Typography>
            )}
          </FormControl>

          {/* Content Type Selection */}
          <FormControl fullWidth>
            <InputLabel>Content Type</InputLabel>
            <Controller
              name="content_type"
              control={control}
              rules={{ required: 'Content type is required' }}
              defaultValue="course"
              render={({ field }) => (
                <Select
                  {...field}
                  label="Content Type"
                  error={!!errors.content_type}
                >
                  <MenuItem value="course">Course</MenuItem>
                  <MenuItem value="deck">Flashcard Deck</MenuItem>
                </Select>
              )}
            />
            {errors.content_type && (
              <Typography color="error" variant="caption">
                {errors.content_type.message}
              </Typography>
            )}
          </FormControl>

          {/* Course/Deck Selection */}
          <FormControl fullWidth>
            <InputLabel>
              {selectedContentType === 'deck' ? 'Select Deck' : 'Select Course'}
            </InputLabel>
            <Controller
              name="content_id"
              control={control}
              rules={{ required: `${selectedContentType === 'deck' ? 'Deck' : 'Course'} is required` }}
              render={({ field }) => (
                <Select
                  {...field}
                  label={selectedContentType === 'deck' ? 'Select Deck' : 'Select Course'}
                  error={!!errors.content_id}
                >
                  {selectedContentType === 'deck' ? (
                    // Show decks when deck content type is selected
                    decksData?.decks?.map((deck) => (
                      <MenuItem key={deck.id} value={deck.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          🃏 {deck.title}
                          <Chip
                            label={`${deck.total_flashcards || 0} cards`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    // Show courses when course content type is selected
                    coursesData?.courses?.map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          📚 {course.title}
                          <Chip
                            label={`${course.total_lessons || 0} lessons`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
              )}
            />
            {errors.content_id && (
              <Typography color="error" variant="caption">
                {errors.content_id.message}
              </Typography>
            )}
          </FormControl>

          {/* Content Preview */}
          {selectedCourse && (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Selected Course Preview:
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>📚 {selectedCourse.title}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedCourse.description}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Chip label={`${selectedCourse.total_lessons || 0} lessons`} size="small" />
                <Chip 
                  label={selectedCourse.is_active ? 'Active' : 'Inactive'} 
                  size="small" 
                  color={selectedCourse.is_active ? 'success' : 'warning'} 
                />
              </Box>
            </Box>
          )}
          
          {selectedDeck && (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="secondary" gutterBottom>
                Selected Deck Preview:
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>🃏 {selectedDeck.title}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedDeck.description}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Chip label={`${selectedDeck.total_flashcards || 0} cards`} size="small" />
                <Chip 
                  label={selectedDeck.difficulty || 'No difficulty'} 
                  size="small" 
                  color="info" 
                />
                {selectedDeck.is_public && (
                  <Chip label="Public" size="small" color="success" />
                )}
              </Box>
            </Box>
          )}

          {/* Supporting Decks Selection */}
          <FormControl fullWidth>
            <InputLabel>Supporting Flashcard Decks (Optional)</InputLabel>
            <Controller
              name="supporting_decks"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <Select
                  {...field}
                  multiple
                  label="Supporting Flashcard Decks (Optional)"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((deckId) => {
                        const deck = decksData?.decks?.find(d => d.id === deckId);
                        return (
                          <Chip 
                            key={deckId} 
                            label={deck?.title || deckId} 
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {decksData?.decks?.map((deck) => (
                    <MenuItem key={deck.id} value={deck.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        🃏 {deck.title}
                        <Chip
                          label={`${deck.total_flashcards || 0} cards`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                        <Chip
                          label={deck.difficulty || 'mixed'}
                          size="small"
                          color={
                            deck.difficulty === 'easy' ? 'success' :
                            deck.difficulty === 'hard' ? 'error' : 'warning'
                          }
                          variant="outlined"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Select flashcard decks to supplement the course learning experience
            </Typography>
          </FormControl>

          {/* Assignment Details */}
          <TextField
            label="Assignment Title"
            fullWidth
            {...register('title', { required: 'Assignment title is required' })}
            error={!!errors.title}
            helperText={errors.title?.message}
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
          />

          <TextField
            label="Instructions"
            fullWidth
            multiline
            rows={4}
            placeholder="Detailed instructions for the student..."
            {...register('instructions')}
            error={!!errors.instructions}
            helperText={errors.instructions?.message}
          />

          <TextField
            label="Due Date"
            type="datetime-local"
            fullWidth
            {...register('due_date')}
            InputLabelProps={{ shrink: true }}
            error={!!errors.due_date}
            helperText={errors.due_date?.message}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleCreateAssignment)}
          variant="contained"
          disabled={createAssignmentMutation.isPending}
        >
          {createAssignmentMutation.isPending ? 'Creating...' : 'Create Assignment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAssignmentDialog;
