import { useFormik } from "formik"
import "react-phone-input-2/lib/material.css";
import { Box, Button, Paper, TextField, Typography, useTheme } from "@mui/material";
import "../components/Main/accounts/ProfileForm.css"
import { useState } from "react";
import { useAuthServiceContext } from "../context/AuthContext";
import { requestIdProps } from "../@types/auth-service";
import Checkbox from '@mui/material/Checkbox';


interface passwordProps {
    passTokenRef: React.MutableRefObject<string | null>
    handleClose: () => void;
    handleDelete: () => Promise<any>;
    purpose:string;
    requestId: requestIdProps | null;
}


const PassCodeForm = ({handleClose,purpose, requestId, passTokenRef, handleDelete}:passwordProps) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark"
    const [sucessMessage, setSucessMessage] = useState<null | string>(null)
    const [, setErrMessage] = useState<null | string>(null)
    const {AuthenticateUserPass, authError} = useAuthServiceContext()
    const [checked, setChecked] = useState(false);

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
            const { passcode} = values;
            setErrMessage(null)
           try{
            
            const resp = await AuthenticateUserPass(passcode, requestId ,purpose, undefined, checked)
                if(resp.status === 200){
                    passTokenRef.current = resp.data.pass_token;
                    await handleDelete()
                    handleClose()
                }
           }catch(err:any){
            if(err){
                console.log(err)
            }
            
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
                        
   
                        <Button variant="contained" color="error" disableElevation sx={{display:"block",margin:"1px auto", textAlign:"center", textTransform:"none" }} type="submit">Delete</Button>
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