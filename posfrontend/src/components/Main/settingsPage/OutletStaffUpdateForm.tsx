import { useFormik } from "formik"
import { Box, Button, Container, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField, Typography, useTheme } from "@mui/material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import '../accounts/ProfileForm.css'
import React, { useEffect, useRef, useState } from "react";
import useAxiosWithInterceptor from "../../../helper/jwtinterceptor";
import { outletStaffDataProps } from "../../../@types/outletsNstaff-service";
import ProgressSign from "../../Progress";
import PassCodeDiagUpdate from "../../PassCodeDiagUpdate";
import PassCodeDiag from "../../PassCodeDiag";
import { UseoutletNstaffContext } from "../../../context/OutletNStaffsContext";
import { requestIdProps } from "../../../@types/auth-service";


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
interface dataPropsB{
    mode:"create" | "update" | undefined
    setMode: React.Dispatch<React.SetStateAction<"update" | "create" | undefined>>;
    data: outletDataProps  | null;
    outlets:dataProps[] | [];
    setStaff: React.Dispatch<React.SetStateAction<outletStaffDataProps | null>>
    handleStaffCreated: (outletStaff:outletStaffDataProps) => void
    getStaffStatus: (found: string) => Promise<any>
    
}

interface FormValues {
    id?: string;
    email:string;
    name:string;
    address:string;
    status:string;
    phone_number:string;
    pin?:string;
}


