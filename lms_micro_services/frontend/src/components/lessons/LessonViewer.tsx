import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Chip,
  Paper,
  IconButton,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Close,
  PlayArrow,
  Pause,
  Timer,
  MenuBook,
  CheckCircle,
  School,
} from '@mui/icons-material';
import { Lesson } from '../../services/content.service';
import { debugLog } from '../../config';

interface LessonViewerProps {
  lesson: Lesson | null;
  open: boolean;
  onClose: () => void;
  onComplete?: (lessonId: string) => void;
  isAssignmentContext?: boolean;
  assignmentId?: string;
}

const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  open,
  onClose,
  onComplete,
  isAssignmentContext = false,
  assignmentId
}) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  if (!lesson) return null;

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    debugLog('🎥 Video started:', lesson.title);
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
    debugLog('⏸️ Video paused:', lesson.title);
  };

  const handleVideoProgress = (progress: number) => {
    setVideoProgress(progress);
    
    // Mark lesson as completed when 80% watched
    if (progress > 80 && !lessonCompleted) {
      setLessonCompleted(true);
      debugLog('✅ Lesson completed:', lesson.title);
      onComplete?.(lesson.id);
    }
  };

  const handleMarkComplete = () => {
    setLessonCompleted(true);
    onComplete?.(lesson.id);
  };

  const getVideoEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // YouTube URL conversion
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
    }
    
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
    }
    
    // Vimeo URL conversion
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    // Direct video URL
    return url;
  };

  const isVideoUrl = lesson.video_url && lesson.video_url.trim() !== '';
  const isImageUrl = lesson.image_url && lesson.image_url.trim() !== '';
  const embedUrl = isVideoUrl ? getVideoEmbedUrl(lesson.video_url!) : '';

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          minHeight: '70vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MenuBook sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              {lesson.title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAssignmentContext && (
              <Chip 
                label="Assignment Content" 
                color="primary" 
                variant="outlined"
                size="small"
              />
            )}
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Lesson Info Bar */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {lesson.duration && (
              <Chip 
                icon={<Timer />}
                label={`${lesson.duration} minutes`} 
                variant="outlined"
                size="small"
              />
            )}
            <Chip 
              icon={<School />}
              label={`Lesson ${lesson.order}`} 
              variant="outlined"
              size="small"
            />
            {lessonCompleted && (
              <Chip 
                icon={<CheckCircle />}
                label="Completed" 
                color="success"
                size="small"
              />
            )}
          </Box>

          {/* Video Section */}
          {isVideoUrl && (
            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ position: 'relative', paddingTop: '56.25%' /* 16:9 aspect ratio */ }}>
                {embedUrl.includes('youtube.com') || embedUrl.includes('vimeo.com') ? (
                  <iframe
                    src={embedUrl}
                    title={lesson.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    controls
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%'
                    }}
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                    onTimeUpdate={(e) => {
                      const video = e.target as HTMLVideoElement;
                      const progress = (video.currentTime / video.duration) * 100;
                      handleVideoProgress(progress);
                    }}
                  >
                    <source src={lesson.video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </Box>
              
              {/* Video Progress */}
              {!embedUrl.includes('youtube.com') && !embedUrl.includes('vimeo.com') && videoProgress > 0 && (
                <Box sx={{ p: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={videoProgress} 
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Progress: {Math.round(videoProgress)}%
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          {/* Image Section */}
          {isImageUrl && !isVideoUrl && (
            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <img 
                src={lesson.image_url}
                alt={lesson.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Paper>
          )}

          {/* Content Section */}
          <Paper variant="outlined" sx={{ p: 3, backgroundColor: 'grey.50' }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <MenuBook sx={{ mr: 1 }} />
              Lesson Content
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                whiteSpace: 'pre-line',
                lineHeight: 1.6,
                fontSize: '1.1rem'
              }}
            >
              {lesson.content || 'No content available for this lesson.'}
            </Typography>
          </Paper>

          {/* Assignment Context Info */}
          {isAssignmentContext && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Assignment Context:</strong> Complete this lesson as part of your assignment. 
                {lesson.duration && ` Estimated time: ${lesson.duration} minutes.`}
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        
        {!lessonCompleted && (
          <Button 
            onClick={handleMarkComplete}
            variant="contained"
            startIcon={<CheckCircle />}
            color="success"
          >
            Mark Complete
          </Button>
        )}
        
        {lessonCompleted && isAssignmentContext && (
          <Button 
            onClick={onClose}
            variant="contained"
            color="primary"
          >
            Continue Assignment
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default LessonViewer;
