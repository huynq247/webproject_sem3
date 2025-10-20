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
    
    console.log('🎥 Processing video URL:', url);
    
    // YouTube URL conversion
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
      console.log('🎬 YouTube embed URL:', embedUrl);
      return embedUrl;
    }
    
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
      console.log('🎬 YouTube short embed URL:', embedUrl);
      return embedUrl;
    }
    
    // Vimeo URL conversion
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1];
      const embedUrl = `https://player.vimeo.com/video/${videoId}`;
      console.log('🎬 Vimeo embed URL:', embedUrl);
      return embedUrl;
    }
    
    // Google Drive URL conversion
    if (url.includes('drive.google.com')) {
      let fileId = '';
      
      // Handle different Google Drive URL formats
      if (url.includes('/file/d/')) {
        fileId = url.split('/file/d/')[1]?.split('/')[0];
      } else if (url.includes('id=')) {
        fileId = url.split('id=')[1]?.split('&')[0];
      }
      
      if (fileId) {
        // Try different Google Drive embed formats
        // First try the standard preview format
        const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        console.log('🎬 Google Drive embed URL:', embedUrl);
        console.log('📝 Note: If video doesn\'t play, ensure file is shared with "Anyone with the link"');
        return embedUrl;
      }
    }
    
    // OneDrive URL conversion
    if (url.includes('onedrive.live.com') || url.includes('1drv.ms')) {
      // OneDrive requires replacing 'view' with 'embed' in the URL
      let embedUrl = url;
      if (url.includes('view.aspx')) {
        embedUrl = url.replace('view.aspx', 'embed.aspx');
      } else if (url.includes('redir?')) {
        // Handle short OneDrive links - need to get the full URL first
        embedUrl = url + '&embed=1';
      }
      console.log('🎬 OneDrive embed URL:', embedUrl);
      return embedUrl;
    }
    
    // SharePoint URL conversion
    if (url.includes('sharepoint.com')) {
      const embedUrl = url.replace('view.aspx', 'embed.aspx');
      console.log('🎬 SharePoint embed URL:', embedUrl);
      return embedUrl;
    }
    
    // Direct video URL or other platforms
    console.log('🎬 Direct video URL:', url);
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
                {/* Check if it's an embeddable platform or direct video */}
                {(embedUrl.includes('youtube.com') || 
                  embedUrl.includes('vimeo.com') || 
                  embedUrl.includes('drive.google.com') || 
                  embedUrl.includes('onedrive.live.com') || 
                  embedUrl.includes('1drv.ms') || 
                  embedUrl.includes('sharepoint.com') ||
                  embedUrl !== lesson.video_url // URL was converted, so it's embeddable
                ) ? (
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
                    onLoad={() => console.log('✅ Video iframe loaded successfully')}
                    onError={() => console.error('❌ Video iframe failed to load')}
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
