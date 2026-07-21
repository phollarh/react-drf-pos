import { useFormik } from "formik"
import { Link, useNavigate } from "react-router-dom"
import { useAuthServiceContext } from "../context/AuthContext";
import { Box, Button, Container, Paper, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";

interface loginProps{
    showFormDetails:boolean;
     handleFormClickOnBigScreen: (value: string) => void;
    showForm: (input: string | null | undefined) => void;
}

const Login = ({showFormDetails, handleFormClickOnBigScreen, showForm}:loginProps) => {
    
    const { login } = useAuthServiceContext();
    const navigate = useNavigate();
    const theme = useTheme()
    const isDarkMode = theme.palette.mode === "dark"
    const below1200 = useMediaQuery("(max-width : 1200px)");
    const below720 = useMediaQuery("(max-width:750px)")
    const below460 = useMediaQuery("(max-width:460px)")
    
    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validate: (values) => {
            const errors: Partial<typeof values> = {};
            if (!values.email) {
                errors.email = "Required"
            }
            if (!values.password) {
                errors.password = "password field can not be empty"
                console.error(formik.touched.password, formik.errors.password)
            }
            return errors;
        },
        onSubmit: async (values) => {
            const { email, password } = values;
            const status = await login(email, password);
            console.log("LOGIN RESPONSE:", status);
            if (status === 401) {
                console.log("Unauthorized")
                formik.setErrors({
                    // username: "Invalid Username or password",
                    password: "Invalid Username or password"
                })

            } else {
                navigate("/");
            }
            // if (status) {
            //     navigate("/testlogin")
            // }
        },
    })
    console.log('width',below720, below1200)
    return (
        <>

            <Box display={showFormDetails === false && below1200 ? "none" :"block"} position="absolute" 
            sx={{
                    margin:below1200?"10px":"5px",
                left:below460?10:below720?"30%":below1200?"50%":0, top:below1200?100:0
                // top:below720?below460?"0%":"5%":"auto", left:below720? below460?"5%":"20%":"auto",margin:"1px auto !important"
                
            }} 
            zIndex={2000} component="main" >
                <Paper elevation={4}  sx={
                    {

                        backgroundColor:isDarkMode?"black":theme.palette.primary.light,
                        borderRadius:5,
                        
                        marginTop:below1200?0: 8,
                        p:3,
                        textAlign:"center",
                        // display: "flex",
                        // alignItems: "center",
                        // justifyContent: "center",
                        // flexDirection: 'column',
                    }}>
                    <Typography
                        variant="h4"
                        noWrap
                        component="h1"
                        sx={{
                            fontWeight: 500,
                            pb: 2,
                            m:4
                        }}

                    >Sign in</Typography>
                    <Box component="form" sx={{ display: "flex", alignItems: "center", flexDirection: "column", mt: 1 }} onSubmit={formik.handleSubmit}>

                        <TextField
                            fullWidth
                            margin="normal"
                            id="email"
                            name="email"
                            label="email"
                            type="text"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={!!formik.touched.email && !!formik.errors.email}
                            helperText={formik.touched.email && formik.errors.email}
                        >



                        </TextField>

                        <TextField
                            margin="normal"
                            fullWidth
                            id="password"
                            name="password"
                            label="password"
                            type="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={!!formik.touched.password && !!formik.errors.password}
                            helperText={formik.touched.password && formik.errors.password}
                        >
                        </TextField>
                        <Button variant="contained" disableElevation sx={{ maxWidth: "50%", mt: 3, mb: 2 }} type="submit">Next</Button>
                    </Box>
                    <Link style={{textDecoration:"none"}} to="/forgot_password">
                        <Box >
                        <Typography> forgot Password?</Typography>
                    </Box>
                    </Link>
                    
                    {!below1200?
                        (
                            <Box margin={3} onClick={()=>{handleFormClickOnBigScreen("register")}} sx={{border:"none", cursor:"pointer"}} component="button">
                                <Typography component="span">No Account yet? Click  here to Register</Typography>
                            </Box>
                        ):
                        (
                            <Box margin={3} onClick={()=>{showForm('register')}} sx={{border:"none", cursor:"pointer"}} component="button">
                            <Typography component="span">No Account yet? Click  here to Register</Typography>
                            </Box>
                        )
                    }
                    
                </Paper>

            </Box>
        </>
    )

};

export default Login