import { useFormik } from "formik"
import { useNavigate } from "react-router-dom"
import { useAuthServiceContext } from "../context/AuthContext";
import { Box, Button,Paper, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";

interface registerProps {
    showFormDetailRegister:boolean;
    handleFormClickOnBigScreen: (value: string) => void;
     showForm: (input: string | null | undefined) => void
}
const Register = ({showFormDetailRegister, handleFormClickOnBigScreen, showForm}:registerProps) => {
    const { register } = useAuthServiceContext();
    const navigate = useNavigate();
    const theme = useTheme()
    const below1200 = useMediaQuery("(max-width : 1200px)");
    const isDarkMode = theme.palette.mode === "dark";
    const below720 = useMediaQuery("(max-width:750px)")
    const below460 = useMediaQuery("(max-width:460px)")
    const formik = useFormik({
        initialValues: {
            email: "",
            first_name:"",
            last_name:"",
            password: "",
            confirm_password:""
        },
        validate: (values) => {
            const errors: Partial<typeof values> = {};
            
            if (!values.email) {
                errors.email = "Required"
            }
            if (!values.password) {

                errors.password = "Required"

            }else {
               const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;


               
                if (!strongPassword.test(values.password) ){
                    errors.password = "Password must be at least 8 and include atleast one letters, numbers and character"
                }
                
                

            }
            
            if (!values.confirm_password) {
                errors.confirm_password = "Required"
            }
            if (
                    values.password &&
                    values.confirm_password &&
                    values.password !== values.confirm_password
                ) 
            {
                    errors.confirm_password = "Passwords do not match";
            }
            return errors;
        },
        onSubmit: async (values) => {
            const { email, password, first_name, last_name } = values;
            
              const status = await register(email, first_name, last_name, password); 
              
                if (status.status === 409) {
                    formik.setErrors({
                        email: "Invalid Email ",

                    })
                } else if (status.status === 401) {
                    console.log("Unauthorized")
                    formik.setErrors({
                    password: "Invalid Email or password"
                })
                } else if (status.status === 400) {
                    console.log("Email already exist, please log in instead")
                    formik.setErrors({
                    
                    email: "Email already exist, please log in instead"
                })
                } 
                else if (status.status === 201){
                 navigate("/login");
                }

            console.log("LOGIN RESPONSE:", status);
        },
    })
    return (
        <>

            <Box  display={showFormDetailRegister === false && below1200 ? "none" :"block"} position="absolute" 
                 sx={{
                    margin:below1200?"10px":"5px",
                    left:below460?10:below720?"30%":below1200?"50%":0, 
                    top:below1200?50:0
                }} 
                    zIndex={2000} component="main" >
                <Paper elevation={4}  sx={
                    {

                        backgroundColor:isDarkMode?"black":theme.palette.primary.light,
                        borderRadius:5,
                        
                        marginTop:below1200?0: 3,
                        p:3,
                        textAlign:"center",
                        // display: "flex",
                        // alignItems: "center",
                        // justifyContent: "center",
                        // flexDirection: 'column',
                    }}>
                    <Typography
                        variant="h5"
                        noWrap
                        component="h1"
                        sx={{
                            fontWeight: 500,
                            pb: 2
                        }}

                    >Sign up</Typography>
                    <Box component="form" sx={{width:"100%", display: "flex", alignItems: "center", flexDirection: "column", mt: 1 }} onSubmit={formik.handleSubmit}>

                        <TextField
                            autoFocus
                            fullWidth
                            margin="normal"
                            id="email"
                            name="email"
                            label="Email"
                            type="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={!!formik.touched.email && !!formik.errors.email}
                            helperText={formik.touched.email && formik.errors.email}
                        >



                        </TextField>
                        <TextField
                            autoFocus
                            fullWidth
                            margin="normal"
                            id="first_name"
                            name="first_name"
                            label="First Name"
                            type="text"
                            value={formik.values.first_name}
                            onChange={formik.handleChange}
                            error={!!formik.touched.first_name && !!formik.errors.first_name}
                            helperText={formik.touched.first_name && formik.errors.first_name}
                        >



                        </TextField>
                        <TextField
                            autoFocus
                            fullWidth
                            margin="normal"
                            id="last_name"
                            name="last_name"
                            label="Last Name"
                            type="text"
                            value={formik.values.last_name}
                            onChange={formik.handleChange}
                            error={!!formik.touched.last_name && !!formik.errors.last_name}
                            helperText={formik.touched.last_name && formik.errors.last_name}
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
                        <TextField
                            margin="normal"
                            fullWidth
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
                        <Button variant="contained" disableElevation sx={{ maxWidth: "50%", mt: 1, mb: 2 }} type="submit">Sign Up</Button>
                    </Box>
                    {!below1200?
                    (
                        <Box margin={1} sx={{border:"none", cursor:"pointer"}} onClick={()=>{handleFormClickOnBigScreen("login")}} component="button">
                            <Typography component="span">Have an account ?  Click  here to Sign in</Typography>
                        </Box>
                    ):
                    (
                        <Box margin={1} sx={{border:"none", cursor:"pointer"}} onClick={()=>{showForm("login")}} component="button">
                            <Typography component="span">Have an account ?  Click  here to Sign in</Typography>
                        </Box>
                    )
                    }

                </Paper>

            </Box>
        </>
    )

};

export default Register