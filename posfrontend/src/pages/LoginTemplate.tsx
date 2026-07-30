import { Box, CssBaseline, useMediaQuery } from "@mui/material";
import Login from "./Login";
import SecondaryDrawLog from "./templates/SecondaryDrawLog";
import WelcomePage from "./account/WelcomePage";
import MainLog from "./templates/MainLog";
import PrimaryAppBarHome from "./templates/PrimaryAppBarHome";
import { useState } from "react";
import React from "react";
import Register from "./Register";



const LoginTemplate = () => {
  const below1200 = useMediaQuery("(max-width : 1200px)");
  const [sideMenu, SetsideMenu] = React.useState(false);
  const [showFormDetails, setShowFormDetails] = React.useState(false);
  const [showFormDetailRegister, setShowFormDetailRegister] = React.useState(false);
  const [clickedOption, setClickedOption] =useState<string|null|undefined>(null);
  const [showLFormOnBigScreen, setShowLFormOnBigScreen] = useState(true);
  const [showRFormOnBigScreen, setShowRFormOnBigScreen] = useState(false);


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
            <MainLog showFormDetailRegister={showFormDetailRegister} showFormDetails={showFormDetails} handleCloseForm={showForm} clickedOption={clickedOption}>
   
                {!below1200 ?
                  (
                    <>
                      
                       <Box display={showLFormOnBigScreen?"block":"none"}>
                          <Login handleFormClickOnBigScreen={handleFormClickOnBigScreen} showFormDetails={showFormDetails} showForm={function (_input: string | null | undefined): void {
                    throw new Error("Function not implemented.");
                  } }/>  
                        </Box>
                        <Box display={showRFormOnBigScreen?"block":"none"}>
                            <Register handleFormClickOnBigScreen={handleFormClickOnBigScreen} showFormDetailRegister={showFormDetailRegister} showForm={function (_input: string | null | undefined): void {
                    throw new Error("Function not implemented.");
                  } }/>   
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
