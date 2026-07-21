import { Box, CssBaseline, Typography, useMediaQuery, useTheme } from "@mui/material";
import PrimaryAppBar from "./PrimaryAppBar";
import PrimaryDraw from "./PrimaryDraw";
import HomeTemp from "./HomeTemp";
import SideMenu from "../../components/PrimaryDraw/SideMenu";
import Login from "../Login";
import Main from "./Main";
import SecondaryDraw from "./SecondaryDraw";
import SecondaryDrawLog from "./SecondaryDrawLog";
import WelcomePage from "../account/WelcomePage";
import MainLog from "./MainLog";
import PrimaryAppBarHome from "./PrimaryAppBarHome";
import { useEffect, useState } from "react";
import React from "react";

import EmailConfirmation from "./EmailConfirmation";
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import ForgotPasswordForm from "../account/resetpassword/ForgotPassword";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: (theme.vars ?? theme).palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

const ForgotPasswordTemplate = () => {
  const theme = useTheme()
  const below1200 = useMediaQuery("(max-width : 1200px)");
  const below750 = useMediaQuery("(max-width : 750px)");
  const [closeForm, setCloseForm] =useState(false)
  const [sideMenu, SetsideMenu] = React.useState(false);
  const [showFormDetails, setShowFormDetails] = React.useState(false)
  const [showFormDetailRegister, setShowFormDetailRegister] = React.useState(false)
  const [clickedOption, setClickedOption] =useState<string|null|undefined>(null)
  const isOnRegister = location.pathname === '/register'
  const isOnLogin = location.pathname === '/login'

  // useEffect(()=>{
  //   if(!below1200 && isOnRegister === true){
  //     setShowFormDetailRegister(true)
  //   }
  //   if(!below1200 && isOnLogin === true){
  //     setShowFormDetails(true)
  //   }
    
  // },[below1200])

  const showForm = (input:string | undefined | null) =>{
    if(input === null || undefined) return;
    setClickedOption(null);

    if(input === "register"){
      console.log('caled....')
      setClickedOption(input)
      setShowFormDetailRegister(!showFormDetailRegister)
    }
    if(input === 'login'){
      setClickedOption(input)
      setShowFormDetails(!showFormDetails)
    }

  }
  

  const handleCloseForm = ()=>{
      const newValue = !closeForm
      setCloseForm(newValue)
      SetsideMenu(false);
  }
  // console.log(closeForm)
  return(
    <>
      <Box sx={{position:"relative",
        display:below1200?"block":"flex",
        width: "100%",
        height: "100vh",
        overflow: "hidden",}}>
        <CssBaseline/>
        <PrimaryAppBarHome
        showForm={showForm}
         sideMenu={sideMenu} 
         SetsideMenu={SetsideMenu} 
        //  handleCloseForm ={handleCloseForm} 
         />
        
            {/* <SecondaryDrawLog >
              <WelcomePage/>
            </SecondaryDrawLog> */}
        {/* <Box sx={{position:"relative"}}>
          <Box
           sx={{
                  height:"100vh",
                  border:"none",
                  position: "absolute",
                  cursor:"pointer",
                  inset: 0,
                  backgroundColor: "#aba1a180",
                  zIndex: 2000
                }}
          />
        </Box> */}
        <Box flexGrow={1} 
          sx={{
            marginTop:`${theme.primaryAppBar.height}px`, 
            overflow:"hidden",
            height:`calc(100vh - ${theme.primaryAppBar.height}px )`,
            backgroundColor:"green"}}>
            
                
            <Box>
               
               
                        <ForgotPasswordForm handleClose={()=>{return null}}/>
            </Box>
            
      
        </Box>
            
        
      
           
        
      </Box>
    </>
  );
};

export default ForgotPasswordTemplate;
