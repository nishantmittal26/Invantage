import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Avatar,
  useTheme,
  Button,
  ListSubheader,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Inventory2 as ProductIcon,
  Category as CategoryIcon,
  Label as BrandIcon,
  SquareFoot as UnitIcon,
  LocalShipping as SupplierIcon,
  Store as WarehouseIcon,
  Input as StockInIcon,
  Output as StockOutIcon,
  SettingsBackupRestore as AdjustmentIcon,
  SwapHoriz as TransferIcon,
  ShoppingBag as PurchaseOrderIcon,
  BarChart as ReportIcon,
  People as UsersIcon,
  AdminPanelSettings as RolesIcon,
  Settings as SettingsIcon,
  LockOutlined as LockIcon,
  ExpandLess,
  ExpandMore,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';
import { toggleThemeMode, setUnreadNotificationsCount } from '../store/settingsSlice';
import { getPermissionsFromToken } from '../utils/jwt';
import axiosInstance from '../api/axios';
import { Notification } from '../types';

const drawerWidth = 260;

const Layout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const { user } = useAppSelector((state) => state.auth);
  const { mode, companyName, unreadNotificationsCount } = useAppSelector((state) => state.settings);

  const [open, setOpen] = useState(true);
  const [mastersOpen, setMastersOpen] = useState(false);
  const [txOpen, setTxOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifyAnchorEl, setNotifyAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const token = localStorage.getItem('token');
  const permissions = getPermissionsFromToken(token);

  const hasPermission = (moduleName: string, action: string = 'View'): boolean => {
    if (!user) return false;
    if (user.role === 'MasterAdmin') return true;
    return permissions.some((p) => p.toLowerCase() === `${moduleName}:${action}`.toLowerCase());
  };

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifyAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleNotificationsMenuClose = () => {
    setNotifyAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    dispatch(logout());
    navigate('/login');
  };

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get('/notifications');
      if (response.data.succeeded) {
        setNotifications(response.data.data);
        const unread = response.data.data.filter((n: Notification) => !n.isRead).length;
        dispatch(setUnreadNotificationsCount(unread));
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await axiosInstance.post(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axiosInstance.post('/notifications/read-all');
      fetchNotifications();
      handleNotificationsMenuClose();
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  // Poll notifications every 60 seconds
  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      show: true,
    },
    {
      text: 'Masters',
      icon: <ProductIcon />,
      show:
        hasPermission('Products') ||
        hasPermission('Categories') ||
        hasPermission('Brands') ||
        hasPermission('Units') ||
        hasPermission('Suppliers') ||
        hasPermission('Warehouses'),
      isOpen: mastersOpen,
      setIsOpen: setMastersOpen,
      children: [
        { text: 'Products', icon: <ProductIcon />, path: '/masters/products', show: hasPermission('Products') },
        { text: 'Categories', icon: <CategoryIcon />, path: '/masters/categories', show: hasPermission('Categories') },
        { text: 'Brands', icon: <BrandIcon />, path: '/masters/brands', show: hasPermission('Brands') },
        { text: 'Units', icon: <UnitIcon />, path: '/masters/units', show: hasPermission('Units') },
        { text: 'Suppliers', icon: <SupplierIcon />, path: '/masters/suppliers', show: hasPermission('Suppliers') },
        { text: 'Warehouses', icon: <WarehouseIcon />, path: '/masters/warehouses', show: hasPermission('Warehouses') },
      ],
    },
    {
      text: 'Inventory',
      icon: <StockInIcon />,
      show:
        hasPermission('StockIn') ||
        hasPermission('StockOut') ||
        hasPermission('Adjustments') ||
        hasPermission('Transfers'),
      isOpen: txOpen,
      setIsOpen: setTxOpen,
      children: [
        { text: 'Stock In', icon: <StockInIcon />, path: '/transactions/stock-in', show: hasPermission('StockIn') },
        { text: 'Stock Out', icon: <StockOutIcon />, path: '/transactions/stock-out', show: hasPermission('StockOut') },
        { text: 'Adjustments', icon: <AdjustmentIcon />, path: '/transactions/adjustments', show: hasPermission('Adjustments') },
        { text: 'Transfers', icon: <TransferIcon />, path: '/transactions/transfers', show: hasPermission('Transfers') },
      ],
    },
    {
      text: 'Purchase Orders',
      icon: <PurchaseOrderIcon />,
      path: '/purchase-orders',
      show: hasPermission('PurchaseOrders') || user?.role === 'InventoryManager',
    },
    {
      text: 'Reports',
      icon: <ReportIcon />,
      path: '/reports',
      show: hasPermission('Reports') || user?.role === 'InventoryManager',
    },
    {
      text: 'Administration',
      icon: <RolesIcon />,
      show: user?.role === 'MasterAdmin',
      isOpen: adminOpen,
      setIsOpen: setAdminOpen,
      children: [
        { text: 'Users', icon: <UsersIcon />, path: '/admin/users', show: user?.role === 'MasterAdmin' },
        { text: 'Roles & Permissions', icon: <RolesIcon />, path: '/admin/roles', show: user?.role === 'MasterAdmin' },
      ],
    },
    {
      text: 'System Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      show: user?.role === 'MasterAdmin',
    },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      {/* Top Navbar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
          backgroundColor: mode === 'dark' ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ marginRight: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h5" noWrap component="div" sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {companyName}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Dark Mode toggle */}
            <IconButton onClick={() => dispatch(toggleThemeMode())} color="inherit">
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            {/* Notifications */}
            <IconButton color="inherit" onClick={handleNotificationsMenuOpen}>
              <Badge badgeContent={unreadNotificationsCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* User Details & Profile Avatar */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, cursor: 'pointer' }} onClick={handleProfileMenuOpen}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 34, height: 34, fontSize: '0.9rem', fontWeight: 600 }}>
                {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' }, ml: 1, textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: -0.5 }}>
                  {user?.role}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: mode === 'dark' ? '#0f172a' : '#ffffff',
            borderRight: `1px solid ${theme.palette.divider}`,
            whiteSpace: 'nowrap',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            ...(!open && {
              overflowX: 'hidden',
              width: theme.spacing(7),
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }),
          },
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List sx={{ px: 1 }}>
          {menuItems.map((item, index) => {
            if (!item.show) return null;

            if (item.children) {
              const hasVisibleChildren = item.children.some((child) => child.show);
              if (!hasVisibleChildren) return null;

              return (
                <React.Fragment key={index}>
                  <ListItemButton
                    onClick={() => item.setIsOpen(!item.isOpen)}
                    sx={{
                      borderRadius: '8px',
                      mb: 0.5,
                      justifyContent: open ? 'initial' : 'center',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', justifyContent: 'center' }}>
                      {item.icon}
                    </ListItemIcon>
                    {open && (
                      <>
                        <ListItemText primary={item.text} sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem', fontWeight: 500 } }} />
                        {item.isOpen ? <ExpandLess /> : <ExpandMore />}
                      </>
                    )}
                  </ListItemButton>
                  <Collapse in={item.isOpen && open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 2 }}>
                      {item.children.map((child, cIdx) => {
                        if (!child.show) return null;
                        const isChildActive = location.pathname === child.path;
                        return (
                          <ListItemButton
                            key={cIdx}
                            onClick={() => navigate(child.path)}
                            sx={{
                              borderRadius: '8px',
                              mb: 0.5,
                              backgroundColor: isChildActive ? theme.palette.action.selected : 'transparent',
                              color: isChildActive ? theme.palette.primary.main : 'inherit',
                              '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 0,
                                mr: 2,
                                color: isChildActive ? theme.palette.primary.main : 'inherit',
                              }}
                            >
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText primary={child.text} sx={{ '& .MuiListItemText-primary': { fontSize: '0.85rem', fontWeight: isChildActive ? 600 : 500 } }} />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </React.Fragment>
              );
            }

            const isActive = location.pathname === item.path;

            return (
              <ListItem key={index} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  onClick={() => navigate(item.path!)}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    borderRadius: '8px',
                    mb: 0.5,
                    backgroundColor: isActive ? theme.palette.action.selected : 'transparent',
                    color: isActive ? theme.palette.primary.main : 'inherit',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: isActive ? theme.palette.primary.main : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && <ListItemText primary={item.text} sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem', fontWeight: isActive ? 600 : 500 } }} />}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          pt: 10,
          pb: 4,
          px: { xs: 2, md: 4 },
        }}
      >
        <Outlet />
      </Box>

      {/* User Profile dropdown menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              width: 200,
              borderRadius: '10px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: `1px solid ${theme.palette.divider}`,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled sx={{ opacity: '1 !important', py: 1 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user ? `${user.firstName} ${user.lastName}` : ''}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {user?.email}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        {user?.role === 'MasterAdmin' && (
          <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            System Settings
          </MenuItem>
        )}
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/change-password'); }}>
          <ListItemIcon>
            <LockIcon fontSize="small" />
          </ListItemIcon>
          Change Password
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon sx={{ color: theme.palette.error.main }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Popover Dropdown */}
      <Menu
        anchorEl={notifyAnchorEl}
        open={Boolean(notifyAnchorEl)}
        onClose={handleNotificationsMenuClose}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              width: 320,
              maxHeight: 400,
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: `1px solid ${theme.palette.divider}`,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <ListSubheader
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 1,
            lineHeight: 'normal',
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Notifications
          </Typography>
          {notifications.some((n) => !n.isRead) && (
            <Button size="small" onClick={handleMarkAllAsRead} sx={{ fontSize: '0.75rem' }}>
              Mark all read
            </Button>
          )}
        </ListSubheader>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem sx={{ py: 3, justifyContent: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              No notifications yet.
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((n) => (
            <MenuItem
              key={n.id}
              onClick={() => !n.isRead && handleMarkAsRead(n.id)}
              sx={{
                py: 1.5,
                whiteSpace: 'normal',
                backgroundColor: n.isRead ? 'transparent' : 'action.hover',
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
              }}
            >
              {!n.isRead && <DotIcon color="primary" sx={{ fontSize: 10, mt: 0.5 }} />}
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: n.isRead ? 400 : 500 }}>
                  {n.message}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(n.timestamp).toLocaleDateString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  );
};

export default Layout;
