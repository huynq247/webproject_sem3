import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  PlayArrow,
  Schedule,
  CheckCircle,
  RadioButtonUnchecked,
  School,
  Person,
} from '@mui/icons-material';
import { Assignment } from '../../services/assignment.service';

interface AssignmentCardProps {
  assignment: Assignment;
  onStart?: () => void;
  onView?: () => void;
  isStudent?: boolean;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onStart,
  onView,
  isStudent = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'in_progress': return <PlayArrow />;
      default: return <RadioButtonUnchecked />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString();
  };

  const progressPercentage = assignment.course_progress_percentage || 0;

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        '&:hover': { 
          boxShadow: 6,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Assignment Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <School sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6" component="h3" fontWeight="bold">
            {assignment.title}
          </Typography>
        </Box>

        {/* Course Information */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Course: {assignment.content_title}
          </Typography>
          {assignment.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {assignment.description}
            </Typography>
          )}
          
          {/* Supporting Decks */}
          {assignment.supporting_deck_titles && assignment.supporting_deck_titles.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                Supporting Decks:
              </Typography>
              {assignment.supporting_deck_titles.map((deckTitle, index) => (
                <Chip 
                  key={index} 
                  label={`🃏 ${deckTitle}`} 
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Progress Bar for Course */}
        {assignment.content_type === 'course' && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Course Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(progressPercentage)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage} 
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {assignment.completed_lessons || 0} of {assignment.total_lessons || 0} lessons completed
            </Typography>
          </Box>
        )}

        {/* Status and Details */}
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
          <Chip
            icon={getStatusIcon(assignment.status)}
            label={assignment.status.replace('_', ' ')}
            color={getStatusColor(assignment.status) as any}
            size="small"
          />
          {assignment.content_type && (
            <Chip
              label={assignment.content_type.toUpperCase()}
              variant="outlined"
              size="small"
            />
          )}
        </Stack>

        {/* Assignment Details */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Schedule sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Due: {formatDate(assignment.due_date)}
          </Typography>
        </Box>

        {!isStudent && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Person sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Student: {assignment.student_name || `ID: ${assignment.student_id}`}
            </Typography>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary">
          Assigned: {formatDate(assignment.assigned_at)}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        {isStudent ? (
          <>
            {assignment.status === 'pending' && (
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={onStart}
                fullWidth
              >
                Start Learning
              </Button>
            )}
            {assignment.status === 'in_progress' && (
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={onStart}
                fullWidth
              >
                Continue Learning
              </Button>
            )}
            {assignment.status === 'completed' && (
              <Button
                variant="outlined"
                onClick={onView}
                fullWidth
              >
                Review Course
              </Button>
            )}
          </>
        ) : (
          <Button
            variant="outlined"
            onClick={onView}
            fullWidth
          >
            View Details
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default AssignmentCard;
