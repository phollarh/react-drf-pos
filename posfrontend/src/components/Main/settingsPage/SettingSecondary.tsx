import {
    Box,
    Typography,
    useTheme,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    SelectChangeEvent,
    Divider,
    useMediaQuery,
} from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import { outletsDataProps, outletStaffDataProps } from "../../../@types/outletsNstaff-service";
import PrinterSettings from "./PrinterSettings";



interface settingsProps{
    isMainHidden:boolean;
    
    outlets:{
        outletsData:outletsDataProps[];
        outletId:string;
        handleClick:(event: SelectChangeEvent)=>void;
        handleCreate:()=>void;
    };
    outletStaff:{
         outletStaffData:outletStaffDataProps[];
        selectedEmployeeId:string| undefined;
        handleOutletStaffClick:(event: SelectChangeEvent)=>void;
    }
   
}

const SettingSecondary = (
    {
        isMainHidden,
        
        outlets:{outletsData ,handleClick,outletId},
        outletStaff:{outletStaffData,selectedEmployeeId,handleOutletStaffClick}
    }:settingsProps) => {
    const isBelow750 = useMediaQuery("(max-width: 750px)")   
    const theme = useTheme();
    console.log(isMainHidden)

    return (
        <>
            <Box   

                sx={{
                    display:isMainHidden ===false ?"none":"block",
                    m:0,
                    p:0,
                    height: `calc(100vh - ${theme.primaryAppBar.height}px)`,
                    overflow: "hidden",
                    maxWidth:isBelow750?undefined:theme.SecondaryDraw.width
                }}>
                <Box 
                sx={{height:theme.primaryAppBar.height, p:0, borderBottom:`1px solid ${theme.palette.divider}` }}
                >
                    <Box   sx={{display:"flex",m:0, justifyContent:"center"}}>
                        <Box sx={{p:1}}><SettingsIcon sx={{p:0,mt:0,color:"greenyellow", marginRight: "6px", fontSize: "30px" }}/><SettingsIcon sx={{p:0,mt:0,color:"greenyellow", marginRight: "6px", fontSize: "20px" }}/>
                    </Box>
                        
                    <Box sx={{justifyContent:"center",m:0,pl:0,pt:1}}>
                        <Typography sx={{ml:0,mb:2,fontFamily:"sans-serif"}} variant="h4">
                            Settings
                        </Typography>
                    </Box>    
                  
                </Box>
                    
                </Box>
                <Box>
                    <Box sx={{mt:4, minHeight:"200px", width:isBelow750?"50%":undefined, display:"block", margin:"1px auto"}}>
                        <FormControl fullWidth sx={{ mt:7, fontFamily:"sans-serif", minWidth: 150 }} size="small">
                            <InputLabel id="demo-select-small-label">Outlets Selection</InputLabel>
                              <Select
                                labelId="demo-select-small-label"
                                id="demo-select-small"
                                value={outletId}
                                label="Payment Option"
                                onChange={handleClick}
                              >
                                

                                {outletsData.map((item)=>{
                                    return(<MenuItem key={item.id}  value={item.id}>{item.name}</MenuItem>)
                                })}
                                <Divider/>
                                <MenuItem value="create">
                                    Create Outlet
                                </MenuItem>
                              </Select>
                        </FormControl>
                    </Box>                   
                </Box>
                <Divider/>
                 <Box sx={{mt:4, minHeight:"100px", width:isBelow750?"50%":undefined, display:"block", margin:"1px auto"}}>
                        <FormControl fullWidth sx={{mt:7, fontFamily:"sans-serif", minWidth: 150 }} size="small">
                            <InputLabel id="demo-select-small-label">Staff Status</InputLabel>
                              <Select
                                labelId="demo-select-small-label"
                                id="demo-select-small"
                                value={selectedEmployeeId}
                                label="Outlet Staff Login"
                                onChange={handleOutletStaffClick}
                              >
                                <MenuItem value="">
                                  <em>None</em>
                                </MenuItem>
                                 {outletStaffData.map((item)=>{
                                    return(<MenuItem key={item.Employee_id}  value={item.Employee_id}>{item.username}</MenuItem>)
                                })}
                                <Divider/>
                                <MenuItem  value="create">
                                    Add Staff
                                </MenuItem>
                              </Select>
                        </FormControl>
                </Box>  
                <Divider sx={{mt:4}}/> 
                <PrinterSettings/>                
            </Box>
        </>      
    )

};

export default SettingSecondary