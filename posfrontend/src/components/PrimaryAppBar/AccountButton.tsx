import { AccountCircle } from "@mui/icons-material";

import { Box, IconButton, Menu, MenuItem, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";

import React, { useState } from "react";
import DarkModeSwitch from "./DarkModeSwitch";
import useAxiosWithInterceptor from "../../helper/jwtinterceptor";
import { useAuthServiceContext } from "../../context/AuthContext";

interface accountProps {
    showForm: (input:string) => void;
    handleFormClickOnBigScreen: (value:string) => void;
}

    const menuPages = ["Home","Product", "About","Blog"]
const AccountButton = ({handleFormClickOnBigScreen, showForm}:accountProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const jwtAxios = useAxiosWithInterceptor();
    const location = useLocation();
    const isMenuOpen = Boolean(anchorEl);
    const below750 = useMediaQuery("(max-width : 750px)")
    const below400 = useMediaQuery("(max-width : 400px)")
    const above1200 = useMediaQuery("(max-width : 1200px)")
    const theme = useTheme()
    const isDarkMode = theme.palette.mode === "dark";
    const isOnHome = location.pathname === "/login"
    const isOnHomeR = location.pathname === "/register"
    console.log("is below 750", below750 , isOnHome, isOnHomeR)
    const navigate = useNavigate()
    const {logout , isLoggedIn}=useAuthServiceContext();
    console.log(above1200, "islogged" ,isLoggedIn)
    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };


    const renderMenu = (
        <>
         <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            open={isMenuOpen}
            keepMounted
            onClose={handleMenuClose}

        >

                {isLoggedIn? 
                    (
                    <>
                        <Link style={{textDecoration:"none", color:"inherit"}} to='/profile' ><MenuItem  >Profile</MenuItem></Link>
                        <Link style={{textDecoration:"none", color:"inherit"}} to="/settings"><MenuItem>Settings</MenuItem></Link>
                        <Link style={{textDecoration:"none", color:"inherit"}} to="/settings"><MenuItem>User guide</MenuItem></Link>
                        <MenuItem 
                        onClick={async ()=>{ await logout()}}
                        >Logout</MenuItem>
                    </>
                    ) :
                    (
                        !above1200?(
                            <>
                                <MenuItem   onClick={()=>{handleFormClickOnBigScreen("login")}} >Login</MenuItem>
                                <MenuItem onClick={()=>{handleFormClickOnBigScreen("register")}} >Register</MenuItem>
                                <Link style={{textDecoration:"none", color:"inherit"}} to="/login"></Link><MenuItem>Terms and Condition</MenuItem>

                            </>
                        ):
                        (
                            <>
                                <Box display="block" component="button" sx={{width:"100%",border:"none",textAlign:"left", p:0,m:0, cursor:"pointer", backgroundColor:isDarkMode?theme.palette.primary.dark:theme.palette.primary.contrastText}} 
                                onClick={()=>{showForm("login")}}>
                                                <Typography
                                                 sx={{
                                                    ":hover":{backgroundColor:isDarkMode?theme.palette.primary.main:theme.palette.primary.light,},
                                                    fontFamily:"serif",
                                                    color:isDarkMode?"white":"auto",
                                                    p:1,
                                                    m:0
                                                    }} 
                                                >
                                                    Login
                                                </Typography>
                                </Box>
                                <Box display="block"  component="button" sx={{width:"100%",border:"none",textAlign:"left", p:0,m:0, cursor:"pointer", 
                                    backgroundColor:isDarkMode?theme.palette.primary.dark:theme.palette.primary.contrastText}} 
                                    onClick={()=>{showForm("register")}}>
                                                <Typography
                                                 sx={{
                                                    ":hover":{backgroundColor:isDarkMode?theme.palette.primary.main:theme.palette.primary.light,},
                                                    fontFamily:"serif",
                                                    display:"block",
                                                    color:isDarkMode?"white":"auto",
                                                    width:"100%",
                                                    p:1,
                                                    m:0
                                                    }} 
                                                >
                                                    Register
                                                </Typography>
                                </Box>
                                <Box  display="block" component="button" sx={{width:"100%",border:"none",textAlign:"left", p:0,m:0, cursor:"pointer", 
                                    backgroundColor:isDarkMode?theme.palette.primary.dark:theme.palette.primary.contrastText}} 
                                    onClick={showForm}>
                                                <Typography
                                                 sx={{
                                                    ":hover":{backgroundColor:isDarkMode?theme.palette.primary.main:theme.palette.primary.light,},
                                                    fontFamily:"serif",
                                                    color:isDarkMode?"white":"auto",
                                                    width:"100%",
                                                    p:1,
                                                    m:0
                                                    }} 
                                                >
                                                    Terms and Condition
                                                </Typography>
                                </Box>
                            </>
                           
                        )
                            

                        
                    
                    )
                
                }
                
                
            
        </Menu>
        
        </>
       
    );
    const renderMenuOnHome = (
        <>
         <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            open={isMenuOpen}
            keepMounted
            onClose={handleMenuClose}

        >

                <MenuItem 
                onClick={async ()=>{ await logout()}}
                >Logout</MenuItem>
                
            
        </Menu>
        
        </>
       
    );
    return (
        <>
            <Box  sx={{display:"flex" , justifyContent:"space-between"}}>
                {(isOnHome || isOnHomeR) &&(
                    <Box sx={{display:"flex",justifyContent:below750?"space-between":"flex-start", flexGrow:1,}}>
                        {menuPages.map((item, index)=>{
                            return(
                            <Box 
                                sx={{border:"none",
                                cursor:"pointer",textTransform:"uppercase", 
                                m:below400?0:1, p:0.5, backgroundColor:"inherit"}} 
                                component="button" key={index}>
                                    <Typography sx={{fontFamily:"sans-serif",fontSize:below400?"0.9rem":"auto", fontWeight:500, color:theme.palette.primary.dark}}>{item} </Typography>
                            </Box>)
                        })}
                    </Box>
                )}

                {isOnHome || isOnHomeR &&  <Box sx={{flexGrow:1}}></Box>}
                
                
                     <Box sx={{display:isOnHome && below750 ? "none":"block"}} marginBottom={1}>
                    <DarkModeSwitch />  
                </Box>
     
                
                

                    <Box   sx={{mt:1, display:isOnHome && below750 ?"none":"block"}}>
                    <IconButton
                        
                        edge="end"
                        color="inherit"
                        onClick={handleProfileMenuOpen}

                    >
                        <AccountCircle />
                    </IconButton>
                        {renderMenu}

                </Box>
                

                
            </Box>
           
        
        </>
       

    )
}

export default AccountButton;