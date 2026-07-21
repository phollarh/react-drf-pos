import React from "react";
import { OutletNstaffsProps } from "../@types/outletsNstaff-service";
import { OutletNstaffService } from "../services/OutletNStaffService";

const OutletNstaffContext = React.createContext<OutletNstaffsProps|null>(null)


const OutletNstaffContextProvider = ({children}:React.PropsWithChildren)=>{
    const outletNstaff = OutletNstaffService();
    return(
         <OutletNstaffContext.Provider value={outletNstaff}>
             {children}
        </OutletNstaffContext.Provider>
    )
   
}

export const UseoutletNstaffContext = () : OutletNstaffsProps =>{
    const context =React.useContext(OutletNstaffContext) ;
    if(!context){
        throw new Error("Error - You have to use the outletNstaffContextProvider");
    }
    return context
}
export default OutletNstaffContextProvider