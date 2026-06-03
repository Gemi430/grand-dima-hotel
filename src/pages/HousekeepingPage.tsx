import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as StartIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface Room {
  _id: string;
  roomNumber: string;
}

interface Staff {
  _id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
  };
}

interface HousekeepingTask {
  _id: string;
  roomId: {
    _id: string;
    roomNumber: string;
  };
  taskType: string;
  priority: string;
  status: string;
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  scheduledFor: string;
  description?: string;
  estimatedDuration?: number;
}

interface TaskFormData {
  roomId: string;
  taskType: string;
  priority: string;
  scheduledFor: string;
  assignedTo: string;
  description: string;
  estimatedDuration: string;
}

export const HousekeepingPage: React.FC = () => {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<HousekeepingTask | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    roomId: '',
    taskType: 'checkout_cleaning',
    priority: 'normal',
    scheduledFor: new Date().toISOString().split('T')[0],
    assignedTo: '',
    description: '',
    estimatedDuration: '60',
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/housekeeping?limit=100', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.data || []);
      } else {
        toast.error('Failed to fetch housekeeping tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Error fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/rooms?limit=100', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/staff?limit=100', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStaff(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchRooms();
    fetchStaff();
  }, []);

  const handleOpenDialog = (task?: HousekeepingTask) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        roomId: task.roomId._id,
        taskType: task.taskType,
        priority: task.priority,        scheduledFor: task.scheduledFor.split('T')[0],
        assignedTo: task.assignedTo?._id || '',
        description: task.description || '',
        estimatedDuration: task.estimatedDuration?.toString() || '60',
      });
    } else {
      setEditingTask(null);
      setFormData({
        roomId: '',
        taskType: 'checkout_cleaning',
        priority: 'normal',
        scheduledFor: new Date().toISOString().split('T')[0],
        assignedTo: '',
        description: '',
        estimatedDuration: '60',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTask(null);
  };

  const handleInputChange = (field: keyof TaskFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const payload = {
        roomId: formData.roomId,
        taskType: formData.taskType,
        priority: formData.priority,
        scheduledFor: formData.scheduledFor,
        assignedTo: formData.assignedTo || undefined,
        description: formData.description || undefined,
        estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : undefined,
      };

      const url = editingTask
        ? `http://localhost:3001/api/housekeeping/${editingTask._id}`
        : 'http://localhost:3001/api/housekeeping';

      const method = editingTask ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingTask ? 'Task updated successfully' : 'Task created successfully');
        handleCloseDialog();
        fetchTasks();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save task');
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Error saving task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/housekeeping/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Task deleted successfully');
        fetchTasks();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Error deleting task');
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/housekeeping/${taskId}/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Task started');
        fetchTasks();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to start task');
      }
    } catch (error) {
      console.error('Error starting task:', error);
      toast.error('Error starting task');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/housekeeping/${taskId}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Task completed');
        fetchTasks();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to complete task');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Error completing task');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'warning' => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      default:
        return 'warning';
    }
  };

  const getPriorityColor = (priority: string): 'default' | 'warning' | 'error' => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'error';
      case 'normal':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Housekeeping Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchTasks}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Task
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">{tasks.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {tasks.filter((t) => t.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {tasks.filter((t) => t.status === 'in_progress').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {tasks.filter((t) => t.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Room</TableCell>
                <TableCell>Task Type</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Scheduled For</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task._id} hover>
                  <TableCell>{task.roomId.roomNumber}</TableCell>
                  <TableCell>{task.taskType.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <Chip label={task.priority} size="small" color={getPriorityColor(task.priority)} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.status.replace('_', ' ')}
                      size="small"
                      color={getStatusColor(task.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {task.assignedTo
                      ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                      : 'Unassigned'}
                  </TableCell>
                  <TableCell>{new Date(task.scheduledFor).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      {task.status === 'pending' && (
                        <IconButton size="small" onClick={() => handleStartTask(task._id)} color="primary">
                          <StartIcon fontSize="small" />
                        </IconButton>
                      )}
                      {task.status === 'in_progress' && (
                        <IconButton size="small" onClick={() => handleCompleteTask(task._id)} color="success">
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton size="small" onClick={() => handleOpenDialog(task)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(task._id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {tasks.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No housekeeping tasks found
          </Typography>
        </Box>
      )}

      {/* Add/Edit Task Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{editingTask ? 'Edit Task' : 'Add New Task'}</Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Room</InputLabel>
                <Select
                  value={formData.roomId}
                  label="Room"
                  onChange={(e) => handleInputChange('roomId', e.target.value)}
                >
                  {rooms.map((room) => (
                    <MenuItem key={room._id} value={room._id}>
                      {room.roomNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Task Type</InputLabel>
                <Select
                  value={formData.taskType}
                  label="Task Type"
                  onChange={(e) => handleInputChange('taskType', e.target.value)}
                >
                  <MenuItem value="checkout_cleaning">Checkout Cleaning</MenuItem>
                  <MenuItem value="maintenance_cleaning">Maintenance Cleaning</MenuItem>
                  <MenuItem value="deep_cleaning">Deep Cleaning</MenuItem>
                  <MenuItem value="inspection">Inspection</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Scheduled For"
                type="date"
                value={formData.scheduledFor}
                onChange={(e) => handleInputChange('scheduledFor', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={formData.assignedTo}
                  label="Assign To"
                  onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {staff.map((member) => (
                    <MenuItem key={member._id} value={member._id}>
                      {member.personalInfo.firstName} {member.personalInfo.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estimated Duration (minutes)"
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !formData.roomId || !formData.taskType || !formData.scheduledFor}
          >
            {saving ? <CircularProgress size={24} /> : editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
