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
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface Staff {
  _id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  employmentInfo: {
    employeeId: string;
    position: string;
    department: string;
    status: string;
    hireDate: string;
    salary?: number;
  };
}

interface StaffFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employeeId: string;
  position: string;
  department: string;
  hireDate: string;
  salary: string;
}

export const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    position: '',
    department: '',
    hireDate: '',
    salary: '',
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/staff?limit=100', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStaff(data.data || []);
      } else {
        toast.error('Failed to fetch staff');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Error fetching staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenDialog = (member?: Staff) => {
    if (member) {
      setEditingStaff(member);
      setFormData({
        firstName: member.personalInfo.firstName,
        lastName: member.personalInfo.lastName,
        email: member.personalInfo.email,
        phone: member.personalInfo.phone,
        employeeId: member.employmentInfo.employeeId,
        position: member.employmentInfo.position,
        department: member.employmentInfo.department,
        hireDate: member.employmentInfo.hireDate.split('T')[0],
        salary: member.employmentInfo.salary?.toString() || '',
      });
    } else {
      setEditingStaff(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        employeeId: '',
        position: '',
        department: '',
        hireDate: '',
        salary: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStaff(null);
  };

  const handleInputChange = (field: keyof StaffFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const payload = {
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        employmentInfo: {
          employeeId: formData.employeeId,
          position: formData.position,
          department: formData.department,
          hireDate: formData.hireDate,
          salary: formData.salary ? parseFloat(formData.salary) : undefined,
        },
      };

      const url = editingStaff
        ? `http://localhost:3001/api/staff/${editingStaff._id}`
        : 'http://localhost:3001/api/staff';

      const method = editingStaff ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingStaff ? 'Staff updated successfully' : 'Staff created successfully');
        handleCloseDialog();
        fetchStaff();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save staff');
      }
    } catch (error) {
      console.error('Error saving staff:', error);
      toast.error('Error saving staff');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (staffId: string) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/staff/${staffId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Staff deleted successfully');
        fetchStaff();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete staff');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Error deleting staff');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const departments = Array.from(new Set(staff.map((s) => s.employmentInfo.department)));

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Staff Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchStaff}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Staff
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">{staff.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total Staff
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {staff.filter((s) => s.employmentInfo.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">{departments.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Departments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {staff.filter((s) => s.employmentInfo.status === 'on_leave').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                On Leave
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
                <TableCell>Employee ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member._id} hover>
                  <TableCell>{member.employmentInfo.employeeId}</TableCell>
                  <TableCell>
                    {member.personalInfo.firstName} {member.personalInfo.lastName}
                  </TableCell>
                  <TableCell>{member.employmentInfo.position}</TableCell>
                  <TableCell>{member.employmentInfo.department}</TableCell>
                  <TableCell>{member.personalInfo.email}</TableCell>
                  <TableCell>{member.personalInfo.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={member.employmentInfo.status.replace('_', ' ')}
                      size="small"
                      color={member.employmentInfo.status === 'active' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(member)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(member._id)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {staff.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No staff members found
          </Typography>
        </Box>
      )}

      {/* Add/Edit Staff Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{editingStaff ? 'Edit Staff' : 'Add New Staff'}</Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employee ID"
                value={formData.employeeId}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  label="Department"
                  onChange={(e) => handleInputChange('department', e.target.value)}
                >
                  <MenuItem value="Front Desk">Front Desk</MenuItem>
                  <MenuItem value="Housekeeping">Housekeeping</MenuItem>
                  <MenuItem value="Maintenance">Maintenance</MenuItem>
                  <MenuItem value="Food & Beverage">Food & Beverage</MenuItem>
                  <MenuItem value="Management">Management</MenuItem>
                  <MenuItem value="Security">Security</MenuItem>
                  <MenuItem value="Accounting">Accounting</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hire Date"
                type="date"
                value={formData.hireDate}
                onChange={(e) => handleInputChange('hireDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Salary (Optional)"
                type="number"
                value={formData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={
              saving ||
              !formData.firstName ||
              !formData.lastName ||
              !formData.email ||
              !formData.phone ||
              !formData.employeeId ||
              !formData.position ||
              !formData.department ||
              !formData.hireDate
            }
          >
            {saving ? <CircularProgress size={24} /> : editingStaff ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
