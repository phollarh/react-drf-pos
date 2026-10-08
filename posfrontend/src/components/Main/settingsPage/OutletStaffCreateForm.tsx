import { useFormik } from "formik"
import { Box, Button, Container, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField, Typography, useTheme } from "@mui/material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import '../accounts/ProfileForm.css'
import React, { useEffect, useRef, useState } from "react";
import useAxiosWithInterceptor from "../../../helper/jwtinterceptor";
import { outletStaffDataProps } from "../../../@types/outletsNstaff-service";
import { requestIdProps } from "../../../@types/auth-service";
import CreatePassCodeDiag from "../../CreatePassCodeDiag";
import { useAuthServiceContext } from "../../../context/AuthContext";
import { BASE_URL_ACCOUNT } from "../../../congif";


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
    mode:string | null
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


const OutletStaffCreateForm = ({mode,handleStaffCreated, setStaff,getStaffStatus}:dataPropsB) => {
    
    const theme = useTheme();
    const jwtAxios = useAxiosWithInterceptor()
    const isDarkMode = theme.palette.mode === "dark"
    const [errMeg, setErrMeg] = useState<null|string>(null)
    const [sMessg, setSmessg] = useState<null | string>(null)
    const [requestId, setRequestId] = useState<requestIdProps | null>(null)
    const [open, setOpen] = useState(false);
    const passTokenRef = useRef<string | null>(null);
    const createIdRef = useRef(crypto.randomUUID());
    
    const {activeOutletId} = useAuthServiceContext();
    const [outletId, setOutletId] = useState("")

    useEffect(()=>{
            if(activeOutletId){
                setOutletId(String(activeOutletId))
            }
                    
    },[activeOutletId])
    

    useEffect(()=>{ 
        setRequestId(
            {object_details:"outlet_staff_create",
                id:createIdRef.current
            }
        )
        },[])
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            id :"",
            email:"",
            name:"",
            address:"",
            status:"",
            phone_number:"",
            
            pin:"",
            

        },
        validate: (values) => {
            const errors: Partial<typeof values> = {};
            if (!values.email) {
                errors.email = "Required"
            }
            if (values.pin.length > 4) {
                errors.pin = "can not be more than 4"
            }
  
            return errors;
        },
        onSubmit: async (values) => {
            const {name,email, address,status,pin, phone_number} = values;
            
            let apiValues:FormValues = {
                "name":name,
                "phone_number": phone_number,
                "email": email,
                "address":address,
                "status":status,
  
                "pin":pin
                }
            if(mode === "create"){
                
                try{
                const response = await jwtAxios.post(`${BASE_URL_ACCOUNT}/outletstaffs/?outlet_id=${outletId}`,
                    apiValues,
                    {
                         headers: {
                        "X-Pass-Token": passTokenRef.current
                        },
                        withCredentials:true
                    }
                
                )
                if(response.status === 200){
                    passTokenRef.current=null
            
                    handleStaffCreated(response.data?.["data"])
                    getStaffStatus(response.data?.["data"].Employee_id)
                    setStaff(response.data?.["data"])
                     setTimeout(()=>{
                        setSmessg(null)
                    },3000)
                
                
                }
               
                return (response.data)
            }catch(err:any){
                 if(err.response?.status === 403 && err.response?.data.error_token){
                setOpen(true)
                }
               
                
                if (err.response?.data?.email) {
                    formik.setFieldError("email", err.response.data.email);
                }
                if (err.response?.data?.pin) {
                    formik.setFieldError("pin", err.response.data.pin);
                }
                // if (err.response?.data?.status) {
                //     formik.setFieldError("status", err.response.data['outlet'][0]);
                // }
                if (err.response?.data.status) {
                    console.log(err.response.data.status)
                    formik.setFieldError("status", err.response.data?.status);
                }
                 if(err.response?.data.error){
                    setErrMeg(err.response?.data.error)
                    setTimeout(()=>{
                        setErrMeg(null)
                    }, 9000)
                     
                }
                
            }
            
            }
    
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
                            onChange={formik.handleChange}
                            error={!!formik.touched.name && !!formik.errors.name}
                            // helperText={formik.touched.Facebook && formik.errors.Facebook}
                        >
                        </TextField>
                        <TextField
                            
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
                                        {/* <MenuItem value="Manager">Manager</MenuItem> */}
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
                            {mode === "create" &&
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
                            label="Pin"
                            type="password"
                            value={formik.values.pin}
                            onChange={formik.handleChange}
                            error={!!formik.touched.pin && !!formik.errors.pin}
                            helperText={formik.touched.pin && formik.errors.pin}
                        >
                        </TextField>
                            }
                                              
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
                      
                    <Button variant="contained" disableElevation sx={{display:"block",margin:"1px auto", textAlign:"center" }} type="submit">Add Staff</Button>
                    </Box>
                    {/* <Button  size="small" sx={{margin:"1px auto", display:"block"}}
                            variant="contained"
                            onClick={() => setOpen(true)}
                         >
                            Add Staff
                            </Button> */}
   
                        

                          <Box >
                                                    <Typography color="error" sx={{display:"block", margin:"1px auto", textAlign:"center"}}>
                                                    {errMeg && errMeg}
                                                </Typography>
                                                </Box>
                                                
                                                <Box >
                                                     <Typography color="error" sx={{display:"block", margin:"1px auto", textAlign:"center"}}>
                                                    {sMessg && sMessg}
                                                </Typography>
                                                </Box>
                    {/* </Paper> */}
                     <CreatePassCodeDiag
                        requestId={requestId}
                        purpose='create_staff'
                        passTokenRef={passTokenRef}
                        formik={formik}
                        open={open}
                        handleDaigClose={() => setOpen(false)}
                    />
                                    
               </Container>  
        </>
    )

};

export default OutletStaffCreateForm