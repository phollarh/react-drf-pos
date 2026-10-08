import { Box, CssBaseline, useMediaQuery, useTheme } from "@mui/material";
import PrimaryAppBarHome from "./PrimaryAppBarHome";
import {  useState } from "react";
import React from "react";

import ForgotPasswordForm from "../account/resetpassword/ForgotPassword";


const ForgotPasswordTemplate = () => {
  const theme = useTheme()
  const below1200 = useMediaQuery("(max-width : 1200px)");
  const [sideMenu, SetsideMenu] = React.useState(false);
  const [showFormDetails, setShowFormDetails] = React.useState(false)
  const [showFormDetailRegister, setShowFormDetailRegister] = React.useState(false)
  const [, setClickedOption] =useState<string|null|undefined>(null)


  const showForm = (input:string | undefined | null) =>{
    if(input === null || undefined) return;
    setClickedOption(null);

    if(input === "register"){
      
      setClickedOption(input)
      setShowFormDetailRegister(!showFormDetailRegister)
    }
    if(input === 'login'){
      setClickedOption(input)
      setShowFormDetails(!showFormDetails)
    }

  }
  
  return(
    <>
      <Box sx={{position:"relative",
        display:below1200?"block":"flex",
        width: "100%",
        height: "100vh",
        overflow: "hidden",}}>
        <CssBaseline/>
        <PrimaryAppBarHome
        handleFormClickOnBigScreen={()=>{return}}
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
               
               
                        <ForgotPasswordForm/>
            </Box>
            
      
        </Box>
            
        
      
           
        
      </Box>
    </>
  );
};

export default ForgotPasswordTemplate;
