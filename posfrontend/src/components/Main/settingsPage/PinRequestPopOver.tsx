import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import { Box, TextField } from '@mui/material';
import useAxiosWithInterceptor from '../../../helper/jwtinterceptor';
import axios from 'axios';
import ProgressSign from '../../Progress';
import { OutletNstaffService } from '../../../services/OutletNStaffService';
import { outletsDataProps, outletStaffDataProps } from '../../../@types/outletsNstaff-service';
import { UseoutletNstaffContext } from '../../../context/OutletNStaffsContext';
import { Filter } from '@mui/icons-material';


interface PinProp {
    Employee_id: string |undefined;
    outletStaff:outletStaffDataProps | null;
    setAssignedStaff?: React.Dispatch<React.SetStateAction<outletStaffDataProps | null>>
    outlet:outletsDataProps | null;
    staffStatus:{is_active:boolean, session_id:string} | undefined;
    filterOption:string;
    setFilterOption:React.Dispatch<React.SetStateAction<string>>;
    setAssignMess?: React.Dispatch<React.SetStateAction<string | null>>;
    fetchReceipt ?: () => Promise<void>;
    
}

export default function PinRequestPopOver({fetchReceipt,Employee_id,outletStaff,setAssignMess,setAssignedStaff,filterOption,setFilterOption, outlet}:PinProp) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [errorHandling, setErrorHandling] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [logStaff, setLogStaffIn] = React.useState<boolean>(false)
  const [pinState, setPin] = React.useState("")
  const [username, setUsername] = React.useState<string|undefined >()
  const isOnSalesReceipt = location.pathname === "/sales_receipts"
  const jwtAxios = useAxiosWithInterceptor()
  const {LogStaffOut,getStaffStatus,employeeId,setStaffStatus, staffStatus,staffData} = UseoutletNstaffContext();
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

    // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //   setChecked(event.target.checked);
      
    // };
console.log(staffStatus, staffData, outletStaff)
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
    
  const handleStaffLogin = async (event:React.FormEvent<HTMLFormElement>)=>{
     event.preventDefault();
     setErrorHandling(null)
     setAssignMess?.(null)
     setIsLoading(true)
    
    if(isOnSalesReceipt){
      const outlet_id = localStorage.getItem("outlet_id") || ""
        if(pinState  !== "" ){
              
              const payLoad = {
                  "pin":pinState,
                  "username":username,
                  "outlet_id":outlet_id
                  
                  }
                  console.log(payLoad)
              try{
            
            const response = await jwtAxios.post('http://127.0.0.1:8000/accounts/api/staffs-login/assign_staff_session/', payLoad,
                {withCredentials:true}
            )
            
                if(response.status === 200){
                  console.log(response.data)
                  const staff_status=await getStaffStatus(response.data.employee_id)

                  
                  if(staff_status?.is_active === true && response.data?.assigned_status === true){
                      console.log(response.data)
                      const assigned_staff : outletStaffDataProps | null  = staffData.find((item)=>String(response.data?.employee_id) === String(item.Employee_id)) ?? null
                      console.log(assigned_staff)
                      setAssignedStaff?.(assigned_staff)
                      await fetchReceipt?.()

                      // setAssignMess?.(response.data?.["message"])

                      // setInterval(() => {
                      //   setAssignMess?.(null)
                      // }, 15000);
                    
                  }
                  console.log(response.data)
                  if(response.data?.assigned_status === false){
                      
                      const assigned_staff : outletStaffDataProps | null  = staffData.find((item)=>String(response.data?.employee_id) === String(item.Employee_id)) ?? null
                      console.log(assigned_staff)
                      setAssignedStaff?.(null)
                      // setAssignMess?.(response.data?.message)
                      setStaffStatus(undefined)
                      await fetchReceipt?.()
                      

                      // setInterval(() => {
                      //   setAssignMess?.(null)
                      // },15000);
                    
                  }

                     


                    handleClose()
                    setIsLoading(false)
                    setPin("")
                    console.log(response.data)
                }
                setIsLoading(false)
                return response.data
        }catch(error:any){
          console.log(error)
          setIsLoading(false)
            setPin("")
            if(error.response?.data){
              setPin("")
              setErrorHandling(error.response.data.error)
              console.log(error.response.data.error)
            }
        }
              
            
        
      }
      return;
    }
     if(outlet){
  

          if(pinState !== ""){
                const payLoad = {
                "outlet_pin":pinState,
                "outlet_id":outlet.id
                }
                
            try{
              if(!outlet.id){
                return !outlet.id
              }
              
              const reponse=await jwtAxios.post('http://127.0.0.1:8000/accounts/api/verify_outlet/',payLoad, 
                {withCredentials:true}
              )
              if(localStorage.getItem("outlet_id")===String(reponse.data.id) && reponse.status === 200 ){
                localStorage.removeItem("outlet_id")
                setFilterOption("")
                setPin("")
                handleClose()
                setIsLoading(false)
              }
             else{
                setFilterOption(reponse.data.id)
                setPin("")
                handleClose()
                setIsLoading(false)
                localStorage.setItem("outlet_id", `${reponse.data.id}`)
             }
            }catch(error:any){
              if(error.response?.data){
                setErrorHandling(error.response.data.error)
            }
            setIsLoading(false)
            setPin("")
            throw error
          
          }
        
     }
    }else{
        if(staffStatus?.is_active === true && employeeId !== ""){
        
          console.log("called to log u out")
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

          console.log("i logged in agagindddd")
  
        try{
            
            const response = await jwtAxios.post('http://127.0.0.1:8000/accounts/api/staffs-login/', payLoad,
                {withCredentials:true}
            )
            console.log(response.status)
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

    const outletChecked = outlet !== null
    // console.log(staffStatus)
    const derChecked=React.useMemo(()=>{
      let checked=false
      if(outletChecked){
        checked=localStorage.getItem("outlet_id") === String(outlet?.id)? true: false
        console.log('m called', checked)
      }
      
      if(staffStatus){
      
          checked=staffStatus?.is_active === true? true: false
      }
      return checked
    },[outlet?.id, filterOption, staffStatus?.session_id])
    console.log(derChecked, filterOption)
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
        <Box onSubmit={handleStaffLogin}  display="flex" flexDirection="column" component="form" sx={{m:0.5,p:1, textAlign:"center"}}>
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
                
                <Button  disabled={isLoading}  variant="contained" disableElevation sx={{display:"flex",mt:3,textTransform:"none",justifyContent:"space-between", flexWrap:"nowrap",margin:"1px auto",width:isLoading?"150px":"100px", textAlign:"center" }} type="submit">{staffStatus?.is_active===true?'Unassign':'Assign'} {isLoading&&<ProgressSign/>} </Button>
              )
              : 
              (

                outlet?
            (
              <Button disabled={isLoading}  variant="contained" disableElevation sx={{display:"flex",justifyContent:"space-between", flexWrap:"nowrap",margin:"1px auto",p:1,width:isLoading?"150px":"100px", textAlign:"center" }} type="submit">{localStorage.getItem("outlet_id") ===String(outlet.id)? 'Deactivate':"Activate"} {isLoading&&<ProgressSign/>} </Button>
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
