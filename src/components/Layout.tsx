import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Hotel as HotelIcon,
  EventNote as EventNoteIcon,
  CleaningServices as CleaningServicesIcon,
  Group as GroupIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  ChevronLeft as ChevronLeftIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useSocket } from '../contexts/SocketContext';
import type { RootState } from '../store';

interface LayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED_WIDTH = 72;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', color: '#2563eb' },
  { text: 'Rooms', icon: <HotelIcon />, path: '/rooms', color: '#0891b2' },
  { text: 'Reservations', icon: <EventNoteIcon />, path: '/reservations', color: '#7c3aed' },
  { text: 'Guests', icon: <PeopleIcon />, path: '/guests', color: '#059669' },
  { text: 'Housekeeping', icon: <CleaningServicesIcon />, path: '/housekeeping', color: '#d97706' },
  { text: 'Staff', icon: <GroupIcon />, path: '/staff', color: '#dc2626' },
  { text: 'Billing', icon: <ReceiptIcon />, path: '/billing', color: '#0d9488' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports', color: '#7c3aed' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { isConnected } = useSocket();

  const drawerWidth = collapsed && !isMobile ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleCollapseToggle = () => setCollapsed(!collapsed);

  const handleMenuClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleProfileMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    dispatch(logout());
    handleProfileMenuClose();
    navigate('/login');
  };

  const currentPage = menuItems.find((item) => location.pathname.startsWith(item.path));

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0f172a',
        color: 'white',
        overflow: 'hidden',
      }}
    >
      {/* Logo / Brand */}
      <Box
        sx={{
          px: collapsed ? 1.5 : 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          minHeight: 72,
        }}
      >
        {!collapsed && (
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <HotelIcon sx={{ fontSize: 20, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                Grand Hotel
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.5, fontSize: '0.7rem' }}>
                Management System
              </Typography>
            </Box>
          </Box>
        )}
        {collapsed && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HotelIcon sx={{ fontSize: 20, color: 'white' }} />
          </Box>
        )}
        {!isMobile && !collapsed && (
          <IconButton
            size="small"
            onClick={handleCollapseToggle}
            sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.08)' } }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
        {!isMobile && collapsed && (
          <IconButton
            size="small"
            onClick={handleCollapseToggle}
            sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.08)' }, mt: 1 }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', py: 1.5, px: collapsed ? 1 : 1.5 }}>
        <List disablePadding>
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Tooltip
                key={item.text}
                title={collapsed ? item.text : ''}
                placement="right"
                arrow
              >
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleMenuClick(item.path)}
                    sx={{
                      borderRadius: 2,
                      px: collapsed ? 1.5 : 2,
                      py: 1.2,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      minHeight: 48,
                      position: 'relative',
                      bgcolor: isActive ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                      border: isActive ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: isActive ? 'rgba(37, 99, 235, 0.25)' : 'rgba(255,255,255,0.06)',
                        transform: 'translateX(2px)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 40,
                        color: isActive ? item.color : 'rgba(255,255,255,0.45)',
                        transition: 'color 0.2s',
                        '& .MuiSvgIcon-root': { fontSize: 22 },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
                        }}
                      />
                    )}
                    {isActive && !collapsed && (
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: item.color,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            );
          })}
        </List>
      </Box>

      {/* User Profile at Bottom */}
      <Box
        sx={{
          px: collapsed ? 1 : 1.5,
          py: 1.5,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Tooltip title={collapsed ? `${user?.firstName} ${user?.lastName}` : ''} placement="right">
          <Box
            onClick={handleProfileMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              cursor: 'pointer',
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
                fontSize: '0.875rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {user?.firstName?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            {!collapsed && (
              <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="body2" fontWeight={600} color="white" noWrap>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', textTransform: 'capitalize' }} noWrap>
                  {user?.role?.replace('_', ' ') || 'Staff'}
                </Typography>
              </Box>
            )}
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 }, transition: 'width 0.3s ease' }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              border: 'none',
              boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              border: 'none',
              boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
              transition: 'width 0.3s ease',
              overflow: 'hidden',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main content area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'all 0.3s ease',
        }}
      >
        {/* Top AppBar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'white',
            borderBottom: '1px solid #e2e8f0',
            color: 'text.primary',
            zIndex: theme.zIndex.drawer - 1,
          }}
        >
          <Toolbar sx={{ gap: 2, minHeight: { xs: 64, sm: 72 } }}>
            {/* Mobile menu button */}
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' }, color: 'text.secondary' }}
            >
              <MenuIcon />
            </IconButton>

            {/* Page title */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={700} color="text.primary" lineHeight={1.2}>
                {currentPage?.text || 'Dashboard'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>

            {/* Connection status */}
            <Chip
              size="small"
              label={isConnected ? 'Live' : 'Offline'}
              sx={{
                bgcolor: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: isConnected ? '#059669' : '#dc2626',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 26,
                '& .MuiChip-label': { px: 1.5 },
                display: { xs: 'none', sm: 'flex' },
              }}
            />

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton
                sx={{
                  color: 'text.secondary',
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  width: 40,
                  height: 40,
                  '&:hover': { bgcolor: '#f1f5f9', color: 'primary.main' },
                }}
              >
                <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}>
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User avatar */}
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ p: 0.5 }}
              >
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Profile dropdown menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 8,
            sx: {
              mt: 1,
              minWidth: 220,
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              overflow: 'visible',
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 16,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                borderTop: '1px solid #e2e8f0',
                borderLeft: '1px solid #e2e8f0',
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
              {user?.role?.replace('_', ' ') || 'Staff'} · {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={handleProfileMenuClose}
            sx={{ gap: 1.5, py: 1.2, '&:hover': { bgcolor: 'rgba(37,99,235,0.06)', color: 'primary.main' } }}
          >
            <SettingsIcon fontSize="small" />
            <Typography variant="body2">Settings</Typography>
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{ gap: 1.5, py: 1.2, color: 'error.main', '&:hover': { bgcolor: 'rgba(239,68,68,0.06)' } }}
          >
            <LogoutIcon fontSize="small" />
            <Typography variant="body2">Sign out</Typography>
          </MenuItem>
        </Menu>

        {/* Page content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            overflowX: 'hidden',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};
