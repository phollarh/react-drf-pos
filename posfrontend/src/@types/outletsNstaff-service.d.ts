import React from "react";


export interface outletsDataProps{
    id:string;
    name:string;
    Facebook:string;
    Instagram:string;
    address:string;
    city:string;
    email_address:string;
    outlogo?:string
}

export interface outletStaffDataProps{
    Employee_id:string;
    name:string;
    outlet:string;
    username:string
    email:string;
    address:string;
    status:string;
    phone_number:string;
    image:string;
}
interface staffStatusProps{
    is_active:boolean;
    session_id : string;
    log_in_time:string;
    last_logIn_time:string
}
interface OutletNstaffsProps{
     getOutletStaff: () => Promise<any>;
    // createOutlet:outletsDataProps;
    createOutlet: (name: string, email_address: string, city: string, address: string, Facebook: string, Instagram: string, outlet_description: string) => Promise<any>;
    filterOption:string;
     getOutlets: () => Promise<any>;
    setFilterOption:React.Dispatch<React.SetStateAction<string>>;
    outletsData:outletsDataProps[];
    staffData:outletStaffDataProps[];
    staffStatus:staffStatusProps | undefined;
    // staffStatus: staffStatusProps | null;
    employeeId:string;
    setStaffStatus:React.Dispatch<React.SetStateAction<staffStatusProps | undefined>>
    setEmployeeId:React.Dispatch<React.SetStateAction<string>>
    LogStaffOut:(pin: string, employeeId: string, Id: string)=>Promise<any>;
    getStaffStatus:(found: string)=>Promise<any>
}
