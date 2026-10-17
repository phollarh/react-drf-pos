import {
    Box,
    Typography,
    useMediaQuery,
    MenuItem,
} from "@mui/material";


import { useTheme } from "@mui/material/styles";
import React from "react";
import DarkModeSwitch from "../PrimaryAppBar/DarkModeSwitch";
import { Link } from "react-router-dom";
import { useAuthServiceContext } from "../../context/AuthContext";



type Props = {
    open: boolean;
    showForm: (input: string | null | undefined) => void;
}


const SideMenuHome: React.FC<Props> = ({showForm }: Props) => {
    const theme = useTheme()
    const below600 = useMediaQuery("(max-width:750px)")
    const isDarkMode = theme.palette.mode === "dark"
    const {isLoggedIn, logout} = useAuthServiceContext()
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
               
                {/* <Box sx={{ display: open ? "block" : "none" }}>

                        
                            
                                            
                                <Box marginBottom={1}>
                                    <DarkModeSwitch />  
                                </Box>
                                 
                        
                        

                </Box> */}
            </Box>
           
            <Box sx={{display:"flex", flexDirection:"column", height:"100%", minWidth:250}}>
                 
                 {!isLoggedIn ? 
                 (
                        <>
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
                        >Login
                    </Typography>
                </Box>
                 <Box component="button" sx={{border:"none",textAlign:"left",m:0,p:0, cursor:"pointer", 
                    backgroundColor:isDarkMode?theme.palette.primary.dark:theme.palette.primary.contrastText}} onClick={()=>{showForm('register')}}>
                    <Typography sx={{
                        ":hover":{backgroundColor:isDarkMode?theme.palette.primary.main:theme.palette.primary.light,},
                        fontFamily:"serif",
                        color:isDarkMode?"white":"auto",
                        p:1,
                        m:0
                        }} >Register
                    </Typography>
                </Box>

                        </>
                 ):
                 (
                    <>
                        <Link style={{textDecoration:"none", color:"inherit"}} to='/profile' ><MenuItem  >Profile</MenuItem></Link>
                        <Link style={{textDecoration:"none", color:"inherit"}} to="/settings"><MenuItem>Settings</MenuItem></Link>
                        <Link style={{textDecoration:"none", color:"inherit"}} to="/settings"><MenuItem>User guide</MenuItem></Link>
                        <MenuItem 
                            onClick={()=>{ logout()}}
                        >
                            Logout
                        </MenuItem>
                    </>
                 )
                }                  
                
                
                
                <Box flexGrow={1}></Box>
                <Box sx={{borderTop:`1px solid ${theme.palette.divider}`, m:1,p:2}}>
                    <Box display="flex" justifyContent="space-between" alignContent="center">
                        <Typography mt={2} component="span"> Mode Switch</Typography> 
                        <DarkModeSwitch />  
                    </Box>
                    
                </Box>
                

                
                
                
            </Box>

            
        </>
    )

}

export default SideMenuHome
