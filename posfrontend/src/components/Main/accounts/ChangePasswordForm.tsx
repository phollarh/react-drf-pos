import { useFormik } from "formik"
import "react-phone-input-2/lib/material.css";
import { Box, Button, Container, Paper, TextField, Typography, useTheme } from "@mui/material";
import axios from "axios";
import './ProfileForm.css'
import { useState } from "react";
import { useAuthServiceContext } from "../../../context/AuthContext";


interface passwordProps {
    handleClose: () => void
}


const ChangePasswordForm = ({handleClose}:passwordProps) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark"
    const [sucessMessage, setSucessMessage] = useState<null | string>(null)
    const {logout} = useAuthServiceContext()
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            current_password:"",
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
            const {current_password, new_password} = values;
            const apiValues = {
                "current_password": current_password,
                "new_password": new_password,
                }
            try{
                const response = await axios.patch('http://127.0.0.1:8000/accounts/api/user/change-password/',
                    apiValues,
                    {withCredentials:true}
                
                )
                if(response.status === 200){
                    setSucessMessage(response.data.message)
                    setTimeout(()=>{
                        handleClose()
                    }, 4000)
                    setTimeout(()=>{
                        
                        logout()
                    }, 6000)
                    
                }
                console.log(response.data)
                return (response.data)
            }catch(err:any){
                console.log(err)
                 formik.setErrors({
                    new_password: err.response.data.new_password, 
                    current_password:err.response.data.current_password,
                });
                throw err
            }
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
                            id="current_password"
                            name="current_password"
                            label="current password"
                            type="password"
                            value={formik.values.current_password}
                            onChange={formik.handleChange}
                            error={Boolean(formik.errors.current_password)}
                            helperText={formik.errors.current_password}
                        >
                        </TextField>
                            <TextField
                            fullWidth
                            margin="normal"
                            id="new_password"
                            name="new_password"
                            label="New Password"
                            type="password"
                            value={formik.values.new_password}
                            onChange={formik.handleChange}
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

                </Paper>
            </Container>
        </>
    )

};

export default ChangePasswordForm