const OutletStaffUpdateForm = ({data,setMode,setStaff}:dataPropsB) => {
    
    const theme = useTheme();
    const jwtAxios = useAxiosWithInterceptor()
    const [errMeg, setErrMeg] = useState<null|string>(null)
    const [sMessg, setSmessg] = useState<null | string>(null)
    const [isloading, setIsloading] = useState(false)
    const isDarkMode = theme.palette.mode === "dark"
    const [pinChange, setPinChange] = useState(false)
    const [open, setOpen] = useState(false);
    const messRef = useRef<HTMLDivElement>(null)
    const errmessRef = useRef<HTMLDivElement>(null)
    const [openDel, setOpenDel] = useState(false);
    const passTokenRef = useRef<string | null>(null);
    const Ref = useRef<HTMLDivElement>(null)
    const [requestId, setRequestId] = useState<requestIdProps | null>(null)
    const {getOutletStaff} = UseoutletNstaffContext()
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrMeg(null);
    setSmessg(null);
    formik.handleChange(e);
};

        useEffect(()=>{
            if(data){
                
                 setRequestId(
                    {object_details:"outlet",
                        id:data.Employee_id
                    }
                    )
            }
           
        },[data])
    
    useEffect(()=>{
                messRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                })
          }, [sMessg])
    
      useEffect(()=>{
                errmessRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                })
          }, [errMeg])
    const handleDelete = async ( )=>{
        try{
            const response = await jwtAxios.delete(`http://127.0.0.1:8000/accounts/api/outletstaffs/${data?.Employee_id}/`,

                {
                   headers: {
                    "X-Pass-Token": passTokenRef.current
                },
                    withCredentials:true
                }
                )
                if(response.status === 200){
                    passTokenRef.current = null
                    setErrMeg(null)
                    setIsloading(false)
                
                    await getOutletStaff()
                    setStaff(null)
                    setSmessg(response.data.message)
                    setTimeout(()=>{
                        setSmessg(null)
                    },3000)
                    setMode(undefined)
                   
                }
                console.log(response.data)
                return response.data
        }catch(err:any){
            console.log(err)
            setSmessg(null)
            if(err.response?.status === 403 && err.response?.data.error_token){
                setOpenDel(true)
                
                }
                if(err.response?.status === 403){
                    setErrMeg(err.response?.data.error)
                    console.log(err.response?.data.error)
                }
                setIsloading(false)
                if(err.response?.data.error){
                    err.response?.data.error
                    setTimeout(()=>{
                        setErrMeg(null)
                    }, 9000)
                     
                }
               
            
            throw err
        }
    }


    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            id :data?.Employee_id ?? "",
            email:data?.email ?? "",
            name:data?.name ?? "",
            address:data?.address ?? "",
            status:data?.status ?? "",
            phone_number:data?.phone_number ?? "",
            // outlet:data?.outlet ?? "",
            confirm_pin:"",
            pin:"",
  
            

        },
        validate: (values) => {
            const errors: Partial<typeof values> = {};
            if (!values.email) {
                errors.email = "Required"
            }
            if(values.confirm_pin !== values.pin){
                errors.confirm_pin = "Pin does not match"
            }

  
            return errors;
        },
        onSubmit: async (values) => {
            
            setSmessg(null)
            setErrMeg(null)
            setIsloading(true)
            const {id,name,email, address,status,pin,phone_number} = values;
            const outlet= localStorage.getItem("outlet_id") || ""
    
            let apiValues:FormValues = {
                "name":name,
                "phone_number": phone_number,
                "email": email,
                "address":address,
                "status":status,
                
                "pin":pin
                
                }
            
            try{
                
                if(apiValues.pin === ""){
                    delete apiValues?.["pin"]
                }
                
                const response = await jwtAxios.patch(`http://127.0.0.1:8000/accounts/api/outletstaffs/${id}/?outlet_id=${outlet}`,
                    apiValues,
                    {
                        headers: {
                    "X-Pass-Token": passTokenRef?.current
                    },withCredentials:true}
                
                )
                
                if(response.status === 200){
                    passTokenRef.current = null
                    setErrMeg(null)
                    setIsloading(false)
                    // setStaff(response.data)
                    setSmessg(response.data.message)
                    setTimeout(()=>{
                        setSmessg(null)
                    },3000)
                    setPinChange(false)
                }
                
                return (response.data)
            }catch(err:any){
                setSmessg(null)
                setIsloading(false)
                if(err.response?.status === 403 && err.response?.data.error_token){
                setOpen(true)
                
                }
                if(err.response?.status === 403){
                    setErrMeg(err.response?.data.error)
                    console.log(err.response?.data.error)
                }
                
                if(err.response?.data.error){
                    setErrMeg(err.response?.data.error)
                    setTimeout(()=>{
                        setErrMeg(null)
                    }, 9000)
                     
                }
                console.log(err)
                throw err
               
            }
            // const status = await login(email, password);
          
            // if (status) {
            //     navigate("/testlogin")
            // }
        },
    })
    return (
        <>
                <Container component="main">

               
    
                {/* <Paper sx={{p:2,m:1, backgroundColor:isDarkMode?"none":theme.palette.primary.light}} elevation={3} > */}
                <Box
                    component="form"
                    onSubmit={formik.handleSubmit}
                    
                 sx={
                    {
                        marginTop: 1,
                        display: "flex",
                        // alignItems: "center",
                        // justifyContent: "center",
                        flexDirection: 'column',
                    }}>
                        
                      <TextField
                            fullWidth
                            margin="normal"
                            id="name"
                            name="name"
                            label="Name"
                            type="text"
                            value={formik.values.name}
                            onChange={handleChange}
                            error={!!formik.touched.name && !!formik.errors.name}
                            // helperText={formik.touched.Facebook && formik.errors.Facebook}
                        >
                        </TextField>
                        <TextField
                            disabled
                            fullWidth
                            margin="normal"
                            id="email"
                            name="email"
                            label="Email"
                            type="text"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={!!formik.touched.email && !!formik.errors.email}
                            helperText={formik.touched.email && formik.errors.email}
                        >
                        </TextField>
                        <FormControl fullWidth sx={{mt:4, fontFamily:"sans-serif", minWidth: 150 }} size="small">
                              
                            
                            <InputLabel id="demo-select-small-label">Status</InputLabel>
                                <Select
                                    name="status"
                                    value={formik.values.status}
                                    onChange={formik.handleChange}
                                    label="Status"
                                   
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        
                                        <MenuItem value="Supervisor">Supervisor</MenuItem>
                                        <MenuItem value="Manager">Manager</MenuItem>
                                        <MenuItem value="Staff">Staff</MenuItem>
                                                        
                                </Select>
                                {formik.touched.status && formik.errors.status && (
                                    <FormHelperText style={{color:"red"}}>
                                        {formik.errors.status}
                                    </FormHelperText>
                                )}
                        </FormControl>
                          {/* <FormControl fullWidth sx={{mt:4, fontFamily:"sans-serif", minWidth: 150 }} size="small">
                            
                            <InputLabel id="demo-select-small-label">Outlet</InputLabel>
                                <Select
                                    name="outlet"
                                    value={formik.values.outlet}
                                    onChange={formik.handleChange}
                                    label="Outlet"
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        {outlets.map((item)=>{
                                            return( <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)
                                        })}
                                        
                                                        
                                </Select>
                                 {formik.touched.outlet && formik.errors.outlet && (
                                    <FormHelperText style={{color:"red"}}>
                                        {formik.errors.outlet}
                                    </FormHelperText>
                                )}
                        </FormControl> */}
                        <div className={isDarkMode? "dark-mode": "light-mode"}>
                        
                                                    <PhoneInput
                                                    country={'us'}
                                                    value={formik.values.phone_number}
                                                    onChange={(phone) => formik.setFieldValue("phone_number", phone)}
                                                    inputStyle={{
                                                        width: "100%",
                                                        background:isDarkMode?"transparent":theme.palette.primary.light,
                                                        borderColor: isDarkMode ? "#555" : "#ccc",
                                                        color: isDarkMode ? "#fff" : "#000",
                                                        
                                                        
                                                    }}
                                                     buttonStyle={{
                                                        background: isDarkMode ? theme.palette.primary.dark : theme.palette.primary.light,
                                                        borderColor: isDarkMode ? "#555" : "#ccc",
                                                    }}
                                                    dropdownStyle={{
                                                        background: isDarkMode ? theme.palette.primary.dark : "#fff",
                                                        color: isDarkMode ? "#fff" : "#000",
                                                    }}
                                                    containerStyle={{
                                                        marginTop: "26px",
                                                        marginBottom: "8px",
                                                        background:"transparent"
                                                    }}
                                                    />
                        
                        
                            </div>
                                              
                         <TextField
                            fullWidth
                            margin="normal"
                            id="address"
                            name="address"
                            label="Address"
                            type="text"
                            value={formik.values.address}
                            onChange={formik.handleChange}
                            error={!!formik.touched.address && !!formik.errors.address}
                            // helperText={formik.touched.address && formik.errors.address}
                        >
                        </TextField>
                        <Box type="button" color="red"  
                                                onClick={()=>{
                                                    setErrMeg(null)
                                                    setSmessg(null)
                                                    formik.setFieldValue("pin", "")
                                                    formik.setFieldValue("confirm_pin", "")
                                                    setTimeout(()=>{
                                                        Ref.current?.scrollIntoView({ behavior: "smooth",
                                                                block: "center",})
                                                    }, 0)
                                                    setPinChange(!pinChange)}}
                                                 component="button" sx={{border:"none",p:0.5, cursor:"pointer", backgroundColor:"transparent"}}>
                                                    Change Staff Pin
                                                </Box>
                                                {pinChange === true &&
                                                <Box ref={Ref}>
                                                     <TextField
                                                                            inputProps={{ maxLength: 4, inputMode: "numeric", pattern: "[0-9]*" }}
                                                                             onKeyDown={(e) => {
                                                                                if (!/[0-9]/.test(e.key) && e.key !== "Backspace") {
                                                                                e.preventDefault(); 
                                                                                }
                                                                            }}
                                                                            fullWidth
                                                                            margin="normal"
                                                                            id="pin"
                                                                            name="pin"
                                                                            label="Change Pin"
                                                                            type="password"
                                                                            value={formik.values.pin}
                                                                            onChange={formik.handleChange}
                                                                            error={!!formik.touched.pin && !!formik.errors.pin}
                                                                            helperText={formik.touched.pin && formik.errors.pin}
                                                                        >
                                                                        </TextField>        <TextField
                                                                            inputProps={{ maxLength: 4, inputMode: "numeric", pattern: "[0-9]*" }}
                                                                             onKeyDown={(e) => {
                                                                                if (!/[0-9]/.test(e.key) && e.key !== "Backspace") {
                                                                                e.preventDefault(); 
                                                                                }
                                                                            }}
                                                                            fullWidth
                                                                            margin="normal"
                                                                            id="confirm_pin"
                                                                            name="confirm_pin"
                                                                            label="Confirm Pin"
                                                                            type="password"
                                                                            value={formik.values.confirm_pin}
                                                                            onChange={handleChange}
                                                                            error={!!formik.touched.confirm_pin && !!formik.errors.confirm_pin}
                                                                            helperText={formik.touched.confirm_pin && formik.errors.confirm_pin}
                                                                        >
                                                                        </TextField>
                                                </Box>
                                                   
                                                }
                                                
                      
                        <Box display="flex" sx={{justifyContent:"center"}}>
   
                        <Button size="small" variant="contained" disableElevation 
                        sx={{justifySelf:"center", textAlign:"center", textTransform:"none",m:1, p:1 }} 
                        type="submit">Update</Button>
                         <Button  size="small" variant="contained" onClick={()=>{handleDelete()}} disableElevation sx={{textTransform:"none", margin:1, backgroundColor:"red" }} >Delete</Button>
                         {/* <Button sx={{m:1}}
                            variant="contained"
                            onClick={() => setOpen(true)}
                                                >
                                                    Update
                        </Button> */}
                        <Typography component="span" sx={{m:1}}>
                            {isloading && <ProgressSign/>}
                        </Typography>
                            
                        </Box>
                        <Box ref={errmessRef}>
                            <Typography color="error" sx={{display:"block", margin:"1px auto", textAlign:"center"}}>
                            {errMeg && errMeg}
                        </Typography>
                        </Box>
                        
                        <Box ref={ messRef}>
                             <Typography color="error" sx={{display:"block", margin:"1px auto", textAlign:"center"}}>
                            {sMessg && sMessg}
                        </Typography>
                        </Box>
                       
                        <PassCodeDiagUpdate
                        requestId={requestId}
                        purpose="staff_update"
                            formik={formik}
                            passTokenRef={passTokenRef}
                            open={open}
                            handleDaigClose={() => setOpen(false)}
                        />
                        
                        <PassCodeDiag passTokenRef={passTokenRef}  requestId={requestId} purpose="delete_staff"  handleDelete={handleDelete} open={openDel}
                        handleClose={()=>{setOpenDel(false)}}
                        />
                    </Box>
            
                           
                
                    
                    {/* </Paper> */}
               </Container>  
        </>
    )

};

export default OutletStaffUpdateForm