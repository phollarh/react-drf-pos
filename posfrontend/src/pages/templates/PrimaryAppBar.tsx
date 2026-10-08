import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import AccountButton from '../../components/PrimaryAppBar/AccountButton';
import { Box, Drawer, IconButton, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SideMenu from '../../components/PrimaryDraw/SideMenu';
import { useLocation } from "react-router-dom";




const PrimaryAppBar = () => {
    const [, setDrawerOpen] = React.useState(true);
    const [sideMenu, SetsideMenu] = React.useState(false);
    const location = useLocation();
    const isOnSalesReceipt = location.pathname === "/sales_receipts";
    const isOnSettings = location.pathname === "/settings";
    const isOnguide = location.pathname === "/guide";
    const isSmallScreenSettings = useMediaQuery("(max-width : 1000px)")
    
    const theme = useTheme();
    const below850 =  useMediaQuery("(max-width:1000px)")
    const isSmallScreen =  useMediaQuery("(max-width:750px)")
    React.useEffect(() => {
        if (isSmallScreen && sideMenu) {
            SetsideMenu(false)
        }
    }, [isSmallScreen])

    //  React.useEffect(() => {
    //     if (isSmallScreenSettings && sideMenu) {
    //         SetsideMenu(false)
    //     }
    // }, [isSmallScreenSettings])
        const toggleDrawer = (open: boolean) =>
        (_event: React.MouseEvent) => {
            SetsideMenu(open)

        }

    React.useEffect(() => {
            const handleDrawerToggle = (e: Event) => {
            const customEvent = e as CustomEvent;
            setDrawerOpen(customEvent.detail);
            };
            window.addEventListener("drawer-toggle", handleDrawerToggle);
            return () => window.removeEventListener("drawer-toggle", handleDrawerToggle);
        }, []);
    const below600 = useMediaQuery("(max-width:750px)")

    return(

       <AppBar 
        sx={
            {
                borderBottom:`1px solid ${theme.palette.divider}`,
            }}
            >
                
        <Toolbar variant='dense'  sx={{
                height: theme.primaryAppBar.height,
                minHeight: theme.primaryAppBar.height,
            }}>
                <Box sx={{ml:0, display:below850 && isOnSalesReceipt ? "block" :  "none" , }}>
                    <IconButton
                        onClick={toggleDrawer(true)}

                        color="primary"
                        aria-label="open drawer"
                        edge="start"
                        sx={{ mr: 2 }} >
                        <MenuIcon />
                    </IconButton>
            </Box>
            <Box sx={{ml:isSmallScreen ?"0px":`${theme.primaryDraw.width}px`, display:isOnSettings || isOnguide ?"none":isSmallScreen && !isOnSalesReceipt? "block" :  "none" , }}>
                    <IconButton
                        onClick={toggleDrawer(true)}

                        color="primary"
                        aria-label="open drawer"
                        edge="start"
                        sx={{ mr: 2 }} >
                        <MenuIcon />
                    </IconButton>
            </Box>
            {(isOnSettings || isOnguide) && (
            <Box sx={{ml:isSmallScreenSettings ?"0px":`${theme.primaryDraw.width}px`, display:isSmallScreenSettings ?"block" :  "none" , }}>
                    <IconButton
                        onClick={toggleDrawer(true)}

                        color="primary"
                        aria-label="open drawer"
                        edge="start"
                        sx={{ mr: 2 }} >
                        <MenuIcon />
                    </IconButton>
            </Box>
            )}
            
        <Drawer anchor="left" onClose={toggleDrawer(false)} open={sideMenu}>

                    <SideMenu open={sideMenu} />
                </Drawer>
            
          <Typography variant="h6" color='textPrimary' component="div" sx={{ml:!below600?`${theme.SecondaryDraw.width}px`:"auto", flexGrow: 1 }}>
            
            <AccountButton showForm={() => { } } handleFormClickOnBigScreen={function (_value: string): void {
                        throw new Error('Function not implemented.');
                    } }  />
          </Typography>
        </Toolbar>
      </AppBar>
    
    )
}

export default PrimaryAppBar