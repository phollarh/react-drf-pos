import { useFormik } from "formik"
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import { Box, Button, Container, Paper, TextField,useTheme } from "@mui/material";
import axios from "axios";
import './ProfileForm.css'

interface dataProps{
    "email":string;
    "first_name":string;
    "last_name":string;
    "phone_number":string;
    "image": string
}
interface dataPropsB{
    data:dataProps | null
}


const ProfileForm = ({data}:dataPropsB) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark"
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            email:data?.email|| "",
            first_name:data?.first_name|| "",
            last_name:data?.last_name || "",
            phone_number:data?.phone_number || "",
            image:null as File | null

        },
        validate: (values) => {
            const errors: Partial<typeof values> = {};
            if (!values.email) {
                errors.email = "Required"
            }
  
            return errors;
        },
        onSubmit: async (values) => {
            const {first_name, last_name, phone_number} = values;
            const apiValues = {
                "phone_number": phone_number,
                "first_name": first_name,
                "last_name":last_name
                }
            try{
                const response = await axios.put('http://127.0.0.1:8000/accounts/api/profile/',
                    apiValues,
                    {withCredentials:true}
                
                )
                console.log(response.data)
                return (response.data)
            }catch(err:any){
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
                            disabled
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
                                marginTop: "16px",
                                marginBottom: "8px",
                                background:"transparent"
                            }}
                            />


                        </div>
                        
   
                        <Button variant="contained" disableElevation sx={{display:"block",margin:"1px auto", textAlign:"center" }} type="submit">Update</Button>
                    </Box>
                </Box>
                </Paper>
            </Container>
        </>
    )

};

export default ProfileForm