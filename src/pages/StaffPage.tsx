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
  employment: {
    employeeId: string;
    position: string;
    department: string;
    status: string;
    hireDate: string;
    employmentType: string;
    employmentStatus: string;
    salary?: number;
  };
}

interface StaffFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  employmentType: string;
  hireDate: string;
  salary: string;
  hourlyRate: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  hireDate?: string;
  hourlyRate?: string;
}

const validateForm = (data: StaffFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.firstName.trim()) {
    errors.firstName = 'First name is required';
  } else if (data.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  } else if (data.firstName.trim().length > 50) {
    errors.firstName = 'First name cannot exceed 50 characters';
  }

  if (!data.lastName.trim()) {
    errors.lastName = 'Last name is required';
  } else if (data.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  } else if (data.lastName.trim().length > 50) {
    errors.lastName = 'Last name cannot exceed 50 characters';
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (data.phone.trim().length < 7) {
    errors.phone = 'Please enter a valid phone number';
  }

  if (!data.position.trim()) {
    errors.position = 'Position is required';
  } else if (data.position.trim().length < 2) {
    errors.position = 'Position must be at least 2 characters';
  }

  if (!data.department) {
    errors.department = 'Department is required';
  }

  if (!data.hireDate) {
    errors.hireDate = 'Hire date is required';
  }

  if (data.employmentType !== 'full_time' && !data.hourlyRate) {
    errors.hourlyRate = 'Hourly rate is required for non-full-time employees';
  } else if (data.employmentType !== 'full_time' && parseFloat(data.hourlyRate) <= 0) {
    errors.hourlyRate = 'Hourly rate must be greater than 0';
  }

  return errors;
};

export const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof StaffFormData, boolean>>>({});
  const [formData, setFormData] = useState<StaffFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    employmentType: 'full_time',
    hireDate: '',
    salary: '',
    hourlyRate: '',
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
    setTouched({});
    if (member) {
      setEditingStaff(member);
      setFormData({
        firstName: member.personalInfo.firstName,
        lastName: member.personalInfo.lastName,
        email: member.personalInfo.email,
        phone: member.personalInfo.phone,
        position: member.employment.position,
        department: member.employment.department,
        employmentType: member.employment.employmentType || 'full_time',
        hireDate: member.employment.hireDate?.split('T')[0] || '',
        salary: member.employment.salary?.toString() || '',
        hourlyRate: '',
      });
    } else {
      setEditingStaff(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        employmentType: 'full_time',
        hireDate: '',
        salary: '',
        hourlyRate: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStaff(null);
    setTouched({});
  };

  const handleInputChange = (field: keyof StaffFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSave = async () => {
    // Mark all fields as touched to show all errors
    setTouched({
      firstName: true, lastName: true, email: true, phone: true,
      position: true, department: true, hireDate: true, hourlyRate: true,
    });

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

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
        employment: {
          position: formData.position,
          department: formData.department,
          hireDate: formData.hireDate,
          employmentType: formData.employmentType,
          salary: formData.employmentType === 'full_time' && formData.salary ? parseFloat(formData.salary) : undefined,
          hourlyRate: formData.employmentType !== 'full_time' && formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
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
        console.error('Staff save error:', JSON.stringify(errorData, null, 2));
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

  const departments = Array.from(new Set(staff.map((s) => s.employment?.department).filter(Boolean)));

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
                {staff.filter((s) => s.employment?.employmentStatus === 'active').length}
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
                {staff.filter((s) => s.employment?.employmentStatus === 'on_leave').length}
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
                  <TableCell>{member.employment?.employeeId || '—'}</TableCell>
                  <TableCell>
                    {member.personalInfo.firstName} {member.personalInfo.lastName}
                  </TableCell>
                  <TableCell>{member.employment?.position}</TableCell>
                  <TableCell>{member.employment?.department}</TableCell>
                  <TableCell>{member.personalInfo.email}</TableCell>
                  <TableCell>{member.personalInfo.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={(member.employment?.employmentStatus || 'active').replace('_', ' ')}
                      size="small"
                      color={member.employment?.employmentStatus === 'active' ? 'success' : 'default'}
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
            {(() => {
              const errors = validateForm(formData);
              return (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, firstName: true }))}
                      error={touched.firstName && !!errors.firstName}
                      helperText={touched.firstName && errors.firstName}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, lastName: true }))}
                      error={touched.lastName && !!errors.lastName}
                      helperText={touched.lastName && errors.lastName}
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
                      onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                      error={touched.email && !!errors.email}
                      helperText={touched.email && errors.email}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                      error={touched.phone && !!errors.phone}
                      helperText={touched.phone && errors.phone}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Position"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, position: true }))}
                      error={touched.position && !!errors.position}
                      helperText={touched.position && errors.position}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={touched.department && !!errors.department}>
                      <InputLabel>Department *</InputLabel>
                      <Select
                        value={formData.department}
                        label="Department *"
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        onBlur={() => setTouched((p) => ({ ...p, department: true }))}
                      >
                        <MenuItem value="front_desk">Front Desk</MenuItem>
                        <MenuItem value="housekeeping">Housekeeping</MenuItem>
                        <MenuItem value="maintenance">Maintenance</MenuItem>
                        <MenuItem value="food_beverage">Food & Beverage</MenuItem>
                        <MenuItem value="management">Management</MenuItem>
                        <MenuItem value="security">Security</MenuItem>
                        <MenuItem value="administration">Administration</MenuItem>
                      </Select>
                      {touched.department && errors.department && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                          {errors.department}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Employment Type</InputLabel>
                      <Select
                        value={formData.employmentType}
                        label="Employment Type"
                        onChange={(e) => handleInputChange('employmentType', e.target.value)}
                      >
                        <MenuItem value="full_time">Full Time</MenuItem>
                        <MenuItem value="part_time">Part Time</MenuItem>
                        <MenuItem value="contract">Contract</MenuItem>
                        <MenuItem value="temporary">Temporary</MenuItem>
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
                      onBlur={() => setTouched((p) => ({ ...p, hireDate: true }))}
                      error={touched.hireDate && !!errors.hireDate}
                      helperText={touched.hireDate && errors.hireDate}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={formData.employmentType === 'full_time' ? 'Salary (Optional)' : 'Salary'}
                      type="number"
                      value={formData.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                  {formData.employmentType !== 'full_time' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Hourly Rate"
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                        onBlur={() => setTouched((p) => ({ ...p, hourlyRate: true }))}
                        error={touched.hourlyRate && !!errors.hourlyRate}
                        helperText={touched.hourlyRate && errors.hourlyRate}
                        inputProps={{ min: 0, step: 0.01 }}
                        required
                      />
                    </Grid>
                  )}
                </>
              );
            })()}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : editingStaff ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
