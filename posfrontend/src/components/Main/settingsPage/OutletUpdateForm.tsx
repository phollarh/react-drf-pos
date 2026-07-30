import { useFormik } from "formik"
import { Box, Button, Container, Paper, TextField, Typography, useTheme } from "@mui/material";
import "../accounts/ProfileForm.css"
import useAxiosWithInterceptor from "../../../helper/jwtinterceptor";
import { useEffect, useRef, useState } from "react";
import { outletsDataProps } from "../../../@types/outletsNstaff-service";
import PassCodeDiag from "../../PassCodeDiag";
import PassCodeDiagUpdate from "../../PassCodeDiagUpdate";
import { requestIdProps } from "../../../@types/auth-service";


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

  type apiValuesProps = {
    "name":string;
    "pin"?:string;
    passToken?:string;
    "city": string;
    "email_address": string;
    "address":string;
    "Instagram":string;
    "Facebook":string;
    }

interface dataPropsB{

    setSelectedOutletObject:React.Dispatch<React.SetStateAction<outletsDataProps | null>>
    data:dataProps | null
     getOutlets: () => Promise<any>
}


const OutletUpdateForm = ({data, getOutlets,setSelectedOutletObject}:dataPropsB) => {
    const theme = useTheme();
    const jwtAxios = useAxiosWithInterceptor()
    const isDarkMode = theme.palette.mode === "dark"
    const [mess, setMess] = useState<null | string>(null)
    const Ref = useRef<HTMLDivElement>(null)
    const messRef = useRef<HTMLDivElement>(null)
    const [pinChange, setPinChange] = useState(false)
    const passTokenRef = useRef<string | null>(null);
    const [openDel, setOpenDel] = useState(false);
    const [requestId, setRequestId] = useState<requestIdProps | null>(null)
      const [open, setOpen] = useState(false);
    
    useEffect(()=>{
        if(data){
            
             setRequestId(
                {object_details:"outlet",
                    id:data.id
                }
                )
        }
       
    },[data])
      useEffect(()=>{
            messRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            })
      }, [mess])

    const handleDelete = async ( )=>{
        try{
            const response = await jwtAxios.delete(`http://127.0.0.1:8000/accounts/api/outlets/${data?.id}/`,

                {
                   headers: {
                    "X-Pass-Token": passTokenRef.current
                },
                    withCredentials:true
                }
                )
                if(response.status === 200){
                    passTokenRef.current=null
                    setTimeout(()=>{
                        setSelectedOutletObject(null)
                         getOutlets()
                    },4000)
                   
                }
                console.log(response.data)
                return response.data
        }catch(err:any){
             console.log(err)
            if(err.response?.status === 403 && err.response?.data.error_token){
                setOpenDel(true)
            }
            if(err.response.data?.error){
                setMess(err.response.data?.error)
                setTimeout(()=>{
                    setMess(null)
                }, 4000)
            }
            
            throw err
        }
    }

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            id :data?.id || "",
            email_address:data?.email_address|| "",
            name:data?.name|| "",
            address:data?.address || "",
            Instagram:data?.Instagram|| "",
            Facebook:data?.Facebook|| "",
            city:data?.city || "",
            confirm_pin:"",
            pin:"",
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
            setMess(null)
            const {id,name,email_address,pin, address,Instagram,Facebook,city} = values;
            
            const apiValues : apiValuesProps = {
                "name":name,
                "pin":pin,
                "city": city,
                "email_address": email_address,
                "address":address,
                "Instagram":Instagram,
                "Facebook":Facebook
                
                }
            try{
                if(apiValues.pin === ""){
                    delete apiValues.pin
                }
                console.log(passTokenRef.current)
                const response = await jwtAxios.patch(`http://127.0.0.1:8000/accounts/api/outlets/${id}/`,
                    apiValues,
                    {
                         headers: {
                    "X-Pass-Token": passTokenRef?.current
                    },
                        withCredentials:true}
                
                )
                if(response.status === 200){
                    passTokenRef.current = null
                    setMess(response.data.message)
                     setTimeout(() => {
                        setMess(null)
                    },8000);
                }
                
                return (response.data)
            }catch(err:any){
                if(err.response?.status === 403 && err.response?.data.error_token){
                    console.log(err.response?.data.error_token)
                    setOpen(true)
                }
                 if(err.response?.status === 403 && err.response?.data.error_admin){
                    setOpen(true)
                    setMess(err.response.data.error_admin || "Error")
                }
                if(err.response.data?.message){
                    setMess(err.response.data.message || "Error")
                }
                if(err.response.data?.error){
                    setMess(err.response.data.error || "Error")
                    
                }
                setTimeout(() => {
                    setMess(null)
                },8000);
                console.log(err)
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
                            disabled
                            fullWidth
                            margin="normal"
                            id="email"
                            name="email"
                            label="Email Address"
                            type="text"
                            value={formik.values.email_address}
                            onChange={formik.handleChange}
                            error={!!formik.touched.email_address && !!formik.errors.email_address}
                            // helperText={formik.touched.email_address && formik.errors.email_address}
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
                        <Box type="button" color="red"  
                        onClick={()=>{
                            formik.setFieldValue("pin", "")
                            formik.setFieldValue("confirm_pin", "")
                            setTimeout(()=>{
                                Ref.current?.scrollIntoView({ behavior: "smooth",
                                        block: "center",})
                            }, 0)
                            setPinChange(!pinChange)}}
                         component="button" sx={{border:"none",p:0.5, cursor:"pointer", backgroundColor:"transparent"}}>
                            Change Outlet Pin
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
                                                    onChange={formik.handleChange}
                                                    error={!!formik.touched.confirm_pin && !!formik.errors.confirm_pin}
                                                    helperText={formik.touched.confirm_pin && formik.errors.confirm_pin}
                                                >
                                                </TextField>
                        </Box>
                           
                        }
                                
                        <Box sx={{display:"flex"}}>
                        {/* <Button sx={{m:1}}
                            variant="contained"
                            onClick={() => setOpen(true)}
                        >
                            Update
                        </Button> */}
                        <Button variant="contained" disableElevation sx={{m:1, textAlign:"center", textTransform:"none" }} type="submit">Update</Button>
                        <Button onClick={handleDelete}  size="small" color="error" variant="contained" disableElevation sx={{textTransform:"none",p:1, alignSelf: "center" }} >Delete</Button>
                        <PassCodeDiag 
                        passTokenRef={passTokenRef}  
                        open={openDel} 
                        handleClose={()=>{setOpenDel(false)}}
                        requestId={requestId}
                        purpose='delete_outlet'  
                        handleDelete={handleDelete}/>
                        <PassCodeDiagUpdate
                        requestId={requestId}
                        purpose='update_outlet'
                        passTokenRef={passTokenRef}
                        formik={formik}
                        open={open}
                        handleDaigClose={() => setOpen(false)}
                        />
                        
                        </Box>
                        
                       {mess&& <Box ref={messRef}  ><Typography color="error"> {mess}</Typography > </Box>}
                    </Box>
                    </Paper>
               </Container>  
        </>
    )

};

export default OutletUpdateForm