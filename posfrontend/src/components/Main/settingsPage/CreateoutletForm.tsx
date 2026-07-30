import { useFormik } from "formik"
import { Box, Button, Container, Paper, TextField, Typography, useTheme } from "@mui/material";
import "../accounts/ProfileForm.css"
import useAxiosWithInterceptor from "../../../helper/jwtinterceptor";
import { useEffect, useRef, useState } from "react";
import { requestIdProps } from "../../../@types/auth-service";
import CreatePassCodeDiag from "../../CreatePassCodeDiag";


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
     getOutlets: () => Promise<any>
    handleOutletCreated: (outlet: dataProps) => void
    setCreateOutletObject:React.Dispatch<React.SetStateAction<boolean>>;
}



const CreateOutletForm = ({ getOutlets,handleOutletCreated,setCreateOutletObject}:dataPropsB) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark"
    const [open, setOpen] = useState(false);
    const jwtAxios = useAxiosWithInterceptor()
    const passTokenRef = useRef<string | null>(null);
    const [errMessage,setErrMessage] = useState(null)
    const RefCreate = useRef<HTMLDivElement | null>(null);
    const [requestId, setRequestId] = useState<requestIdProps | null>(null)
     const createIdRef = useRef(crypto.randomUUID());
    console.log(errMessage)
    useEffect(()=>{ 
    setRequestId(
        {object_details:"outlet",
            id:createIdRef.current
        }
    )
    },[])

    useEffect(()=>{
        setTimeout(()=>{
             RefCreate.current?.scrollIntoView(
            {behavior:"smooth", block:"center"

            })
        }, 50)
       
    },[errMessage])

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            email_address:"",
            pin:"",
            confirm_pin:"",
            name:"",
            address:"",
            Instagram:"",
            Facebook:"",
            city:"",
            outlogo:null as File | null

        },
        validate: (values) => {
            const errors: Partial<typeof values> = {};
            if (!values.email_address) {
                errors.email_address = "Required"
            }
            if(values.pin !== values.confirm_pin){
                errors.pin = "Pin does not match"
            }
  
            return errors;
        },
        onSubmit: async (values) => {
            const {name,email_address,pin, address,Instagram,Facebook,city} = values;
            
            const apiValues = {
                "name":name,
                "city": city,
                "email_address": email_address,
                "address":address,
                "pin":pin,
                "Instagram":Instagram,
                "Facebook":Facebook
                }
                console.log(apiValues, passTokenRef.current)
            try{
                const response = await jwtAxios.post(`http://127.0.0.1:8000/accounts/api/outlets/`,
                    apiValues,
                    {
                        headers: {
                    "X-Pass-Token": passTokenRef.current
                    }
                    ,
                    withCredentials:true}
                
                )
                console.log(response.data, response.status)
                if(response.status === 200){
                    passTokenRef.current=null
                    setCreateOutletObject(false)
                    await getOutlets()
                    handleOutletCreated(response.data["data"])
                }
                return (response.data["data"])
            }catch(err:any){
                if(err.response?.status === 403 && err.response?.data.error_token){
                    passTokenRef.current=null
                    setOpen(true)
                }
                if(err.response?.status === 403 && err.response?.data.error_admin){
                    setOpen(true)
                    setErrMessage(err.response.data.error_admin || "Error")
                }
                if (err.response?.data?.email_address) {
                    formik.setFieldError("email_address", err.response.data.email_address);
                }
                 if (err.response?.data?.pin) {
                    formik.setFieldError("pin", err.response.data.pin);
                }
                 if(err.response.data?.message){
                    setErrMessage(err.response.data.message || "Error")
                }
                if(err.response.data?.error){
                    setErrMessage(err.response.data.error || "Error")
                    
                }
                setTimeout(() => {
                    setErrMessage(null)
                },8000);
                console.log(err)
            }

        },
    })
    return (
        <>
                <Container component="main">

               
    
                <Paper sx={{p:2,m:1, backgroundColor:isDarkMode?"none":theme.palette.primary.light}} elevation={3} >
                <Box
                    component="form"
                    onSubmit={formik.handleSubmit}
                 sx={
                    {

                        marginTop: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
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
                            id="Facebook"
                            name="Facebook"
                            label="Facebook"
                            type="text"
                            value={formik.values.Facebook}
                            onChange={formik.handleChange}
                            error={!!formik.touched.Facebook && !!formik.errors.Facebook}
                            // helperText={formik.touched.Facebook && formik.errors.Facebook}
                        >
                        </TextField>

                        
                        <TextField
                            fullWidth
                            margin="normal"
                            id="Instagram"
                            name="Instagram"
                            label="Instagram"
                            type="text"
                            value={formik.values.Instagram}
                            onChange={formik.handleChange}
                            error={!!formik.touched.Instagram && !!formik.errors.Instagram}
                            // helperText={formik.touched.Instagram && formik.errors.Instagram}
                        >
                        </TextField>
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
                        <TextField
                            
                            fullWidth
                            margin="normal"
                            id="email_address"
                            name="email_address"
                            label="Email Address"
                            type="text"
                            value={formik.values.email_address}
                            onChange={formik.handleChange}
                            error={!!formik.touched.email_address && !!formik.errors.email_address}
                            helperText={formik.touched.email_address && formik.errors.email_address}
                        >
                        </TextField>
                        <TextField
                        inputProps={{ maxLength: 4, inputMode: "numeric", pattern: "[0-9]*" }}
                            onKeyDown={(e) => {
                                    if (!/[0-9]/.test(e.key) && e.key !== "Backspace") {
                                        e.preventDefault(); 
                                     }
                                }}
                            fullWidth
                            autoComplete="current-password"
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
                        <TextField
                            inputProps={{ maxLength: 4, inputMode: "numeric", pattern: "[0-9]*" }}
                                 onKeyDown={(e) => {
                                if (!/[0-9]/.test(e.key) && e.key !== "Backspace") {
                                    e.preventDefault(); 
                                }
                            }}
                            autoComplete="current-password"
                            fullWidth
                             margin="normal"
                            id="confirm_pin"
                            name="confirm_pin"
                            label="Confirm Pin"
                            type="password"
                            value={formik.values.confirm_pin}
                            onChange={formik.handleChange}
                            error={!!formik.touched.confirm_pin && !!formik.errors.confirm_pin}
                            helperText={formik.touched.confirm_pin && formik.errors.confirm_pin}
                        >
                        </TextField>        
                                                
                        <TextField
                            fullWidth
                            margin="normal"
                            id="city"
                            name="city"
                            label="City"
                            type="text"
                            value={formik.values.city}
                            onChange={formik.handleChange}
                            error={!!formik.touched.city && !!formik.errors.city}
                            // helperText={formik.touched.city && formik.errors.city}
                        >
                        </TextField>
                          {/* <Button sx={{m:1}}
                            variant="contained"
                            onClick={() => setOpen(true)}
                         >
                            Create Outlet
                            </Button> */}
                        <Button variant="contained" disableElevation sx={{display:"block",margin:"1px auto", textAlign:"center" }} type="submit">Create Oulet</Button>
                        
                    </Box>
                    {errMessage &&
                                    <Box ref={RefCreate} sx={{width:"100%"}}>
                                        <Typography sx={{textAlign:"center"}} color="error">
                                            {errMessage} 
                                        </Typography>
                                    </Box>
                                        
                                    }
                    <CreatePassCodeDiag
                                            requestId={requestId}
                                            purpose='create_outlet'
                                            passTokenRef={passTokenRef}
                                                formik={formik}
                                                open={open}
                                                handleDaigClose={() => setOpen(false)}
                                            />
                    </Paper>
               </Container>  
        </>
    )

};

export default CreateOutletForm