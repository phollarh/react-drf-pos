import { AppBar, Box,Toolbar,Tooltip,Typography, useMediaQuery, useTheme } from "@mui/material";
import OutletUpdateForm from "./OutletUpdateForm";
import OutletStaffUpdateForm from "./OutletStaffUpdateForm";
import ControlledSwitches from "./LogControllSwitches";
import React, { SetStateAction } from "react";
import UploadAvatars from "./UploadAvater";
import { outletsDataProps, outletStaffDataProps, staffStatusProps } from "../../../@types/outletsNstaff-service";
import { formatDistance } from "date-fns";
import CreateoutletForm from "./CreateoutletForm";
import OutletStaffCreateForm from "./OutletStaffCreateForm";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';




interface dataProps{
    isMainHidden:boolean;
    setisMainHidden: React.Dispatch<React.SetStateAction<boolean>>
    getStaffStatus: (found: string) => Promise<any>
    setMode: React.Dispatch<React.SetStateAction<"update" | "create" | undefined>>;
    mode:'create'|'update' | undefined;
    staffStatus:staffStatusProps | undefined;
    selectedOutletObject:outletsDataProps | null;
    outletStaff:outletStaffDataProps|null;
    outlets:outletsDataProps[] | [];
    displayOutletForm:boolean;
    displayStaffForm:boolean;
    createOutletObject:boolean;
    setEmployeeId: React.Dispatch<React.SetStateAction<string>>
    setCreateOutletObject:React.Dispatch<React.SetStateAction<boolean>>;
    handleOutletCreated: (outlet: outletsDataProps) => void;
    setSelectedOutletObject:React.Dispatch<React.SetStateAction<outletsDataProps | null>>
     getOutlets: () => Promise<any>;
     handleStaffCreated: (outletStaff:outletStaffDataProps) => void
    setStaff:React.Dispatch<SetStateAction<outletStaffDataProps | null>>
}

const SettingsMain = ({mode,setMode,getStaffStatus,handleStaffCreated,setisMainHidden,isMainHidden,
    handleOutletCreated,setCreateOutletObject,
    staffStatus,setSelectedOutletObject, getOutlets,selectedOutletObject,createOutletObject,outlets, outletStaff, setStaff}:dataProps) => {
    const theme = useTheme();
    const isBelow750 = useMediaQuery("(max-width : 750px)")
    return (
        <>
        <Box 
        sx={{
                flexFlow:1,
                m:0,
                p:0,
                // backgroundColor:"red",
                height: `calc(100vh - ${theme.primaryAppBar.height}px)`,
                overflow:"auto"

            }} >
                
                {(!isMainHidden && isBelow750) &&
                     <Box display="flex" sx={{mt:2,justifyContent:"flex-end"}}>
                        <Tooltip title="back" placement="top">
                    <Box 
                    sx={{
                        border:"none", backgroundColor:"transparent", 
                        borderRadius:"50%",
                        p:0.5,
                        cursor:"pointer",
                        ":hover":{backgroundColor:theme.palette.primary.main}}} component="button" onClick={()=>{setisMainHidden(!isMainHidden)}}>
                        <ArrowBackIosNewIcon/>
                    </Box>
                    </Tooltip>
                </Box>
                 }
                   
                
                
                
                

                <Box>
                    {outletStaff&&
                        <AppBar

                    sx={{
                        backgroundColor: theme.palette.background.default,
                        p:0,
                        m:0,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        position:"relative",
                        top:"0px"
                    }}
                    color="default"
                    elevation={0}
                >
                    <Toolbar variant="dense"
                        sx={{
                            minHeight: theme.primaryAppBar.height,
                            height: theme.primaryAppBar.height,
                            display: "flex",
                            justifyContent:"space-between",
                            alignItems: "center"
                        }}>
                            {outletStaff&&
                             <Typography component="span">
                        Welcome {outletStaff?.name.charAt(0).toLocaleUpperCase()}{outletStaff?.name.slice(1)}
                    </Typography>
                            }
                   
                    <Typography component="div" >
                        <UploadAvatars outletStaffSelection={outletStaff}/>
                    </Typography>
                    <Typography component="div">
                        <ControlledSwitches outlet={selectedOutletObject} outletStaff={outletStaff} staffStatus={staffStatus} Employee_id={outletStaff?.Employee_id}/>
                    </Typography>
                    
                    
                    </Toolbar>
                
                    {staffStatus?.is_active?
                    (
                        <Typography sx={{position:"absolute", fontFamily:"sans-serif",left:"60%",top:"2%",m:0, p:0, fontSize:"10px"}} >active since: {staffStatus&&formatDistance(new Date(staffStatus.log_in_time), new Date(), { addSuffix: true })};</Typography>
                    ):
                    (
                        <Typography sx={{position:"absolute",left:"60%",top:"2%",m:0, p:0, fontSize:"13px"}} component="span">last seen: {staffStatus&&formatDistance(new Date(staffStatus.last_logIn_time), new Date(), { addSuffix: true })};</Typography>
                    )
                    }
                    <Typography></Typography>
                    
                    
                    
                </AppBar>
                    }
                    {selectedOutletObject&&

                    <AppBar

                    sx={{
                        backgroundColor: theme.palette.background.default,
                        p:0,
                        m:0,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        position:"relative",
                        top:"0px"
                    }}
                    color="default"
                    elevation={0}
                >
                    <Toolbar variant="dense"
                        sx={{
                            minHeight: theme.primaryAppBar.height,
                            height: theme.primaryAppBar.height,
                            display: "flex",
                            justifyContent:"space-between",
                            alignItems: "center"
                        }}>
                    <Typography component="span">
                         {selectedOutletObject?.name.charAt(0).toLocaleUpperCase()}{selectedOutletObject?.name.slice(1)}
                    </Typography>
                    <Typography component="div" >
                        <UploadAvatars outletSelection={selectedOutletObject}/>
                    </Typography>
                    <Typography component="div">
                        <ControlledSwitches outlet={selectedOutletObject} outletStaff={outletStaff} staffStatus={staffStatus} Employee_id={outletStaff?.Employee_id}/>
                    </Typography>
                    
                    
                    </Toolbar>
                
                    <Typography></Typography>
                    
                    
                    
                </AppBar>
                    
                    }
                    
                </Box>
                {mode === "create" ?(
                     <Box>
                     <OutletStaffCreateForm getStaffStatus={getStaffStatus} mode={mode} handleStaffCreated={handleStaffCreated} setStaff={setStaff} outlets={outlets} data={outletStaff}/>
                    </Box>
                ): mode === "update"?(
                     <Box sx={{
                        display:staffStatus?.is_active===true ?"block":"none"
                        }}>
                     <OutletStaffUpdateForm setMode={setMode} getStaffStatus={getStaffStatus} mode={mode} handleStaffCreated={handleStaffCreated} setStaff={setStaff} outlets={outlets} data={outletStaff}/>
                    </Box>
                ):(
                    null
                )
                       
                }
                
                
                {selectedOutletObject&&
                    <Box>
                    <OutletUpdateForm setSelectedOutletObject={setSelectedOutletObject} getOutlets={getOutlets} data={selectedOutletObject}/>
                </Box >
                }
                {createOutletObject&&
                    <Box>
                    <CreateoutletForm setCreateOutletObject={setCreateOutletObject} handleOutletCreated={handleOutletCreated}  getOutlets={getOutlets}/>
                </Box >
                }
                
        </Box>
        </>
    )
}

export default SettingsMain;