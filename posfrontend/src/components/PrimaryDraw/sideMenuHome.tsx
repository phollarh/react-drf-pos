import {
    Box,
    Typography,
    Button,
    Stack,
    useMediaQuery,
    MenuItem,
} from "@mui/material";


import { useTheme } from "@mui/material/styles";

import LaptopWindowsIcon from '@mui/icons-material/LaptopWindows';
import SideMenuItems from "../SideMenuItems";
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import InfoIcon from '@mui/icons-material/Info';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SideMenuAccordion from "../sideMenuAccord/SideMenuDrop";
import React from "react";
import DarkModeSwitch from "../PrimaryAppBar/DarkModeSwitch";
import { Link } from "react-router-dom";



type Props = {
    open: boolean;
    showForm: (input: string | null | undefined) => void;
}

// const sideMenu= ['Home', 'Products','Sales', 'Create Receipt' ]
// const otherSideMenu = ['Settings','Past Receipts', 'About', 'Feedback']


const SideMenuHome: React.FC<Props> = ({ open,showForm }: Props) => {
    const theme = useTheme()
    const below600 = useMediaQuery("(max-width:750px)")
    const isDarkMode = theme.palette.mode === "dark"
    return (
        <>
            <Box sx={{
                maxHeight:below600?`80px`:`${theme.primaryAppBar.height}px`,
                position:"relative",
                width:'100%',
                borderBottom:`1px solid ${theme.palette.divider}`,
                p:below600?0: 2,
                display: "flex",
                alignItems: "center",
                flex: "1 1 100%",
                
            }}>
                {/* <Typography sx={{ display: open ? "block" : "none" }}>
                    Home
                </Typography> */}
                <Box sx={{ display: open ? "block" : "none" }}>

                        
                            
                                            
                                <Box marginBottom={1}>
                                    <DarkModeSwitch />  
                                </Box>
                                 
                        
                        

                </Box>
            </Box>
            <Box sx={{display:"flex", flexDirection:"column", height:"100%"}}>
                 
                                   
                <Box component="button" sx={{border:"none",textAlign:"left", p:0,m:0, cursor:"pointer", 
                    backgroundColor:isDarkMode?theme.palette.primary.dark:theme.palette.primary.contrastText}} 
                    onClick={()=>{showForm('login')}}>
                    <Typography
                     sx={{
                        ":hover":{backgroundColor:isDarkMode?theme.palette.primary.main:theme.palette.primary.light,},
                        fontFamily:"serif",
                        color:isDarkMode?"white":"auto",
                        p:1,
                        m:0
                        }} 
                    >Login</Typography>
                </Box>
                 <Box component="button" sx={{border:"none",textAlign:"left",m:0,p:0, cursor:"pointer", 
                    backgroundColor:isDarkMode?theme.palette.primary.dark:theme.palette.primary.contrastText}} onClick={()=>{showForm('register')}}>
                    <Typography sx={{
                        ":hover":{backgroundColor:isDarkMode?theme.palette.primary.main:theme.palette.primary.light,},
                        fontFamily:"serif",
                        color:isDarkMode?"white":"auto",
                        p:1,
                        m:0
                        }} >Register</Typography>
                </Box>
                 {/* <Box component="button" onClick={showRegFormIn}>
                    <Typography variant="h6">Register</Typography>
                </Box> */}
                
                
                <Box flexGrow={1}></Box>
                <Box sx={{borderTop:`1px solid ${theme.palette.divider}`, m:1,p:2}}>

                    <Link style={{textDecoration:"none", color:"inherit"}} to="/login"></Link><MenuItem>Terms and Condition</MenuItem>
                </Box>
                

                
                
                
            </Box>

            
        </>
    )

}

export default SideMenuHome
