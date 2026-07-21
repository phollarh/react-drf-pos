import { useFormik } from "formik"
import { useNavigate } from "react-router-dom"
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import { Box, Button, Container, Paper, TextField, Typography, useTheme } from "@mui/material";
import axios from "axios";
import "../components/Main/accounts/ProfileForm.css"
import { useState } from "react";
import useAxiosWithInterceptor from "../helper/jwtinterceptor";
import { useAuthServiceContext } from "../context/AuthContext";
import { requestIdProps } from "../@types/auth-service";

import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';

interface passwordProps {
    handleClose: () => void;
    requestId: requestIdProps | null;
    purpose:string;
     formikS: any
     passTokenRef: React.MutableRefObject<string | null>
}


// function ControlledCheckbox() {
//   const [checked, setChecked] = React.useState(false);
//     console.log(checked)
//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setChecked(event.target.checked);
//   };

//   return (
//     <Checkbox
//     size="small"
//       checked={checked}
//       onChange={handleChange}
//       slotProps={{
//         input: { 'aria-label': 'controlled' },
//       }}
//     />
//   );
// }



const PassCodeForm = ({handleClose,purpose,requestId,formikS,passTokenRef}:passwordProps) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark"
    const jwtAxios = useAxiosWithInterceptor();
    const [sucessMessage, setSucessMessage] = useState<null | string>(null)
    const [errMessage, setErrMessage] = useState<null | string>(null)
    const navigate = useNavigate();
    const {logout,AuthenticateUserPass, authError} = useAuthServiceContext()
    const [checked, setChecked] = React.useState(false);
    console.log(checked)
    const handleCheckedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
    };
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            
            passcode:"",

        },
        validate: (values) => {
            const errors: Partial<typeof values> = {};
            if(!values.passcode){
                errors.passcode = "Required"
            }
            
  
             return errors;
        },
        onSubmit: async (values) => {
            try{
                const result= await AuthenticateUserPass(values.passcode,requestId,purpose,undefined, checked)
                passTokenRef.current = result.data.pass_token;

                // const token = result.pass_token
                // await formikS.setFieldValue(
                //     "passToken",
                //     token
                // );
                if(result.status === 200){
                    handleClose();
                }
                
                await formikS.submitForm();

            }catch (err) {
                console.log(err);
            }
          
         },
    })
    return (
        <>

           
                <Paper  sx={{p:2, backgroundColor:isDarkMode?"none":theme.palette.primary.light}} elevation={3} >
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
                            id="passcode"
                            name="passcode"
                            label="Enter Admin/Supervisor Passcode"
                            type="password"
                            value={formik.values.passcode}
                            onChange={
                                (e)=>{ 
                                    setSucessMessage(null)
                                    formik.setFieldValue(
                                        "passcode",
                                        e.target.value
                                    );
                                }
                                
                                }
                            error={Boolean(formik.errors.passcode)}
                            helperText={formik.errors.passcode}
                        >
                        </TextField>
                        
   
                        <Button variant="contained" color="error" disableElevation sx={{display:"block",margin:"1px auto", textAlign:"center", textTransform:"none" }} type="submit">Continue</Button>
                    </Box>
                </Box>
                <Box>
                    <Typography sx={{fontSize:"0.9rem"}} component="span">
                         <Checkbox
                    size="small"
                    checked={checked}
                    onChange={handleCheckedChange}
                    slotProps={{
                        input: { 'aria-label': 'controlled' },
                    }}
                    />
                          Trust this session for 15mins</Typography>
                </Box>
                {sucessMessage&&
                <Box sx={{width:"100%"}}>
                    <Typography color="success" sx={{display:"block", margin:"1px auto", width:"100%", textAlign:"center"}}>
                        {sucessMessage} 
                    </Typography>
                </Box>
                    
                }
                 {authError&&
                <Box sx={{width:"100%"}}>
                    <Typography color="error" sx={{display:"block", margin:"1px auto", width:"100%", textAlign:"center"}}>
                        {authError} 
                    </Typography>
                </Box>
                    
                }
                
                </Paper>
           
        </>
    )

};

export default PassCodeForm