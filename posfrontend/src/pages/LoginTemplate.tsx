import { Box, CssBaseline, useMediaQuery } from "@mui/material";
import PrimaryAppBar from "./templates/PrimaryAppBar";
import PrimaryDraw from "./templates/PrimaryDraw";
import HomeTemp from "./templates/HomeTemp";
import SideMenu from "../components/PrimaryDraw/SideMenu";
import Login from "./Login";
import Main from "./templates/Main";
import SecondaryDraw from "./templates/SecondaryDraw";
import SecondaryDrawLog from "./templates/SecondaryDrawLog";
import WelcomePage from "./account/WelcomePage";
import MainLog from "./templates/MainLog";
import PrimaryAppBarHome from "./templates/PrimaryAppBarHome";
import { useEffect, useState } from "react";
import React from "react";
import Register from "./Register";
import ForgotPasswordForm from "./account/resetpassword/ForgotPassword";



const LoginTemplate = () => {
  const below1200 = useMediaQuery("(max-width : 1200px)");
  const below750 = useMediaQuery("(max-width : 750px)");
  const [closeForm, setCloseForm] =useState(false)
  const [sideMenu, SetsideMenu] = React.useState(false);
  const [showFormDetails, setShowFormDetails] = React.useState(false);
  const [showFormDetailRegister, setShowFormDetailRegister] = React.useState(false);
  const [clickedOption, setClickedOption] =useState<string|null|undefined>(null);
  const [showLFormOnBigScreen, setShowLFormOnBigScreen] = useState(true);
  const [showRFormOnBigScreen, setShowRFormOnBigScreen] = useState(false);
  const [resettPasswordForm, resetPasswordForm] = useState(false)
  const isOnRegister = location.pathname === '/register';
  const isOnLogin = location.pathname === '/login';

  const handleFormClickOnBigScreen = (value:string)=>{
    if(!value) return;
    if(value === 'login'){
      setShowRFormOnBigScreen(false)
      setShowLFormOnBigScreen(true)
    }
    if(value === "register"){
      setShowLFormOnBigScreen(false)
      setShowRFormOnBigScreen(true)
    }
    
  }
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
      setClickedOption(input)
       setShowFormDetails(false)
      setShowFormDetailRegister(!showFormDetailRegister)
      SetsideMenu(false);
    }
    if(input === 'login'){
      setClickedOption(input)
      setShowFormDetailRegister(false)
      setShowFormDetails(!showFormDetails)
      
      SetsideMenu(false);
    }
  

  }
  

 
  console.log(sideMenu)
  return(
    <>
      <Box sx={{position:"relative",
        display:below1200?"block":"flex",
        width: "100%",
        height: "100vh",
        overflow: "hidden",}}>
        <CssBaseline/>
        <PrimaryAppBarHome
        handleFormClickOnBigScreen={handleFormClickOnBigScreen}
        showForm={showForm}
         sideMenu={sideMenu} 
         SetsideMenu={SetsideMenu}  />
        
            <SecondaryDrawLog >
              <WelcomePage/>
            </SecondaryDrawLog>
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
            <MainLog showFormDetailRegister={showFormDetailRegister} showFormDetails={showFormDetails} handleCloseForm={showForm} clickedOption={clickedOption}>
   
                {!below1200 ?
                  (
                    <>
                      
                       <Box display={showLFormOnBigScreen?"block":"none"}>
                          <Login handleFormClickOnBigScreen={handleFormClickOnBigScreen} showFormDetails={showFormDetails}/>  
                        </Box>
                        <Box display={showRFormOnBigScreen?"block":"none"}>
                            <Register handleFormClickOnBigScreen={handleFormClickOnBigScreen} showFormDetailRegister={showFormDetailRegister}/>   
                        </Box>
                        
                    </>
                 
                ):
                (
                  <>
                    <Login showForm={showForm} handleFormClickOnBigScreen={handleFormClickOnBigScreen}  showFormDetails={showFormDetails}/>  
                    <Register  showForm={showForm} handleFormClickOnBigScreen={handleFormClickOnBigScreen} showFormDetailRegister={showFormDetailRegister}/>   
                  </>
                )
                }
                  
            </MainLog>
      
        
      
           
        
      </Box>
    </>
  );
};

export default LoginTemplate;
