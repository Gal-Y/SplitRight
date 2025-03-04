import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Link,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
  ];

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
        <Typography variant="h6" component="div">
          SplitRight
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text} component={RouterLink} to={item.path}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: '#1a1a1a' }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link component={RouterLink} to="/" color="inherit" underline="none">
              SplitRight
            </Link>
          </Typography>
          {!isMobile && (
            <Box sx={{ display: 'flex' }}>
              {menuItems.map((item) => (
                <Link
                  key={item.text}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  underline="none"
                  sx={{ mx: 1 }}
                >
                  {item.text}
                </Link>
              ))}
            </Box>
          )}
          <IconButton
            color="inherit"
            aria-label="github"
            component="a"
            href="https://github.com/Gal-Y/SplitRight"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>

      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: '#1a1a1a',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' SplitRight - Split expenses with friends'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 