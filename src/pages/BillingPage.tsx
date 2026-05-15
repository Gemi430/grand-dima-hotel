import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface Transaction {
  _id: string;
  reservationId: {
    _id: string;
    reservationNumber: string;
    guestDetails: {
      primaryGuest: {
        firstName: string;
        lastName: string;
      };
    };
  };
  amount: number;
  type: string;
  method: string;
  status: string;
  description?: string;
  processedAt: string;
  processedBy?: {
    firstName: string;
    lastName: string;
  };
}

interface RevenueStats {
  totalRevenue: number;
  pendingPayments: number;
  completedTransactions: number;
  refundedAmount: number;
}

export const BillingPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    pendingPayments: 0,
    completedTransactions: 0,
    refundedAmount: 0,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterType, setFilterType] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch all reservations to extract transactions
      const response = await fetch('http://localhost:3001/api/reservations?limit=100', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const reservations = data.data || [];
        
        // Extract all transactions from reservations
        const allTransactions: Transaction[] = [];
        let totalRevenue = 0;
        let pendingPayments = 0;
        let completedCount = 0;
        let refundedAmount = 0;

        reservations.forEach((reservation: any) => {
          if (reservation.payment?.transactions) {
            reservation.payment.transactions.forEach((transaction: any) => {
              allTransactions.push({
                ...transaction,
                _id: transaction.transactionId || transaction._id,
                reservationId: {
                  _id: reservation._id,
                  reservationNumber: reservation.reservationNumber,
                  guestDetails: reservation.guestDetails,
                },
              });

              // Calculate stats
              if (transaction.type === 'payment' && transaction.status === 'completed') {
                totalRevenue += transaction.amount;
                completedCount++;
              } else if (transaction.type === 'payment' && transaction.status === 'pending') {
                pendingPayments += transaction.amount;
              } else if (transaction.type === 'refund') {
                refundedAmount += transaction.amount;
              }
            });
          }

          // Add pending payments from reservations
          if (reservation.payment?.status === 'pending') {
            pendingPayments += reservation.pricing?.totalAmount || 0;
          }
        });

        setTransactions(allTransactions);
        setStats({
          totalRevenue,
          pendingPayments,
          completedTransactions: completedCount,
          refundedAmount,
        });
      } else {
        toast.error('Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Error fetching transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesMethod = filterMethod === 'all' || transaction.method === filterMethod;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      transaction.reservationId.reservationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${transaction.reservationId.guestDetails.primaryGuest.firstName} ${transaction.reservationId.guestDetails.primaryGuest.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesType && matchesMethod && matchesStatus && matchesSearch;
  });

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle open transaction details
  const handleOpenDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };

  // Handle close transaction details
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedTransaction(null);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status color
  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get type color
  const getTypeColor = (type: string): 'primary' | 'error' | 'default' => {
    switch (type) {
      case 'payment':
        return 'primary';
      case 'refund':
        return 'error';
      default:
        return 'default';
    }
  };

  // Export transactions to CSV
  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Reservation', 'Guest', 'Type', 'Method', 'Amount', 'Status', 'Date'];
    const rows = filteredTransactions.map((t) => [
      t._id,
      t.reservationId.reservationNumber,
      `${t.reservationId.guestDetails.primaryGuest.firstName} ${t.reservationId.guestDetails.primaryGuest.lastName}`,
      t.type,
      t.method,
      t.amount,
      t.status,
      formatDate(t.processedAt),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('Transactions exported to CSV');
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
          Billing & Transactions
        </Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchTransactions}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Revenue Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TrendingUpIcon color="success" />
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {formatCurrency(stats.totalRevenue)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                From completed transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <PaymentIcon color="warning" />
                <Typography variant="body2" color="text.secondary">
                  Pending Payments
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {formatCurrency(stats.pendingPayments)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Awaiting payment
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <ReceiptIcon color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Completed Transactions
                </Typography>
              </Box>
              <Typography variant="h4">{stats.completedTransactions}</Typography>
              <Typography variant="caption" color="text.secondary">
                Total count
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <PaymentIcon color="error" />
                <Typography variant="body2" color="text.secondary">
                  Refunded Amount
                </Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {formatCurrency(stats.refundedAmount)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total refunds
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              placeholder="Reservation # or Guest name"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={filterType} label="Type" onChange={(e) => setFilterType(e.target.value)}>
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="payment">Payment</MenuItem>
                <MenuItem value="refund">Refund</MenuItem>
                <MenuItem value="deposit">Deposit</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Method</InputLabel>
              <Select value={filterMethod} label="Method" onChange={(e) => setFilterMethod(e.target.value)}>
                <MenuItem value="all">All Methods</MenuItem>
                <MenuItem value="credit_card">Credit Card</MenuItem>
                <MenuItem value="debit_card">Debit Card</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="online_payment">Online Payment</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Transactions Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Reservation</TableCell>
                <TableCell>Guest</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction) => (
                  <TableRow key={transaction._id} hover>
                    <TableCell>{transaction._id}</TableCell>
                    <TableCell>{transaction.reservationId.reservationNumber}</TableCell>
                    <TableCell>
                      {transaction.reservationId.guestDetails.primaryGuest.firstName}{' '}
                      {transaction.reservationId.guestDetails.primaryGuest.lastName}
                    </TableCell>
                    <TableCell>
                      <Chip label={transaction.type} size="small" color={getTypeColor(transaction.type)} />
                    </TableCell>
                    <TableCell>{transaction.method.replace('_', ' ')}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={transaction.type === 'refund' ? 'error.main' : 'success.main'}
                      >
                        {transaction.type === 'refund' ? '-' : ''}
                        {formatCurrency(transaction.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={transaction.status} size="small" color={getStatusColor(transaction.status)} />
                    </TableCell>
                    <TableCell>{formatDate(transaction.processedAt)}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleOpenDetails(transaction)}>
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {filteredTransactions.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No transactions found
          </Typography>
        </Box>
      )}

      {/* Transaction Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        {selectedTransaction && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Transaction Details</Typography>
                <IconButton onClick={handleCloseDetails}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Transaction ID
                  </Typography>
                  <Typography variant="body1">{selectedTransaction._id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedTransaction.status}
                    size="small"
                    color={getStatusColor(selectedTransaction.status)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Reservation
                  </Typography>
                  <Typography variant="body1">{selectedTransaction.reservationId.reservationNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Guest
                  </Typography>
                  <Typography variant="body1">
                    {selectedTransaction.reservationId.guestDetails.primaryGuest.firstName}{' '}
                    {selectedTransaction.reservationId.guestDetails.primaryGuest.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Chip label={selectedTransaction.type} size="small" color={getTypeColor(selectedTransaction.type)} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Method
                  </Typography>
                  <Typography variant="body1">{selectedTransaction.method.replace('_', ' ')}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="h5" color={selectedTransaction.type === 'refund' ? 'error.main' : 'success.main'}>
                    {selectedTransaction.type === 'refund' ? '-' : ''}
                    {formatCurrency(selectedTransaction.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Processed At
                  </Typography>
                  <Typography variant="body1">{formatDate(selectedTransaction.processedAt)}</Typography>
                </Grid>
                {selectedTransaction.processedBy && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Processed By
                    </Typography>
                    <Typography variant="body1">
                      {selectedTransaction.processedBy.firstName} {selectedTransaction.processedBy.lastName}
                    </Typography>
                  </Grid>
                )}
                {selectedTransaction.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">{selectedTransaction.description}</Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
