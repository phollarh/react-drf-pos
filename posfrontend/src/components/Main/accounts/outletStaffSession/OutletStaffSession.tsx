import { AppBar, Box, Toolbar, Typography, useTheme } from "@mui/material";

 import { UseoutletNstaffContext } from "../../../../context/OutletNStaffsContext"
import UploadAvatars from "../../settingsPage/UploadAvater";

import React, { useEffect } from "react";
import { outletStaffDataProps } from "../../../../@types/outletsNstaff-service";
import ControlledSwitches from "../../settingsPage/LogControllSwitches";

interface productType{
    id?:number;
    outlet:string;
    user?:number;
    product_name:string;
    sold_in:string;
    cost_price: number;
    selling_price:number;
    stock_inventory:number;
    category:string

}
interface orderType  {
    id:number;
    product:productType;
    quantity:number;
    description?:string
    date:string;
    paid:boolean;
    sub_total:number

}
interface ServerReceipt {
    id: number;
    hold:boolean;
    orders: orderType[];
    remarks?: string;
    date?: string;
    issued?:boolean;
    total?:number
    
}

interface SessionProps {
    fetchReceipt: () => Promise<void>;
    setDataCRUDReceipt?: React.Dispatch<React.SetStateAction<ServerReceipt[]>>
    staffData: outletStaffDataProps[]
    setAssignedStaff: React.Dispatch<React.SetStateAction<outletStaffDataProps | null>>;
    assignedStaff:outletStaffDataProps | null;
    setAssignMess: React.Dispatch<React.SetStateAction<string | null>>
    assignMess :string | null;
}
 
 export default function OutletStaffSession({setDataCRUDReceipt,fetchReceipt,staffData, assignMess,setAssignMess,setAssignedStaff,assignedStaff}:SessionProps) {
        console.log(assignedStaff)
        const theme = useTheme()
        const {staffStatus} = UseoutletNstaffContext()
    React.useEffect(()=>{
        if(!assignedStaff ){
            setDataCRUDReceipt?.([])
        }
        
    },[assignedStaff])
    return(
            <>
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
                                            position:"relative",
                                            minHeight: theme.primaryAppBar.height,
                                            height: theme.primaryAppBar.height,
                                            display: "flex",
                                            justifyContent:"space-between",
                                            alignItems: "center"
                                        }}>
                                            {assignMess &&
                                            <Box sx={{ position :"absolute", top:0,p:1, backgroundColor:"red", width:"100%", opacity:0.5}}>
                                                 <Typography sx={{p:1}} color="white" component="span">
                                                {assignMess}
                                                </Typography>
                                            </Box>
                                                
                                            }
                                            
                                            
                                             <Typography component="span">
                                                Welcome Attending Staff  <Typography component="span" sx={{fontWeight:600, p:1}}> {assignedStaff?.name.toUpperCase()}</Typography>
                                            </Typography>
                                            
                                   
                                    {/* <Typography component="div" >
                                        <UploadAvatars outletStaffSelection={outletStaff}/>
                                    </Typography> */}
                                    <Typography component="div">
                                        
                                        <ControlledSwitches fetchReceipt={fetchReceipt} setAssignMess={setAssignMess} outlet={null} setAssignedStaff={setAssignedStaff} outletStaff={assignedStaff} staffStatus={staffStatus} Employee_id={undefined}/>
                                    </Typography>
                                    
                                    
                                    </Toolbar>
    
                                    
                                    
                                </AppBar>
            </>

           )
 }
 