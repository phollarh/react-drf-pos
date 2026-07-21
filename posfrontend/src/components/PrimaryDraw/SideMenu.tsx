import {
    Box,
    Typography,
    Button,
    Stack,
    useMediaQuery,
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



const sideMenu = [
 { label: 'Create Receipt',link:"create_receipt", icon: <ReceiptIcon /> },
  { label: 'Products',link:"products", icon: <ShoppingCartIcon /> },
//   { label: 'Sales', link:"sales",icon: <PointOfSaleIcon /> },
  
];

const otherSideMenu = [
    { label: 'Past Receipts',link:"/past_receipts", icon: <HistoryIcon /> },
    { label: 'Settings',link:"/settings" ,icon: <SettingsIcon /> },
  
    { label: 'About',link:"/about", icon: <InfoIcon /> },
    { label: 'User Guide',link:"/feedback", icon: <FeedbackIcon /> },
];



type Props = {
    open: boolean
}

// const sideMenu= ['Home', 'Products','Sales', 'Create Receipt' ]
// const otherSideMenu = ['Settings','Past Receipts', 'About', 'Feedback']


const SideMenu: React.FC<Props> = ({ open }: Props) => {
    const theme = useTheme()
    const below600 = useMediaQuery("(max-width:750px)")
    return (
        <>
            <Box sx={{
                maxHeight:below600?`80px`:`${theme.primaryAppBar.height}px`,
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

                        <Button
                            size={below600?"small":"large"}
                            variant="outlined"
                            color="inherit"
                            sx=
                                {{
                                    border:`3px solid ${theme.palette.divider}`,
                                    borderRadius:5, 
                                    textAlign: "center",
                                     padding:below600? 0.3: 1,
                                     boxShadow:`${theme.shadows[6]}`,
                                     mb:1
                                }}
                            fullWidth
                            >
                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.3}>
                                <LaptopWindowsIcon fontSize="small" sx={{fontSize:'20px'}}/>

                                <Stack>
                                <Typography variant={below600?"body2":"body1"} sx={{fontWeight:below600?400:700, fontFamily:'sans-serif'}} >FIRST BUKKOF POS</Typography>
                                </Stack>   
                            </Stack>
                        </Button>

                </Box>
            </Box>
            <Box>
                
                <SideMenuItems 
                    sideMenu={sideMenu}
                     otherSideMenu={otherSideMenu}
                     open={open}
                />
            </Box>

            
        </>
    )

}

export default SideMenu
