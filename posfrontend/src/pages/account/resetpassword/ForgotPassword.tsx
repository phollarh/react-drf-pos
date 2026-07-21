import { useFormik } from "formik"
import { useNavigate } from "react-router-dom"
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import { Box, Button, Container, Input, Paper, Stack, styled, TextField, Typography, useTheme } from "@mui/material";
import axios from "axios";
import '../../../components/Main/accounts/ProfileForm.css'
import { useRef, useState } from "react";
import { useAuthServiceContext } from "../../../context/AuthContext";
import ProgressSign from "../../../components/Progress";
import ResetPasswordDiag from "../../../components/Main/accounts/resetPassword/ResetPasswordDaig";
import React from "react";
import useAxiosWithInterceptor from "../../../helper/jwtinterceptor";


interface passwordProps {
    handleClose: () => void
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: (theme.vars ?? theme).palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));


const ForgotPassword = ({handleClose}:passwordProps) => {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [errorA, setErrorA] = React.useState<null|string>(null)
    const isDarkMode = theme.palette.mode === "dark"
    const [isLoading, setIsloading] = useState(false)
    const [sucessMessage, setSucessMessage] = useState<null | string>(null)
    
    const [code, setCode] = useState<string[]>( new Array(5).fill(""))
    const [showOTPForm,setShowOTPForm] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const jwtAxios = useAxiosWithInterceptor()
    const navigate = useNavigate();
    const {logout} = useAuthServiceContext()
      const handleCloseDiag = () => {
    setOpen(false);
  };

    const handleOTPvalidation = async (email:string, code:number)=>{
        setErrorA(null)
        setIsloading(true)
         const payload = {
            "email":email,
            "code":code
         }

        try{
            const response = await jwtAxios.post('http://127.0.0.1:8000/accounts/api/user/reset_password/',
                             payload,
                )
                if(response.status === 200){
                    setIsloading(false)
                    localStorage.setItem("rst", response.data.reset_token)
                    setSucessMessage(response.data.message)
                    setOpen(true)
                         }
                         console.log(response.data)
                         return (response.data)
                     }catch(err:any){
                        setIsloading(false)
                        setErrorA(err.response.data.error)
                         console.log(err)
                         throw err
                     }
         
    }

    const handleChange = (index:number, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> )=>{
        // setErrorA(null)
        setSucessMessage(null)
        const value = event.target.value
        if (!/^\d*$/.test(value)) {
            return;
        }

       const newCode =[...code]
       newCode[index] = value.slice(-1);
       setCode(newCode)
        if (event.target.value && index < code.length - 1) {
            console.log(inputRefs.current)
            inputRefs.current[index + 1]?.focus();
        }
        if(newCode.every(value=>value !== "")){
            const newCodeStr = newCode.join("")
            const email = localStorage.getItem("Email") || ""
            handleOTPvalidation(email, Number(newCodeStr))
        }

        
    }
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            email:"",


        },
        validate: (values) => {
            const errors: Partial<typeof values> = {};
            if (!values.email) {
                errors.email = "Required"
            }
            
                
                
            
  
             return errors;
        },
        onSubmit: async (values) => {
            setCode(new Array(5).fill(""))
            // setShowOTPForm(false)
            const {email} = values;
            const apiValues = {
                "email": email,
                
                }
            try{
                const response = await jwtAxios.post('http://127.0.0.1:8000/accounts/api/user/forgot_password_otp_gen/',
                    apiValues,
                    
                
                )
                if(response.status === 200){
                    localStorage.setItem("Email", response.data.email)
                    
                    setSucessMessage(response.data.message)
                    setShowOTPForm(response.data.sent)
                    setTimeout(() => {
                        setSucessMessage(null)
                    }, 5000);
                    // setTimeout(()=>{
                    //     handleClose()
                    // }, 4000)
                    // setTimeout(()=>{
                        
                    //     logout()
                    // }, 6000)
                    
                }
                console.log(response.data)
                return (response.data)
            }catch(err:any){
                console.log(err)
                 formik.setErrors({
                    email: err.response.data.error, 
                });
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

            <Container component="main" >
                <Paper sx={{p:2,m:1, backgroundColor:isDarkMode?"none":theme.palette.primary.light}} elevation={3} >
                    
                                        <Typography variant="h5" component="h6" sx={{textAlign:"center"}}>
                                            Password Reset
                                        </Typography>
                                    
                <Box sx={
                    {

                        marginTop: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: 'column',
                    }}>
                    <Box component="form" sx={{ mt: 1 }} onSubmit={formik.handleSubmit}>
                     
                         <TextField
                         
                          slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            placeholder="Enter email to reset password"
                            fullWidth
                            margin="normal"
                            id="email"
                            name="email"
                            label="Email"
                            type="email"
                            value={formik.values.email}
                            onChange={(e)=>{
                                setSucessMessage(null)
                                setCode(new Array(5).fill(""))
                                formik.setFieldValue("email", e.target.value)
                            }}
                            error={Boolean(formik.errors.email)}
                            helperText={formik.errors.email}
                        >
                        </TextField>

     
   
                        <Button variant="contained" disableElevation sx={{display:"block",margin:"1px auto", textAlign:"center" }} type="submit">Reset Password</Button>
                    </Box>
                </Box>
                {sucessMessage&&
                <Box sx={{width:"100%"}}>
                    <Typography color="error" sx={{display:"block", margin:"1px auto", width:"100%", textAlign:"center"}}>
                        {sucessMessage} 
                    </Typography>
                </Box>
                    
                }
                {showOTPForm&&

                    <Box sx={{display:"block", margin:3 , textAlign:"center"}}>
                    <Box>
                        <Typography variant="h6" gutterBottom color="success" sx={{}}>
                            Enter the OTP sent to Your E-mail 
                        </Typography>
                    </Box>
                    <div >
                        
                        <Stack  component="form"sx={{justifyContent:"center"}} direction="row" spacing={2}>
                            {code.map((item, index)=>{
                                return(
                                    <React.Fragment key={index}>
                                        <Item >
                                            <Input 
                                                autoFocus= {index === 0}
                                                inputRef={(el) => {
                                                        inputRefs.current[index] = el;
                                                }} value={item} 
                                                onChange={(e)=>{handleChange(index, e)}} 
                                                size="small" 
                                                disableUnderline  
                                                sx={{color:"blue",width:"35px" , m:0, p:0, '& .MuiInput-input':{textAlign:"center !important",fontSize:"1.9rem" }}}/>
                                        </Item>
                                                
                                    </React.Fragment>
                                    )
                            })}
                            {isLoading && 
                                <Typography sx={{pt:2}} component="span">
                                    <ProgressSign/>
                                </Typography>}
                                                  
                                               
                    </Stack>
                    {errorA && <Box><Typography color="red" component="span">{errorA}</Typography></Box>}
                      
                                                
                    </div>
                </Box>
                
                }
            
                    
                                        <ResetPasswordDiag setOpen={setOpen} handleClose={handleCloseDiag} open={open}/>
                    
                
                </Paper>
            </Container>
        </>
    )

};

export default ForgotPassword