import { useFormik } from "formik"
import { useNavigate } from "react-router-dom"
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import { Box, Button, Container, Paper, TextField, Typography, useTheme } from "@mui/material";
import axios from "axios";
import "../ProfileForm.css"
import { useState } from "react";
import { useAuthServiceContext } from "../../../../context/AuthContext";
import useAxiosWithInterceptor from "../../../../helper/jwtinterceptor";

interface passwordProps {
    handleClose: () => void;
}


const RestPasswordForm = ({handleClose}:passwordProps) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark"
    const jwtAxios = useAxiosWithInterceptor();
    const [sucessMessage, setSucessMessage] = useState<null | string>(null)
    const [errMessage, setErrMessage] = useState<null | string>(null)
    const navigate = useNavigate();
    const {logout} = useAuthServiceContext()
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            
            new_password:"",
            confirm_password:"",

        },
        validate: (values) => {
            const errors: Partial<typeof values> = {};
            if (values.new_password !== values.confirm_password) {
                errors.new_password = "password does not match"
                errors.confirm_password = "password does not match"
            }
  
             return errors;
        },
        onSubmit: async (values) => {
            const { new_password, confirm_password} = values;
            if(new_password !== confirm_password ) return;
            setErrMessage(null)
            const apiValues = {
                
                "new_password": new_password,
                "token": localStorage.getItem("rst")
                }
            try{
                const response = await jwtAxios.patch('http://127.0.0.1:8000/accounts/api/user/reset_password/',
                    apiValues,
                    
                
                )
                if(response.status === 200){
                    localStorage.removeItem("rst")
                    setSucessMessage(response.data.message)
                    
                    setTimeout(()=>{
                        navigate("/login")
                    }, 3000)
                    // setTimeout(()=>{
                        
                    //     logout()
                    // }, 6000)
                    
                }
                console.log(response.data)
                return (response.data)
            }catch(err:any){
                console.log(err)
                setErrMessage(err.response.data.error)
                 formik.setErrors({
                    new_password: err.response.data.new_password, 

                    
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
                            fullWidth
                            margin="normal"
                            id="new_password"
                            name="new_password"
                            label="New Password"
                            type="password"
                            value={formik.values.new_password}
                            onChange={
                                (e)=>{ 
                                    setSucessMessage(null)
                                    formik.setFieldValue(
                                        "new_password",
                                        e.target.value
                                    );
                                }
                                
                                }
                            error={Boolean(formik.errors.new_password)}
                            helperText={formik.errors.new_password}
                        >
                        </TextField>
                        <TextField
                    
                            fullWidth
                            margin="normal"
                            id="confirm_password"
                            name="confirm_password"
                            label="Confirm Password"
                            type="password"
                            value={formik.values.confirm_password}
                            onChange={formik.handleChange}
                            error={!!formik.touched.confirm_password && !!formik.errors.confirm_password}
                            helperText={formik.touched.confirm_password && formik.errors.confirm_password}
                        >
                        </TextField>
                        
   
                        <Button variant="contained" disableElevation sx={{display:"block",margin:"1px auto", textAlign:"center" }} type="submit">Update Password</Button>
                    </Box>
                </Box>
                {sucessMessage&&
                <Box sx={{width:"100%"}}>
                    <Typography color="success" sx={{display:"block", margin:"1px auto", width:"100%", textAlign:"center"}}>
                        {sucessMessage} 
                    </Typography>
                </Box>
                    
                }
                 {errMessage&&
                <Box sx={{width:"100%"}}>
                    <Typography color="error" sx={{display:"block", margin:"1px auto", width:"100%", textAlign:"center"}}>
                        {errMessage} 
                    </Typography>
                </Box>
                    
                }
                
                </Paper>
            </Container>
        </>
    )

};

export default RestPasswordForm