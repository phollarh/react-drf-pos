import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import AccountButton from '../../components/PrimaryAppBar/AccountButton';
import { Box, Drawer, IconButton,useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation } from "react-router-dom";
import SideMenuHome from '../../components/PrimaryDraw/sideMenuHome';

interface HomeProps{
   sideMenu:boolean;
   SetsideMenu: React.Dispatch<React.SetStateAction<boolean>>;
   showForm: (input: string | null | undefined) => void;
handleFormClickOnBigScreen: (value:string) => void;
   
}

const PrimaryAppBarHome = ({ handleFormClickOnBigScreen,showForm,sideMenu,SetsideMenu}:HomeProps) => {
    const location = useLocation();
    const isOnSalesReceipt = location.pathname === "/sales_receipts";
    const theme = useTheme();
    const isSmallScreen =  useMediaQuery("(max-width:750px)")

    React.useEffect(() => {
        if (isSmallScreen && sideMenu) {
            SetsideMenu(false)
        }
    }, [isSmallScreen])
    const toggleDrawer = (open: boolean) =>
        (_event: React.MouseEvent) => {
            SetsideMenu(open)

        }
        
    return(

       <AppBar 
        sx={{
                borderBottom:`1px solid ${theme.palette.divider}`,
            }}
            >
                
        <Toolbar variant='dense'  sx={{
                // ml:isSmallScreen ?"0px":`${theme.primaryDraw.width}px`,
                height: theme.primaryAppBar.height,
                minHeight: theme.primaryAppBar.height,
            }}>

            <Box sx={{ml:isSmallScreen ?"0px":`${theme.primaryDraw.width}px`, display:isSmallScreen && !isOnSalesReceipt? "block" :  "none" , }}>
                    <IconButton
                        onClick={toggleDrawer(true)}

                        color="primary"
                        aria-label="open drawer"
                        edge="start"
                        sx={{ mr: 2 }} >
                        <MenuIcon />
                    </IconButton>
            </Box>
        <Drawer anchor="left" onClose={toggleDrawer(false)} open={sideMenu}>

                    <SideMenuHome showForm={showForm} open={sideMenu} />
        </Drawer>
        
          <Typography variant="h6" color='textPrimary' component="div" sx={{ flexGrow: 1 }}>

            <AccountButton handleFormClickOnBigScreen={handleFormClickOnBigScreen} showForm={showForm} />
          </Typography>
        </Toolbar>
      </AppBar>
    
    )
}

export default PrimaryAppBarHome