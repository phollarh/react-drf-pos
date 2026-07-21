import {Box, CssBaseline, SelectChangeEvent, useMediaQuery, useTheme} from "@mui/material"
import PrimaryAppBar from "./templates/PrimaryAppBar";
import PrimaryDraw from "./templates/PrimaryDraw";
import SideMenu from "../components/PrimaryDraw/SideMenu";

import SecondaryDraw from "./templates/SecondaryDraw";
import MainSettings from "./templates/MainSettings";
import SettingSecondary from "../components/Main/settingsPage/SettingSecondary";
import SettingsMain from "../components/Main/settingsPage/SettingsMain";
import Main from "./templates/Main";
import React, { useEffect, useState } from "react";
import useAxiosWithInterceptor from "../helper/jwtinterceptor";
import axios from "axios";
import { OutletNstaffService } from "../services/OutletNStaffService";
import { UseoutletNstaffContext } from "../context/OutletNStaffsContext";
import { outletsDataProps, outletStaffDataProps } from "../@types/outletsNstaff-service";


interface dataProps{
    id:string;
    name:string;
    Facebook:string;
    Instagram:string;
    address:string;
    city:string;
    email_address:string;
    outlogo?:string
}
interface outletDataProps{
    Employee_id:string;
    name:string;
    outlet:string;
    email:string;
    address:string;
    status:string;
    phone_number:string;
    image:string;
}

