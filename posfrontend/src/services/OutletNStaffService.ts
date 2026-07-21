import React from "react"
import useAxiosWithInterceptor from "../helper/jwtinterceptor"
import { outletsDataProps, outletStaffDataProps } from "../@types/outletsNstaff-service"
import Cookies from "js-cookie";
interface staffStatusProps{
    is_active:boolean;
    session_id : string;
    log_in_time:string;
    last_logIn_time:string
}

export const OutletNstaffService = () =>{
    const jwtAxios = useAxiosWithInterceptor()
    const [outletsData, setOutletsData] = React.useState<outletsDataProps[]>([])
    const[staffData, setStaffData]=React.useState<outletStaffDataProps[]>([])
    const [staffStatus, setStaffStatus]  = React.useState<staffStatusProps | undefined>(undefined)
    const[employeeId, setEmployeeId] = React.useState<string>("")
    const [filterOption, setFilterOption] = React.useState<string>(() => localStorage.getItem("outlet_id") || "" );
    
        const createOutlet =async (
                 name: string,
                email_address: string,
                city: string,
                address: string,
                Facebook: string,
                Instagram: string,
                outlet_description: string
                        )=>{


            const payLoad = {
                  "name": name,
                    "email_address": email_address,
                    "city": city,
                    "address": address,
                    "Facebook": Facebook,
                    "Instagram": Instagram,
                    "outlet_description": outlet_description
            }
          try{
               const response= await jwtAxios.post('http://127.0.0.1:8000/accounts/api/outlets/', 
                payLoad,
                {withCredentials:true})
    
          
               return response.data
          }catch(err:any){
              console.log(err)
          }
        }


        const getOutlets =async ()=>{
          try{
               const response= await jwtAxios.get('http://127.0.0.1:8000/accounts/api/outlets/', {withCredentials:true})
               setOutletsData(response.data)
          
               return response.data
          }catch(err:any){
              console.log(err)
          }
        }
        React.useEffect(()=>{
            getOutlets()
        },[])
//
//get staffs details
         const getOutletStaff =async ()=>{
          try{
               const response= await jwtAxios.get(`http://127.0.0.1:8000/accounts/api/outletstaffs/?outlet_id=${localStorage.getItem("outlet_id")}`, {withCredentials:true})
               setStaffData(response.data)
          
               return response.data
          }catch(err:any){
              console.log(err)
          }
      }
      React.useEffect(()=>{ 
            getOutletStaff()
      },[localStorage.getItem("outlet_id"),Cookies.get("assigned_staff")])
//get staff individual staff-status 
        const getStaffStatus = async (found:string)=>{
         try{
          const response = await jwtAxios.get(`http://127.0.0.1:8000/accounts/api/staffs-login/staff-active-status`,
                            {
                              params:{"staff_id":found},
                              withCredentials:true
                            }                  
                          )
                          setStaffStatus(response.data)
            
                         
                          // console.log(response.data)
                          
                        return (response.data)
                       }catch(err:any){
                            if(err.response?.data){
                        // setErrorHandling(error.response.data.non_field_errors[0])
                        console.log(err.response?.data?.non_field_errors[0])
                        }
                      }
      }
      React.useEffect(()=>{
        if(employeeId === "create"){
            return;
        }
        if(employeeId){
            getStaffStatus(employeeId)
        }
        
      },[employeeId])

//Log staff out 
        const LogStaffOut = async (pin:string,employeeId:string,Id:string)=>{

            const payLoad ={
                "typedPin":pin,
                "Employee_id":employeeId
                }
             try{
                    const response = await jwtAxios.patch(`http://127.0.0.1:8000/accounts/api/staffs-login/${Id}/`, payLoad,
                        {withCredentials:true}
                    )
                        if(response.status === 200){
                           
                            await getStaffStatus(employeeId)
                            
                            console.log(response.data)


                        }
                        console.log(response)
                        return response
            }catch(error:any){
            //   setIsLoading(false)
            //     setErrorHandling("")
                if(error.response?.data){
                    console.log(error.response?.data)
                    
                  return(error.response.data.non_field_errors[0])
                }
            }
      }

  
      return {getOutlets,getOutletStaff, outletsData,staffData,createOutlet , staffStatus,employeeId,getStaffStatus, setEmployeeId,setStaffStatus ,LogStaffOut,filterOption,setFilterOption}

}