import React from "react"
import useAxiosWithInterceptor from "../helper/jwtinterceptor"
import { outletsDataProps, outletStaffDataProps } from "../@types/outletsNstaff-service"
import { useAuthServiceContext } from "../context/AuthContext";
import { BASE_URL_ACCOUNT } from "../congif";
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
    const {isLoggedIn,activeOutletId} = useAuthServiceContext()
    const outlet_id = localStorage.getItem("outlet_id") ?? String(activeOutletId)

    
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
               const response= await jwtAxios.post(`${BASE_URL_ACCOUNT}/outlets/`, 
                payLoad,
                {withCredentials:true})
    
          
               return response.data
          }catch(err:any){
              console.log(err.response)
              throw err.response
          }
        }


        const getOutlets =async ()=>{
          try{
               const response= await jwtAxios.get(`${BASE_URL_ACCOUNT}/outlets/`, {withCredentials:true})
               setOutletsData(response.data)
          
               return response.data
          }catch(err:any){
              console.log(err.response)
              throw err.response
          }
        }
        React.useEffect(()=>{
            if(!isLoggedIn){
                setOutletsData([])
                return;
            }
            getOutlets()
        },[isLoggedIn])
//
//get staffs details
         const getOutletStaff =async (outletId? : string)=>{
           let outlet_id = activeOutletId ?? ""
           if(outletId){
            outlet_id=outletId
           }
          try{
               const response= await jwtAxios.get(`${BASE_URL_ACCOUNT}/outletstaffs/?outlet_id=${outlet_id}`, {withCredentials:true})
               setStaffData(response.data)
               console.log(response.data)
               return response.data
          }catch(err:any){
            if( err.response.status === 403 && err.response.data?.error){
                setStaffData([])
            }
              
              throw err
          }
          
      }
      React.useEffect(()=>{ 
        if(!isLoggedIn || !outlet_id){
            setStaffData([])
            return;
        }
            getOutletStaff()
      },[outlet_id, isLoggedIn, activeOutletId])
//get staff individual staff-status 
        const getStaffStatus = async (found:string)=>{
         try{
          const response = await jwtAxios.get(`${BASE_URL_ACCOUNT}/staffs-login/staff-active-status`,
                            {
                              params:{"staff_id":found},
                              withCredentials:true
                            }                  
                          )
                          setStaffStatus(response.data)
            
                         
                          console.log(response.data)
                          
                        return (response.data)
                       }catch(err:any){
                        console.log(err.response)
                            if(err.response?.data){
                        // setErrorHandling(error.response.data.non_field_errors[0])
                            console.log(err.response?.data?.non_field_errors[0])
                            }
                            throw err.response
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
                    const response = await jwtAxios.patch(`${BASE_URL_ACCOUNT}/staffs-login/${Id}/`, payLoad,
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

  
      return {isLoggedIn,getOutlets,getOutletStaff, outletsData,staffData,createOutlet , staffStatus,employeeId,getStaffStatus, setEmployeeId,setStaffStatus ,LogStaffOut,filterOption,setFilterOption}

}