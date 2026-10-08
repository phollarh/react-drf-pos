import * as React from 'react';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import { Box, TextField } from '@mui/material';
import useAxiosWithInterceptor from '../../../helper/jwtinterceptor';
import ProgressSign from '../../Progress';
import { outletsDataProps, outletStaffDataProps, staffStatusProps } from '../../../@types/outletsNstaff-service';
import { UseoutletNstaffContext } from '../../../context/OutletNStaffsContext';
import { BASE_URL_ACCOUNT } from '../../../congif';
import { useAuthServiceContext } from '../../../context/AuthContext';



interface PinProp {
    Employee_id: string |undefined;
    outletStaff:outletStaffDataProps | null;
    setAssignedStaff?: React.Dispatch<React.SetStateAction<outletStaffDataProps | null>>
    outlet:outletsDataProps | null;
    staffStatus:staffStatusProps | undefined;
    filterOption:string;
    setFilterOption:React.Dispatch<React.SetStateAction<string>>;
    setAssignMess?: React.Dispatch<React.SetStateAction<string | null>>;
    fetchReceipt ?: () => Promise<void>;
    
}

export default function PinRequestPopOver({fetchReceipt,Employee_id,outletStaff,setAssignMess,setAssignedStaff,staffStatus,filterOption,setFilterOption, outlet}:PinProp) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [errorHandling, setErrorHandling] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [pinState, setPin] = React.useState("")
  const [username, setUsername] = React.useState<string|undefined >()
  const isOnSalesReceipt = location.pathname === "/sales_receipts"
  const isOnsettings = location.pathname === "/settings"
  const jwtAxios = useAxiosWithInterceptor()
  const {activeOutletId, isOutletActive,getInitialLoggedInValue} = useAuthServiceContext();
  const [outletId, setOutletId] = React.useState("")
  const {LogStaffOut,getStaffStatus,employeeId,setStaffStatus,staffData} = UseoutletNstaffContext();

  React.useEffect(()=>{
                    if(activeOutletId){
                        setOutletId(String(activeOutletId))
                        
                    }
                   
                            
        },[activeOutletId])
            

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    
  };

  const handleClose = () => {
    setErrorHandling(null)
    setAnchorEl(null);
  };

  React.useEffect(()=>{
    setUsername(outletStaff?.username)
  },[outletStaff])

  

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

    // React.useEffect(()=>{
    //   if(staffStatus?.is_active){
    //     setChecked(true)
    //     setLogStaffIn(true)
    //   }else{
    //     setChecked(false)
    //   }
    //   console.log(staffStatus, "i chnaged")
    // }, [staffStatus])
  const handleOutletStatus = async (event:React.FormEvent<HTMLFormElement>)=>{
      event.preventDefault();
     setErrorHandling(null)
     setIsLoading(true)
    const selectedOutletIsActive =isOutletActive && String(activeOutletId) === String(outlet?.id);

      const payLoad = {
                "desired_status":!selectedOutletIsActive,
                "outlet_pin":pinState,
                "outlet_id":outlet?.id
                }
      
    try{
      const response = await jwtAxios.post(`${BASE_URL_ACCOUNT}/verify_outlet/`,payLoad,{withCredentials:true} )
        if(response.status === 200 && response.data.is_active){

              setFilterOption(String(response.data.id))
                setPin("")
                
                
                // localStorage.setItem("outlet_id", `${response.data.id}`)
                // localStorage.setItem("outIsact", response.data.is_active)  
            }else{
                  setFilterOption("")
                  setPin("")
                
                  
            }
            handleClose()
            await getInitialLoggedInValue()
        return response.data

      }catch(err:any){
         if(err.response?.data){
              setErrorHandling(err.response.data.error)
            }
            setPin("")
            throw err.response
      }finally{
          setIsLoading(false)
      }
  }
  const handleStaffLogin = async (event:React.FormEvent<HTMLFormElement>)=>{
     event.preventDefault();
     setErrorHandling(null)
     setAssignMess?.(null)
     setIsLoading(true)
    
    if(isOnSalesReceipt){
      // const outlet_id = localStorage.getItem("outlet_id") || ""
        if(pinState  !== "" ){
              
              const payLoad = {
                  "pin":pinState,
                  "username":username,
                  "outlet_id":outletId
                  
                  }
                  console.log(payLoad)
              try{
            
            const response = await jwtAxios.post(`${BASE_URL_ACCOUNT}/staffs-login/assign_staff_session/`, payLoad,
                {withCredentials:true}
            )
            
                if(response.status === 200){
                  
                  const staff_status=await getStaffStatus(response.data.employee_id)

                  
                  if(staff_status?.is_active === true && response.data?.assigned_status === true){
                      
                      const assigned_staff : outletStaffDataProps | null  = staffData.find((item)=>String(response.data?.employee_id) === String(item.Employee_id)) ?? null
                      
                      setAssignedStaff?.(assigned_staff)
                      await fetchReceipt?.()

                    
                  }
                  
                  if(response.data?.assigned_status === false){
                      
                      const assigned_staff : outletStaffDataProps | null  = staffData.find((item)=>String(response.data?.employee_id) === String(item.Employee_id)) ?? null
                      console.log(assigned_staff)
                      setAssignedStaff?.(null)
                      
                      setStaffStatus(undefined)
                      await fetchReceipt?.()
                    
                  }

                     


                    handleClose()
                    setIsLoading(false)
                    setPin("")
                    
                }
                setIsLoading(false)
                return response.data
        }catch(error:any){
          
          setIsLoading(false)
            setPin("")
            if(error.response?.data){
              setPin("")
              setErrorHandling(error.response.data.error)
              
            }
        }
              
            
        
      }
      return;
    }
    //  if(outlet){
  

    //       if(pinState !== ""){
    //             const payLoad = {
    //             "active_status":localStorage.getItem("outIsact") || "",
    //             "outlet_pin":pinState,
    //             "outlet_id":outlet.id
    //             }
                
    //         try{
    //           if(!outlet.id){
    //             return !outlet.id
    //           }
    //           console.log('i handle outlet sign in')
              
    //           const reponse=await jwtAxios.post(`${BASE_URL_ACCOUNT}/verify_outlet/`,payLoad, 
    //             {withCredentials:true}
    //           )
              
    //           if(localStorage.getItem("outlet_id")===String(reponse.data.id) && reponse.status === 200 ){
    //             localStorage.removeItem("outlet_id")
    //             localStorage.setItem("outIsact", reponse.data.is_active)
    //             setFilterOption("")
    //             setPin("")
    //             handleClose()
    //             setIsLoading(false)
    //           }
    //          else{
    //             setFilterOption(reponse.data.id)
    //             setPin("")
    //             handleClose()
    //             setIsLoading(false)
    //             localStorage.setItem("outlet_id", `${reponse.data.id}`)
    //             localStorage.setItem("outIsact", reponse.data.is_active)
    //          }
    //         }catch(error:any){
    //           if(error.response?.data){
    //             setErrorHandling(error.response.data.error)
    //         }
    //         setIsLoading(false)
    //         setPin("")
    //         throw error
          
    //       }
        
    //  }
    if(!outlet){
        if(staffStatus?.is_active === true && employeeId !== ""){
        
          
           const response=await LogStaffOut(pinState,employeeId,staffStatus.session_id)
           console.log(response)
         if(response.status === 200){
            console.log('it worked')
            
            setPin("")
            handleClose()
            setIsLoading(false)
         }else{
            console.log(response)
            setIsLoading(false)
            setPin("")
            setErrorHandling(response)
         }
        
        

    }else{
        if(pinState){

          const payLoad = {
          "typedPin":pinState,
          "Employee_id":Employee_id
          }

          
  
        try{
            
            const response = await jwtAxios.post(`${BASE_URL_ACCOUNT}/staffs-login/`, payLoad,
                {withCredentials:true}
            )
            
                if(response.status === 201){
                  
                  await getStaffStatus(employeeId)
                    handleClose()
                    setIsLoading(false)
                    setPin("")
                    console.log(response.data)
                }
                setIsLoading(false)
                return response.data
        }catch(error:any){
          setIsLoading(false)
            setPin("")
            if(error.response?.data){
              setPin("")
              setErrorHandling(error.response.data.non_field_errors[0])
              console.log(error.response.data.non_field_errors[0])
            }
        }
      }
    }
    }
     
      
    }

    // console.log(outlet.id, filterOption)

    const outletChecked = outlet !== null && activeOutletId
    console.log(staffStatus?.assigned, staffStatus?.staff_id ,staffStatus)
    const derChecked=React.useMemo(()=>{
      let checked=false
      if(outletChecked){
        checked=String(activeOutletId) === String(outlet?.id)? true: false
        
      }else if(staffStatus && isOnSalesReceipt){
      
          checked=staffStatus?.assigned === true? true: false
      }else if (staffStatus && isOnsettings){
        checked=staffStatus?.is_active === true? true: false
      }
      return checked
    },[outlet?.id, staffData,filterOption,staffStatus?.assigned, staffStatus?.is_active, activeOutletId])
    
  return (
    <>
      {/* <Button aria-describedby={id} variant="contained" onClick={handleClick}> */}
        <Switch
        sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
            color: 'blue', 
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: 'blue', 
            },
        }}
        aria-describedby={id}
        onClick={handleClick}
        checked={derChecked}
         
        // onChange={handleChange}
        slotProps={{ input: { 'aria-label': 'controlled' } }}
        />
      {/* </Button> */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box onSubmit={outlet ? handleOutletStatus: handleStaffLogin}  display="flex" flexDirection="column" component="form" sx={{m:0.5,p:1, textAlign:"center"}}>
          {isOnSalesReceipt && 
            <TextField  
            maxRows={0.5}
            style={{width:120, marginBottom:isOnSalesReceipt? "0px":"35px",textAlign:"center"}} 
            size='small'               
                margin="normal"
                id="username"
                value={username === null ?"" : username}
                name="username"
                label="Username"
                type="text"
                onChange={(e)=>{
                  setErrorHandling(null)
                  setUsername(e.target.value)
                 }}
                error={!!errorHandling}           
                helperText={errorHandling}
                // value={(event:any)=>{event.target}}
                                    // value={formik.values.first_name}
                                    // onChange={formik.handleChange}
                                    // error={!!formik.touched.first_name && !!formik.errors.first_name}
                      // helperText={formik.touched.first_name && formik.errors.first_name}
            />
          }
          
            <TextField  
            required
             inputProps={{ maxLength: 4, inputMode: "numeric", pattern: "[0-9]*" }}
            onKeyDown={(e) => {
                if (!/[0-9]/.test(e.key) && e.key !== "Backspace") {
                e.preventDefault(); 
                }
            }}
            maxRows={0.5}
            style={{width:120, marginBottom:isOnSalesReceipt?"10px":"35px",textAlign:"center"}} 
            size='small'               
                margin="normal"
                id="pin"
                value={pinState}
                name="pin"
                label="Pin"
                type="password"
                onChange={(e)=>{
                  setErrorHandling(null)
                  setPin(e.target.value)
                 }}
                error={!!errorHandling}           
                helperText={errorHandling}
                // value={(event:any)=>{event.target}}
                                    // value={formik.values.first_name}
                                    // onChange={formik.handleChange}
                                    // error={!!formik.touched.first_name && !!formik.errors.first_name}
                      // helperText={formik.touched.first_name && formik.errors.first_name}
            ></TextField>
            {isOnSalesReceipt ? 
              (
                
                <Button  disabled={isLoading}  variant="contained" disableElevation sx={{display:"flex",mt:3,textTransform:"none",justifyContent:"space-between", flexWrap:"nowrap",margin:"1px auto",width:isLoading?"150px":"100px", textAlign:"center" }} type="submit">{staffStatus?.assigned===true?'Unassign':'Assign'} {isLoading&&<ProgressSign/>} </Button>
              )
              : 
              (

                outlet?
            (
              <Button disabled={isLoading}  variant="contained" disableElevation sx={{display:"flex",justifyContent:"space-between", flexWrap:"nowrap",margin:"1px auto",p:1,width:isLoading?"150px":"100px", textAlign:"center" }} type="submit">{String(activeOutletId) ===String(outlet.id)? 'Deactivate':"Activate"} {isLoading&&<ProgressSign/>} </Button>
            ):
              
            (
              <Button disabled={isLoading}  variant="contained" disableElevation sx={{display:"flex",justifyContent:"space-between", flexWrap:"nowrap",margin:"1px auto",width:isLoading?"150px":"100px", textAlign:"center" }} type="submit">{staffStatus?.is_active===true?'Sign Out':'Sign In'} {isLoading&&<ProgressSign/>} </Button>
            )
            

            
           
              )}
            
            
            
            
        </Box>
         
      </Popover>
    </>
  );
}
