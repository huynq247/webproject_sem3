import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Chip,
  Tabs,
  Tab,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  School,
  PlayCircleOutline,
  Assignment,
  People,
  ExpandMore,
  Edit,
  Add,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { contentService, Lesson } from '../../services/content.service';
import { assignmentService } from '../../services/assignment.service';
import { useAuth } from '../../context/AuthContext';
import CreateLessonDialog from '../../components/lessons/CreateLessonDialog';
import AddExistingLessonDialog from '../../components/lessons/AddExistingLessonDialog';
import EditLessonDialog from '../../components/lessons/EditLessonDialog';
import DeleteConfirmationDialog from '../../components/lessons/DeleteConfirmationDialog';
import DraggableLessonList from '../../components/lessons/DraggableLessonList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [createLessonDialogOpen, setCreateLessonDialogOpen] = useState(false);
  const [addExistingLessonDialogOpen, setAddExistingLessonDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => contentService.getCourse(courseId!),
    enabled: !!courseId,
  });

  // Fetch lessons for this course
  const { data: lessonsData } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => contentService.getAllLessons({ course_id: courseId }),
    enabled: !!courseId,
  });

  // Fetch assignments for this course
  const { data: assignmentsData } = useQuery({
    queryKey: ['assignments', courseId],
    queryFn: () => assignmentService.getAssignments(),
    enabled: !!courseId,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (courseLoading) {
    return (
      <Container>
        <Typography>Loading course...</Typography>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container>
        <Alert severity="error">Course not found</Alert>
      </Container>
    );
  }

  const isInstructor = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/courses')}
          sx={{ mb: 2 }}
        >
          Back to Courses
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <School sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
              <Typography variant="h4" component="h1">
                {course.title}
              </Typography>
              {isInstructor && (
                <IconButton sx={{ ml: 2 }}>
                  <Edit />
                </IconButton>
              )}
            </Box>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {course.description}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={course.is_active ? 'Active' : 'Inactive'} 
                color={course.is_active ? 'success' : 'default'}
              />
              <Chip 
                label={`${lessonsData?.items?.length || course.total_lessons || 0} Lessons`} 
                variant="outlined"
              />
              <Chip 
                label={`${assignmentsData?.assignments?.length || 0} Assignments`} 
                variant="outlined"
              />
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              Created: {new Date(course.created_at).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Course Stats */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: 3, 
        mb: 3 
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PlayCircleOutline sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="h6">{lessonsData?.items?.length || course.total_lessons || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Lessons
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Assignment sx={{ mr: 2, color: 'warning.main' }} />
              <Box>
                <Typography variant="h6">{assignmentsData?.assignments?.length || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Assignments
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <People sx={{ mr: 2, color: 'success.main' }} />
              <Box>
                <Typography variant="h6">0</Typography>
                <Typography variant="body2" color="text.secondary">
                  Students
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Lessons" />
          <Tab label="Assignments" />
          <Tab label="Students" />
        </Tabs>
      </Box>

      {/* Lessons Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Course Lessons</Typography>
          {isInstructor && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                startIcon={<Add />}
                onClick={() => setAddExistingLessonDialogOpen(true)}
              >
                Add Existing Lesson
              </Button>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => setCreateLessonDialogOpen(true)}
              >
                Create New Lesson
              </Button>
            </Box>
          )}
        </Box>
        
        <DraggableLessonList
          lessons={lessonsData?.items || []}
          courseId={courseId!}
          canManage={isInstructor}
          onReorder={() => {
            // Refresh lessons after reorder
            queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
          }}
          onEdit={(lesson) => {
            setSelectedLesson(lesson);
            setEditDialogOpen(true);
          }}
          onDelete={(lessonId) => {
            const lesson = lessonsData?.items?.find(l => l.id === lessonId);
            if (lesson) {
              setSelectedLesson(lesson);
              setDeleteDialogOpen(true);
            }
          }}
        />
      </TabPanel>

      {/* Assignments Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Course Assignments</Typography>
          {isInstructor && (
            <Button variant="contained" startIcon={<Add />}>
              Create Assignment
            </Button>
          )}
        </Box>
        
        {assignmentsData?.assignments && assignmentsData.assignments.length > 0 ? (
          <List>
            {assignmentsData.assignments.map((assignment) => (
              <ListItem 
                key={assignment.id} 
                sx={{ 
                  border: 1, 
                  borderColor: 'divider', 
                  borderRadius: 1, 
                  mb: 1,
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/assignments/${assignment.id}`)}
              >
                <ListItemIcon>
                  <Assignment color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={assignment.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {assignment.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                      </Typography>
                    </Box>
                  }
                />
                <Chip 
                  label="Assignment" 
                  size="small" 
                  variant="outlined"
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary" align="center">
            No assignments available. {isInstructor && 'Create your first assignment!'}
          </Typography>
        )}
      </TabPanel>

      {/* Students Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" sx={{ mb: 3 }}>Enrolled Students</Typography>
        <Typography color="text.secondary" align="center">
          Student enrollment feature coming soon...
        </Typography>
      </TabPanel>

      {/* Add Existing Lesson Dialog */}
      <AddExistingLessonDialog
        open={addExistingLessonDialogOpen}
        onClose={() => {
          setAddExistingLessonDialogOpen(false);
          // Refresh lessons after adding existing lesson
          queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
        }}
        courseId={courseId!}
      />

      {/* Create New Lesson Dialog */}
      <CreateLessonDialog
        open={createLessonDialogOpen}
        onClose={() => setCreateLessonDialogOpen(false)}
        courseId={courseId}
        onSuccess={() => {
          setCreateLessonDialogOpen(false);
          // Refresh lessons after creating new lesson
          queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
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
          queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
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
          queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
        }}
      />
    </Container>
  );
};

export default CourseDetailPage;