const Settings = () => {
  const theme=useTheme()
  const [drawerOpen, setDrawerOpen] = React.useState(true);
  const jwtAxios = useAxiosWithInterceptor()
  const below1000 = useMediaQuery("(max-width : 1000px)")
  const isBelow750 = useMediaQuery("(max-width : 750px)")
  const isDarkMode = theme.palette.mode === "dark"
  const [isMainHidden, setisMainHidden] = useState(true)
  React.useEffect(() => {
                const handleDrawerToggle = (e: Event) => {
                const customEvent = e as CustomEvent;
                  console.log(customEvent)
                setDrawerOpen(customEvent.detail);
                };
                window.addEventListener("drawer-toggle", handleDrawerToggle);
                return () => window.removeEventListener("drawer-toggle", handleDrawerToggle);
    }, []);
    // const [selectedOulet, setSelectedOutlet] = React.useState("")
    // const [outletSelection, setOutletSelection]  = React.useState<dataProps|{}>({})
    const [outlet, setOutlet]  = React.useState<dataProps | null>(null)
    // const [staffStatus, setStaffStatus]  = React.useState({})
    const [outletStaff, setStaff]  = React.useState<outletDataProps | null >(null)
    const [outletId, setOutletId] = React.useState('')
    // const [selectedEmployeeId, SetselectedEmployeeId] = React.useState('')
    const [mode, setMode] = React.useState<"update"|"create" >()
    const[createOutletObject, setCreateOutletObject]=React.useState(false)

    const [displayOutletForm, setDisplayOutletForm] = React.useState(false)
    const [dispalyStaffForm, setDispalyStaffForm] = React.useState(false)
    const [displayMain, setDisplayMain] = React.useState(false)
    const {outletsData, getOutlets,staffStatus,createOutlet,getOutletStaff ,getStaffStatus,setStaffStatus, staffData,
    setEmployeeId, employeeId} = UseoutletNstaffContext();
    console.log(outletsData, staffData)
 

  
    const handleCreate =()=>{
      setDisplayOutletForm(true)
      console.log("clicked")
    }
    useEffect(()=>{
      if(!isBelow750){
        setisMainHidden(true)
        return
      }
      if(isMainHidden === false){
        setDispalyStaffForm(false)
        setOutletId("")
        setEmployeeId("")
        // setDisplayMain(false)
      }
    },[isMainHidden, isBelow750])
    
      const handleOutletCreated = (outlet: dataProps) => {
        if(isBelow750){
          setisMainHidden(false)
        }
        setMode(undefined)
          setOutlet(outlet);
          setOutletId(outlet.id);

          setStaffStatus(undefined);
          setStaff(null);
          setDispalyStaffForm(false);

          setDisplayMain(true);
          setDisplayOutletForm(true);
      };
      const handleStaffCreated = (outletStaff:outletDataProps) => {
         if(isBelow750){
          setisMainHidden(false)
        }
            setOutletId("")
            getOutletStaff()
            setMode('update')
            setCreateOutletObject(false)
            setOutlet(null)
            setDisplayOutletForm(false)
            setStaff(outletStaff)
            console.log(outletStaff.Employee_id)
            setEmployeeId(outletStaff.Employee_id)
            setDisplayMain(true)
            setDispalyStaffForm(true)
      };

      const handleOutletClick = (event: SelectChangeEvent)=>{
         if(isBelow750){
          setisMainHidden(false)
        }
        if(event.target.value === "create"){
                  setEmployeeId("")
                  setStaffStatus(undefined)
                  setStaff(null)
                  setDispalyStaffForm(false)
                   setOutlet(null)
                   setMode(undefined)
                   setOutletId("")
                   setDisplayMain(true)
                   setDisplayOutletForm(true)
                   setCreateOutletObject(true)
                   return;
          // handleCreate();
        }
        const found = outletsData.find(item=>item.id === event.target.value)

            
                 if(found) {
                  setEmployeeId("")
                  setMode(undefined)
                  setCreateOutletObject(false)
                  setStaffStatus(undefined)
                  setStaff(null)
                  setDispalyStaffForm(false)
                   setOutlet(found)
                   setOutletId(found.id)
                   setDisplayMain(true)
                   setDisplayOutletForm(true)
                   
                 }
      }
      const handleOutletStaffClick = async (event: SelectChangeEvent)=>{
         if(isBelow750){
          setisMainHidden(false)
        }
         if(event.target.value === "create"){
                  setOutletId("")
                  setStaffStatus(undefined)
                  setStaff(null)
                  setDispalyStaffForm(true)
                   setOutlet(null)
                   setMode(event.target.value)
                   setEmployeeId(event.target.value )
                   setDisplayMain(true)
                   setDisplayOutletForm(false)
                   setCreateOutletObject(false)
                   return;
          
        }
              
        const found = staffData.find((item)=> item.Employee_id === event.target.value)
              
        if(found) {
          setOutletId("")
            setMode('update')
            setCreateOutletObject(false)
            setOutlet(null)
            setDisplayOutletForm(false)
            setStaff(found)
            setEmployeeId(found.Employee_id)
            setDisplayMain(true)
            setDispalyStaffForm(true)
            
          }
        
      }

      
  return(
    <>
    
        <CssBaseline/>
        <PrimaryAppBar/>
        {!below1000 &&
        <PrimaryDraw>
            <SideMenu open={false} />
        </PrimaryDraw>
        }
        
      <Box 
        sx={{
            backgroundColor:isDarkMode? "none" : theme.palette.primary.light,
            ml:below1000?"0px": drawerOpen?`${theme.primaryDraw.width}px`:`${theme.primaryDraw.closed}px`, 
            position:"relative",
            display:isBelow750?"block": "flex"
            }}>
        <Box>
          
        </Box>
        <SecondaryDraw>
            <SettingSecondary
            isMainHidden={isMainHidden}
            
            outlets={{
              handleCreate:handleCreate,
               outletsData:outletsData,
               handleClick : handleOutletClick,
               outletId : outletId
            }}
            outletStaff={{
              outletStaffData:staffData,
              selectedEmployeeId:employeeId,
              handleOutletStaffClick:handleOutletStaffClick
            }}
            />
        </SecondaryDraw>
        <Box sx={{position:isBelow750 && !isMainHidden ?"absolute":"auto",top:-90, width:"100%",backgroundColor:isDarkMode? "none" : theme.palette.primary.light,display:isBelow750 && isMainHidden?"none" :displayMain === false ?"none" : "block", flexGrow:3}}>
            <Main>
              <SettingsMain 
              setMode={setMode}
              isMainHidden={isMainHidden}
              setisMainHidden={setisMainHidden}
              getStaffStatus={getStaffStatus}
              handleStaffCreated={handleStaffCreated}
              mode={mode}
              setCreateOutletObject={setCreateOutletObject}
              handleOutletCreated ={handleOutletCreated }
               getOutlets={getOutlets}
              createOutletObject={createOutletObject}
                staffStatus={staffStatus}
                setStaff={setStaff} 

                displayOutletForm={displayOutletForm}  
                displayStaffForm={dispalyStaffForm}  
                outlets={outletsData} 
                outletStaff={outletStaff} 
                setSelectedOutletObject={setOutlet}
                selectedOutletObject={outlet}/>
            </Main>
        </Box>
        
    </Box>
    </>
  );
};

export default Settings;
