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
  TablePagination,
  CircularProgress,
  Chip,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
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

interface Guest {
  _id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
  };
  guestType: string;
  status: string;
  loyaltyProgram?: {
    tier: string;
    points: number;
  };
  createdAt: string;
}

interface GuestFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  guestType: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export const GuestsPage: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<GuestFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    guestType: 'regular',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  });

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/guests?limit=100', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGuests(data.data || []);
      } else {
        toast.error('Failed to fetch guests');
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast.error('Error fetching guests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const filteredGuests = guests.filter(
    (guest) =>
      guest.personalInfo.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.personalInfo.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.personalInfo.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (guest?: Guest) => {
    if (guest) {
      setEditingGuest(guest);
      setFormData({
        firstName: guest.personalInfo.firstName,
        lastName: guest.personalInfo.lastName,
        email: guest.personalInfo.email,
        phone: guest.personalInfo.phone,
        dateOfBirth: guest.personalInfo.dateOfBirth || '',
        nationality: guest.personalInfo.nationality || '',
        guestType: guest.guestType,
        street: guest.personalInfo.address?.street || '',
        city: guest.personalInfo.address?.city || '',
        state: guest.personalInfo.address?.state || '',
        country: guest.personalInfo.address?.country || '',
        zipCode: guest.personalInfo.address?.zipCode || '',
      });
    } else {
      setEditingGuest(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        nationality: '',
        guestType: 'regular',
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingGuest(null);
  };

  const handleInputChange = (field: keyof GuestFormData, value: string) => {
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
          dateOfBirth: formData.dateOfBirth || undefined,
          nationality: formData.nationality || undefined,
          address: {
            street: formData.street || undefined,
            city: formData.city || undefined,
            state: formData.state || undefined,
            country: formData.country || undefined,
            zipCode: formData.zipCode || undefined,
          },
        },
        guestType: formData.guestType,
      };

      const url = editingGuest
        ? `http://localhost:3001/api/guests/${editingGuest._id}`
        : 'http://localhost:3001/api/guests';

      const method = editingGuest ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingGuest ? 'Guest updated successfully' : 'Guest created successfully');
        handleCloseDialog();
        fetchGuests();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save guest');
      }
    } catch (error) {
      console.error('Error saving guest:', error);
      toast.error('Error saving guest');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (guestId: string) => {
    if (!window.confirm('Are you sure you want to delete this guest?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/guests/${guestId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Guest deleted successfully');
        fetchGuests();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete guest');
      }
    } catch (error) {
      console.error('Error deleting guest:', error);
      toast.error('Error deleting guest');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Guest Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchGuests}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Guest
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Search Guests"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              placeholder="Search by name or email"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Loyalty Tier</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGuests
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((guest) => (
                  <TableRow key={guest._id} hover>
                    <TableCell>
                      {guest.personalInfo.firstName} {guest.personalInfo.lastName}
                    </TableCell>
                    <TableCell>{guest.personalInfo.email}</TableCell>
                    <TableCell>{guest.personalInfo.phone}</TableCell>
                    <TableCell>
                      <Chip label={guest.guestType} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={guest.status}
                        size="small"
                        color={guest.status === 'active' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {guest.loyaltyProgram ? (
                        <Chip label={guest.loyaltyProgram.tier} size="small" color="primary" />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog(guest)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(guest._id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredGuests.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {filteredGuests.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No guests found
          </Typography>
        </Box>
      )}

      {/* Add/Edit Guest Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{editingGuest ? 'Edit Guest' : 'Add New Guest'}</Typography>
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
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nationality"
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Guest Type</InputLabel>
                <Select
                  value={formData.guestType}
                  label="Guest Type"
                  onChange={(e) => handleInputChange('guestType', e.target.value)}
                >
                  <MenuItem value="regular">Regular</MenuItem>
                  <MenuItem value="vip">VIP</MenuItem>
                  <MenuItem value="corporate">Corporate</MenuItem>
                  <MenuItem value="group">Group</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Address
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="State/Province"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Zip Code"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
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
              !formData.phone
            }
          >
            {saving ? <CircularProgress size={24} /> : editingGuest ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
