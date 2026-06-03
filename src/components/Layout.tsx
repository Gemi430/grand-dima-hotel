import React, { useState, useEffect } from 'react';
import {
  Box, AppBar, Toolbar, Typography, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton,
  Divider, Avatar, Menu, MenuItem, Tooltip, Badge,
  useTheme, useMediaQuery,
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
  BookOnline as BookOnlineIcon,
  Restaurant as RestaurantIcon,
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
  { text: 'Dashboard',        icon: <DashboardIcon />,        path: '/dashboard',         color: '#2563eb', roles: ['admin','manager','front_desk','housekeeping'] },
  { text: 'Rooms',            icon: <HotelIcon />,            path: '/rooms',             color: '#0891b2', roles: ['admin','manager','front_desk','housekeeping'] },
  { text: 'Reservations',     icon: <EventNoteIcon />,        path: '/reservations',      color: '#7c3aed', roles: ['admin','manager','front_desk'] },
  { text: 'Guests',           icon: <PeopleIcon />,           path: '/guests',            color: '#059669', roles: ['admin','manager','front_desk'] },
  { text: 'Housekeeping',     icon: <CleaningServicesIcon />, path: '/housekeeping',      color: '#d97706', roles: ['admin','manager','front_desk','housekeeping'] },
  { text: 'Staff',            icon: <GroupIcon />,            path: '/staff',             color: '#dc2626', roles: ['admin','manager'] },
  { text: 'Billing',          icon: <ReceiptIcon />,          path: '/billing',           color: '#0d9488', roles: ['admin','manager','front_desk'] },
  { text: 'Reports',          icon: <AssessmentIcon />,       path: '/reports',           color: '#7c3aed', roles: ['admin','manager'] },
  { text: 'Booking Requests', icon: <BookOnlineIcon />,       path: '/booking-requests',  color: '#ea580c', roles: ['admin','manager','front_desk'], dividerBefore: true },
  { text: 'Food Orders',      icon: <RestaurantIcon />,       path: '/food-orders',       color: '#16a34a', roles: ['admin','manager','front_desk'] },
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
  const { isConnected, socket } = useSocket() as any;

  // New request badge counts
  const [newBookings, setNewBookings] = useState(0);
  const [newFoodOrders, setNewFoodOrders] = useState(0);

  // Fetch initial counts of 'new' requests
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch('http://localhost:3001/api/public/booking-requests?status=new&limit=1', { headers }),
      fetch('http://localhost:3001/api/public/food-orders?status=new&limit=1', { headers }),
    ]).then(async ([bRes, fRes]) => {
      if (bRes.ok) { const d = await bRes.json(); setNewBookings(d.pagination?.total || 0); }
      if (fRes.ok) { const d = await fRes.json(); setNewFoodOrders(d.pagination?.total || 0); }
    }).catch(() => {});
  }, []);

  // Real-time badge updates
  useEffect(() => {
    if (!socket) return;
    const onBooking = () => setNewBookings((n) => n + 1);
    const onFood = () => setNewFoodOrders((n) => n + 1);
    socket.on('booking_request:new', onBooking);
    socket.on('food_order:new', onFood);
    return () => {
      socket.off('booking_request:new', onBooking);
      socket.off('food_order:new', onFood);
    };
  }, [socket]);

  // Clear badge when visiting the page
  useEffect(() => {
    if (location.pathname.startsWith('/booking-requests')) setNewBookings(0);
    if (location.pathname.startsWith('/food-orders')) setNewFoodOrders(0);
  }, [location.pathname]);

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
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} sx={{ letterSpacing: 1 }}>
                Grand Dima
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.5, fontSize: '0.65rem', letterSpacing: 2 }}>
                HOTEL · SHEGGER
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
          {menuItems.filter(item => !user?.role || item.roles.includes(user.role)).map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const badge = item.path === '/booking-requests' ? newBookings : item.path === '/food-orders' ? newFoodOrders : 0;
            return (
              <React.Fragment key={item.text}>
                {(item as any).dividerBefore && (
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1, mx: collapsed ? 1 : 1.5 }} />
                )}
                <Tooltip title={collapsed ? item.text : ''} placement="right" arrow>
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
                        <Badge badgeContent={badge > 0 ? badge : undefined} color="error"
                          sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16, top: -2, right: -2 } }}>
                          {item.icon}
                        </Badge>
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
                      {!collapsed && badge > 0 && (
                        <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Typography sx={{ color: 'white', fontSize: '0.6rem', fontWeight: 700 }}>{badge > 99 ? '99+' : badge}</Typography>
                        </Box>
                      )}
                      {isActive && !collapsed && badge === 0 && (
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
              </React.Fragment>
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0a0a' }}>
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
            bgcolor: '#111',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            color: 'white',
            zIndex: theme.zIndex.drawer - 1,
          }}
        >
          <Toolbar sx={{ gap: 2, minHeight: { xs: 64, sm: 72 } }}>
            {/* Mobile menu button */}
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' }, color: 'rgba(255,255,255,0.6)' }}
            >
              <MenuIcon />
            </IconButton>

            {/* Page title */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.58rem', letterSpacing: 3, fontFamily: 'sans-serif', lineHeight: 1, mb: 0.25 }}>
                GRAND DIMA HOTEL
              </Typography>
              <Typography sx={{ color: 'white', fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, fontSize: '1.1rem', lineHeight: 1 }}>
                {currentPage?.text || 'Dashboard'}
              </Typography>
            </Box>

            {/* Connection status */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, px: 2, py: 0.75, bgcolor: isConnected ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${isConnected ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isConnected ? '#10b981' : '#ef4444' }} />
              <Typography sx={{ color: isConnected ? '#10b981' : '#ef4444', fontSize: '0.62rem', letterSpacing: 2, fontFamily: 'sans-serif' }}>
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </Typography>
            </Box>

            {/* Notifications */}
            <Tooltip title="New Requests">
              <IconButton
                onClick={() => navigate('/booking-requests')}
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  bgcolor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  width: 40, height: 40,
                  borderRadius: 0,
                  '&:hover': { bgcolor: 'rgba(201,169,110,0.1)', color: '#c9a96e', borderColor: 'rgba(201,169,110,0.3)' },
                }}
              >
                <Badge
                  badgeContent={newBookings + newFoodOrders || undefined}
                  color="error"
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 15, minWidth: 15 } }}
                >
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User avatar */}
            <Tooltip title="Account settings">
              <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5 }}>
                <Avatar
                  sx={{
                    width: 36, height: 36,
                    background: 'linear-gradient(135deg, #c9a96e, #b8935a)',
                    fontSize: '0.85rem', fontWeight: 700,
                    cursor: 'pointer', borderRadius: 0,
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
            elevation: 0,
            sx: {
              mt: 1,
              minWidth: 220,
              borderRadius: 0,
              bgcolor: '#111',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
            },
          }}
        >
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <Typography sx={{ color: 'white', fontFamily: 'serif', fontWeight: 600, fontSize: '0.95rem' }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography sx={{ color: '#c9a96e', fontSize: '0.65rem', letterSpacing: 2, fontFamily: 'sans-serif', textTransform: 'uppercase', mt: 0.25 }}>
              {user?.role?.replace('_', ' ') || 'Staff'}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontFamily: 'sans-serif', mt: 0.25 }}>
              {user?.email}
            </Typography>
          </Box>
          <MenuItem
            onClick={handleProfileMenuClose}
            sx={{ gap: 1.5, py: 1.5, color: 'rgba(255,255,255,0.6)', '&:hover': { bgcolor: 'rgba(201,169,110,0.08)', color: '#c9a96e' } }}
          >
            <SettingsIcon fontSize="small" />
            <Typography variant="body2" fontFamily="sans-serif">Settings</Typography>
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{ gap: 1.5, py: 1.5, color: '#f87171', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}
          >
            <LogoutIcon fontSize="small" />
            <Typography variant="body2" fontFamily="sans-serif">Sign out</Typography>
          </MenuItem>
        </Menu>

        {/* Page content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 3 },
            overflowX: 'hidden',
            bgcolor: '#0a0a0a',
            minHeight: 'calc(100vh - 72px)',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};
