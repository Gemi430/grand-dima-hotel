import React, { useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Date range state
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  
  // Report data state
  const [occupancyReport, setOccupancyReport] = useState<any>(null);
  const [revenueReport, setRevenueReport] = useState<any>(null);
  const [satisfactionReport, setSatisfactionReport] = useState<any>(null);
  const [performanceReport, setPerformanceReport] = useState<any>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const fetchReport = async (reportType: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/reports/${reportType}?start=${startDate}&end=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${reportType} report`);
      }

      const data = await response.json();
      
      switch (reportType) {
        case 'occupancy':
          setOccupancyReport(data.data);
          break;
        case 'revenue':
          setRevenueReport(data.data);
          break;
        case 'guest-satisfaction':
          setSatisfactionReport(data.data);
          break;
        case 'staff-performance':
          setPerformanceReport(data.data);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (reportType: string, format: 'csv' | 'json') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/reports/export/${reportType}?start=${startDate}&end=${endDate}&format=${format}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${startDate}-${endDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const handleQuickDateRange = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Reports & Analytics
      </Typography>

      {/* Date Range Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button size="small" onClick={() => handleQuickDateRange(7)}>
                  Last 7 Days
                </Button>
                <Button size="small" onClick={() => handleQuickDateRange(30)}>
                  Last 30 Days
                </Button>
                <Button size="small" onClick={() => handleQuickDateRange(90)}>
                  Last 90 Days
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
                    setEndDate(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
                  }}
                >
                  This Month
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Report Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Occupancy Report" />
          <Tab label="Revenue Report" />
          <Tab label="Guest Satisfaction" />
          <Tab label="Staff Performance" />
        </Tabs>
      </Box>

      {/* Occupancy Report */}
      <TabPanel value={activeTab} index={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Occupancy Report</Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => fetchReport('occupancy')}
              disabled={loading}
            >
              Generate Report
            </Button>
            {occupancyReport && (
              <>
                <Tooltip title="Export as CSV">
                  <IconButton onClick={() => exportReport('occupancy', 'csv')}>
                    <ExcelIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export as JSON">
                  <IconButton onClick={() => exportReport('occupancy', 'json')}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        )}

        {occupancyReport && !loading && (
          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Average Occupancy Rate
                  </Typography>
                  <Typography variant="h4">
                    {occupancyReport.summary.averageOccupancyRate}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Room Nights
                  </Typography>
                  <Typography variant="h4">
                    {occupancyReport.summary.totalRoomNights}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Occupied Room Nights
                  </Typography>
                  <Typography variant="h4">
                    {occupancyReport.summary.occupiedRoomNights}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Peak Occupancy
                  </Typography>
                  <Typography variant="h4">
                    {occupancyReport.trends.peakOccupancyRate}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(occupancyReport.trends.peakOccupancyDate), 'MMM dd')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Daily Occupancy Chart */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Daily Occupancy Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={occupancyReport.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                      />
                      <YAxis />
                      <RechartsTooltip
                        labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="occupancyRate"
                        stroke="#8884d8"
                        name="Occupancy Rate (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* By Room Type */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Occupancy by Room Type
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={occupancyReport.byRoomType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="roomType" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="averageOccupancyRate" fill="#8884d8" name="Occupancy Rate (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Room Type Table */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Room Type Details
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Room Type</TableCell>
                          <TableCell align="right">Total Rooms</TableCell>
                          <TableCell align="right">Occupied Nights</TableCell>
                          <TableCell align="right">Occupancy %</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {occupancyReport.byRoomType.map((row: any) => (
                          <TableRow key={row.roomType}>
                            <TableCell>{row.roomType}</TableCell>
                            <TableCell align="right">{row.totalRooms}</TableCell>
                            <TableCell align="right">{row.occupiedRoomNights}</TableCell>
                            <TableCell align="right">{row.averageOccupancyRate}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* Revenue Report */}
      <TabPanel value={activeTab} index={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Revenue Report</Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => fetchReport('revenue')}
              disabled={loading}
            >
              Generate Report
            </Button>
            {revenueReport && (
              <>
                <Tooltip title="Export as CSV">
                  <IconButton onClick={() => exportReport('revenue', 'csv')}>
                    <ExcelIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export as JSON">
                  <IconButton onClick={() => exportReport('revenue', 'json')}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        )}

        {revenueReport && !loading && (
          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">
                    ${revenueReport.summary.totalRevenue.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Room Revenue
                  </Typography>
                  <Typography variant="h4">
                    ${revenueReport.summary.roomRevenue.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Average Daily Rate
                  </Typography>
                  <Typography variant="h4">
                    ${revenueReport.summary.averageDailyRate.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    RevPAR
                  </Typography>
                  <Typography variant="h4">
                    ${revenueReport.summary.revenuePerAvailableRoom.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Daily Revenue Chart */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Daily Revenue Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueReport.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                      />
                      <YAxis />
                      <RechartsTooltip
                        labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Total Revenue" />
                      <Line type="monotone" dataKey="roomRevenue" stroke="#82ca9d" name="Room Revenue" />
                      <Line type="monotone" dataKey="serviceRevenue" stroke="#ffc658" name="Service Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue by Room Type */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue by Room Type
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueReport.byRoomType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="roomType" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue by Payment Method */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue by Payment Method
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(revenueReport.byPaymentMethod).map(([key, value]) => ({
                          name: key,
                          value,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.keys(revenueReport.byPaymentMethod).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* Guest Satisfaction Report */}
      <TabPanel value={activeTab} index={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Guest Satisfaction Report</Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => fetchReport('guest-satisfaction')}
              disabled={loading}
            >
              Generate Report
            </Button>
            {satisfactionReport && (
              <>
                <Tooltip title="Export as CSV">
                  <IconButton onClick={() => exportReport('satisfaction', 'csv')}>
                    <ExcelIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export as JSON">
                  <IconButton onClick={() => exportReport('satisfaction', 'json')}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        )}

        {satisfactionReport && !loading && (
          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Average Rating
                  </Typography>
                  <Typography variant="h4">
                    {satisfactionReport.summary.averageRating.toFixed(1)} / 5.0
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Guests
                  </Typography>
                  <Typography variant="h4">
                    {satisfactionReport.summary.totalGuests}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Repeat Guest Rate
                  </Typography>
                  <Typography variant="h4">
                    {satisfactionReport.summary.repeatGuestRate}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    VIP Guests
                  </Typography>
                  <Typography variant="h4">
                    {satisfactionReport.summary.vipGuestCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Rating Distribution */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Rating Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(satisfactionReport.ratingDistribution).map(
                        ([rating, count]) => ({
                          rating: `${rating} Stars`,
                          count,
                        })
                      )}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" name="Number of Ratings" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Feedback Summary */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Feedback Summary
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Positive', value: satisfactionReport.feedbackSummary.positiveCount },
                          { name: 'Neutral', value: satisfactionReport.feedbackSummary.neutralCount },
                          { name: 'Negative', value: satisfactionReport.feedbackSummary.negativeCount },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#00C49F" />
                        <Cell fill="#FFBB28" />
                        <Cell fill="#FF8042" />
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* Staff Performance Report */}
      <TabPanel value={activeTab} index={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Staff Performance Report</Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => fetchReport('staff-performance')}
              disabled={loading}
            >
              Generate Report
            </Button>
            {performanceReport && (
              <>
                <Tooltip title="Export as CSV">
                  <IconButton onClick={() => exportReport('performance', 'csv')}>
                    <ExcelIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export as JSON">
                  <IconButton onClick={() => exportReport('performance', 'json')}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        )}

        {performanceReport && !loading && (
          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Staff
                  </Typography>
                  <Typography variant="h4">
                    {performanceReport.summary.totalStaff}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Tasks Completed
                  </Typography>
                  <Typography variant="h4">
                    {performanceReport.summary.totalTasksCompleted}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Avg Quality Score
                  </Typography>
                  <Typography variant="h4">
                    {performanceReport.summary.averageQualityScore.toFixed(1)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    On-Time Rate
                  </Typography>
                  <Typography variant="h4">
                    {performanceReport.taskMetrics.onTimeCompletionRate.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Performance by Department */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Performance by Department
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceReport.byDepartment}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="tasksCompleted" fill="#8884d8" name="Tasks Completed" />
                      <Bar dataKey="averageQualityScore" fill="#82ca9d" name="Quality Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Top Performers */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Performers
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell align="right">Tasks Completed</TableCell>
                          <TableCell align="right">Quality Score</TableCell>
                          <TableCell align="right">Average Rating</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {performanceReport.topPerformers.map((performer: any) => (
                          <TableRow key={performer.staffId}>
                            <TableCell>{performer.name}</TableCell>
                            <TableCell>{performer.department}</TableCell>
                            <TableCell align="right">{performer.tasksCompleted}</TableCell>
                            <TableCell align="right">{performer.qualityScore.toFixed(1)}</TableCell>
                            <TableCell align="right">{performer.averageRating.toFixed(1)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>
    </Box>
  );
};

