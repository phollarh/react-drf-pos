import {
    Box,
    Typography,
    Button,
    Stack,
    useMediaQuery,
} from "@mui/material";
import Avatar from '@mui/material/Avatar';

import { useTheme } from "@mui/material/styles";

import LaptopWindowsIcon from '@mui/icons-material/LaptopWindows';
import SideMenuItems from "../SideMenuItems";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import InfoIcon from '@mui/icons-material/Info';
import FeedbackIcon from '@mui/icons-material/Feedback';
import React, { useEffect, useState } from "react";
import useAxiosWithInterceptor from "../../helper/jwtinterceptor";
import { BASE_URL_ACCOUNT } from "../../congif";
import { deepOrange } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";
import { UseoutletNstaffContext } from "../../context/OutletNStaffsContext";

interface ActiveSession {
    role: "admin" | "supervisor" | "staff";
    user_session_id: string;
    user_session_name: string;
    username?: string;
    avatar:string;
}

const sideMenu = [
 { label: 'Create Receipt',link:"sales_receipts", icon: <ReceiptIcon /> },
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
    const jwtAxios = useAxiosWithInterceptor();
    const {setEmployeeId, setStaffStatus}=UseoutletNstaffContext()
    const [activeSession, setActiveSession] =useState<ActiveSession | null>(null);
    const below600 = useMediaQuery("(max-width:750px)")
    const isDarkMode = theme.palette.mode === "dark"
    const navigate = useNavigate();
    const getSession = async ()=>  {
            try{
                const response = await jwtAxios.get(`${BASE_URL_ACCOUNT}/user/check_user_session/`,
                {withCredentials:true}
            )
            if(response.status === 200){
            
                setActiveSession(response.data)
            }
                console.log(response)
                
                return response.data
            }catch(err:any){
                console.log(err.response)
                
                throw err.response
            }
        
            
            }

    useEffect(()=>{
            
             getSession()
             
    
    },[])
   
        const handleEndSession = async ()=>{
        try{
            const response = await jwtAxios.post(`${BASE_URL_ACCOUNT}/user/end_user_session/`,{},
                {withCredentials:true}

            )
            console.log(response.data)
            if(response.status === 200){
                if(response.data.unassigned_staff_id){
                    setStaffStatus(undefined)
                    setEmployeeId("")
                    
                }
                
                navigate("/authorization")
            }
            return response.data
        }catch(err:any){
            console.log(err.response.data)
            throw err
        }
    }
        
      
    return (
        <Box
         sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
        }}>
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
                            onClick={()=>{
                                navigate("/")
                            }}
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
                                <LaptopWindowsIcon fontSize="small" sx={{fontSize:'15px'}}/>

                                <Stack>
                                <Typography variant={below600?"body2":"body1"} sx={{fontWeight:below600?300:500,fontSize:"15px !important", fontFamily:'sans-serif'}} >FIRST BUKKOF POS</Typography>
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
            <Box display={!activeSession? "none":"block"}
                        sx={{
                            height:90,
                            mt:"auto",
                            position:"sticky",
                            bottom:0,
                            backgroundColor:isDarkMode?"#403c3c":"#c51162",
                            // minHeight: theme.primaryAppBar.height,
                            // height: theme.primaryAppBar.height,
                            // display: "flex",
                            // justifyContent:"space-between",
                            
                        }}>
                   
                    <Box display="flex" justifyContent="end" sx={{mt:0.5}}>
                        <Box component="button" onClick={handleEndSession}
                        sx={{
                            color:theme.palette.primary.light,
                            ml:0.5,
                            backgroundColor:"transparent",
                            cursor:"pointer", 
                            border:"none", 
                            ":hover":{backgroundColor:theme.palette.primary.contrastText, color:theme.palette.primary.dark},
                            borderRadius:1,
                            p:0.5
                            }}>
                            end session
                        </Box>
                    </Box>
                    <Typography component="div" sx={{color:theme.palette.primary.light,justifyContent:"space-between", display:"flex", m:1}}>
                        <Typography sx={{mt:2}}>
                            active user : 
                        </Typography>
                         <Typography sx={{mt:2}}>
                            {activeSession?.role === "admin" ? "Admin": `${activeSession?.user_session_name}`}
                        </Typography>
                        <Typography component="div" sx={{mt:0.5}}>
                            {activeSession?.avatar ? 
                            (
                                 <Avatar sx={{
                                     width:"40px",
                                    height:"40px",
                                    bgcolor: deepOrange[500]
                                 }} alt="session avatar" src={activeSession.avatar}/>
                            ):
                            (
                                 <Avatar alt="session avatar"
                                 sx={{
                                     width:"40px",
                                    height:"40px",
                                    bgcolor: deepOrange[500]
                                 }} >
                                    {activeSession?.username?.charAt(0).toLocaleUpperCase()}
                                 </Avatar>
                            )
                            }
                           
                        </Typography>
                    
                    </Typography>     
                    
                    
                    
                    
                    </Box>

            
        </Box>
    )

}

export default SideMenu
