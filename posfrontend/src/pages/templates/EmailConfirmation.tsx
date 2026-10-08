import { useFormik } from "formik"
import { useNavigate } from "react-router-dom"

import { Box, Button, Input, Stack, TextField, Typography, useTheme } from "@mui/material";
import { useAuthServiceContext } from "../../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import useAxiosWithInterceptor from "../../helper/jwtinterceptor";
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import ProgressSign from "../../components/Progress";
import { BASE_URL_ACCOUNT } from "../../congif";


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



const EmailConfirmation = () => {
    const jwtAxios = useAxiosWithInterceptor()
    const navigate = useNavigate();
    const theme = useTheme() 
    const [isLoading, setIsloading] = useState(false)
    const isDarkMode = theme.palette.mode === "dark";
    const [timer, setTimer] = useState("5:00")
    const [code, setCode] = useState<string[]>( new Array(5).fill(""))
    const [user, setUser] = useState<null | {username:string, email:string, id:number}>(null)
    const [errorA,setErrorA] = useState<string | null>(null)
    const {userId,getUserDetails, logout } =  useAuthServiceContext()
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [timeLeft, setTimeLeft]  = useState (0)


    useEffect(()=>{
        const fetchUser = async () => {
        const res = await getUserDetails();
        
        setUser(res);}
    

        fetchUser();
    }, [userId])
    const startCooldown = (nextAvailableTime:string) => {
        const remainingSeconds = Math.max(
            0,
            Math.floor(
                (new Date(nextAvailableTime).getTime() - Date.now()) / 1000
            )
        );
        setTimeLeft(remainingSeconds);
    };


    const fetchOtpStatus = async () => {
        if (!user?.id) return;
        try{
            const res = await jwtAxios.get(
                `${BASE_URL_ACCOUNT}/user/otp_status/?id=${user.id}`,
                {withCredentials:true}
            );
            
            if (res.data.next_available_time) {
                startCooldown(res.data.next_available_time);
            }
            if(res.data?.is_verified){
                console.log('Email already verified')
                navigate('/')
            }
            return res.data
        }catch(err:any){
            
            throw err
        }
        
    };

    useEffect(() => {
        fetchOtpStatus();
    }, [user]);

    useEffect(()=>{
        if(timeLeft <= 0) return;
             const interval = setInterval(()=>{
            setTimeLeft((prev)=>{
                if(prev < 1){
                    clearInterval(interval);
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return ()=>clearInterval(interval)
        
       
        
    }, [ timeLeft > 0])
    
    useEffect(() => {
        if(timeLeft === 0) return
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const secondstrings = seconds < 10 ? `0${seconds}` : `${seconds}` 
        setTimer(
            `${String(minutes)}:${secondstrings}`
        );
    }, [timeLeft]);


    const handleAccountVeri =async (id:number|undefined, code: number) =>{
        setIsloading(true)
        setErrorA(null)
        if (!id)return;
        const payload = {
            "id":id,
            "code":code
        }
        
        try{
                 const response = await jwtAxios.post(`${BASE_URL_ACCOUNT}/activate/`,payload,{withCredentials:true}
        
             )
             if(response.status === 200){
                setIsloading(false)
                navigate("/")
             }
             return response.data

        }catch(err:any){
            setIsloading(false)
            setErrorA(err.response.data.error)
            console.log(err)
            throw err
        }

       
    }


    const handleChange = (index:number, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> )=>{
        setErrorA(null)
        
        const value = event.target.value
        if (!/^\d*$/.test(value)) {
            return;
        }

       const newCode =[...code]
       newCode[index] = value.slice(-1);
       setCode(newCode)
        if (event.target.value && index < code.length - 1) {
            
            inputRefs.current[index + 1]?.focus();
        }
        if(newCode.every(value=>value !== "")){
            const newCodeStr = newCode.join("")
            
            handleAccountVeri(user?.id, Number(newCodeStr)) 
        }

        
    }

       


    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            email: user?.email ?? "",

        },
        validate: (values) => {
            const errors: Partial<typeof values> = {};
            
            if (!values.email) {
                errors.email = "Required"
            }
           
            return errors;
        },
        onSubmit: async (values) => {
            if(timeLeft > 0) return;
            const { email,} = values;
            console.log
            ("valled.....")
            

            const payload={
                "email": email,
                "id":user?.id
            }
            try{
                
                if(!user?.id) return;
                
                const response = await jwtAxios.patch(`${BASE_URL_ACCOUNT}/user/otp_resend_email/`,
                    payload,
                    {withCredentials:true})

                    
                    startCooldown(response.data.next_available_time)
                    
                    return response.data
            }catch(err:any){
                
                formik.setErrors({
                    email: err.response.data.error
                });
                
                throw err.response
            }
            
            //   const status = await register(email,); 
              
                // if (status.status === 409) {
                //     formik.setErrors({
                //         email: "Invalid Email ",

                //     })
                // } 

            
        },
    })
    return (
        <>

            <Box  position="relative" 
                 sx={{
                    margin:'3px auto',
                    display:"block",
                    width:{xs:"90%",sm:"50%", md:"40%",}
                }} 
            >
                <Paper elevation={4}  sx={
                    {

                        backgroundColor:isDarkMode?"black":theme.palette.primary.light,
                        borderRadius:5,
                        
                       
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
                            fontSize:{xs:"1.3rem"},
                            fontWeight: 500,
                            pb: 2
                        }}

                    >Confirm Your Email</Typography>
                    <Box component="form" sx={{width:"100%", display: "flex", alignItems: "center", flexDirection: "column", mt: 1 }} onSubmit={formik.handleSubmit}>
                        <Typography sx={{fontSize:{md:"20px", xs:"15px"}}} component="h2"> Please check Your Inbox to complete Your Registration, Did not receive Code? 
                            <Typography sx={{fontWeight:700}} component="span"> Check Your Spam Folder</Typography>
                        </Typography>
                        <div>
                            <Stack  component="form" direction="row" spacing={2}>
                               {code.map((item, index)=>{
                                return(
                                    <>
                                    <Item >
                                            <Input 
                                            autoFocus= {index === 0}
                                            inputRef={(el) => {
                                                inputRefs.current[index] = el;
                                            }} value={item} onChange={(e)=>{handleChange(index, e)}} 
                                            size="small" 
                                            disableUnderline  
                                            sx={{color:"blue",width:"35px" , m:0, p:0, '& .MuiInput-input':{textAlign:"center !important",fontSize:"1.9rem" }}}/>
                                    </Item>
                            
                                    </>
                                )
                               })}
                               {isLoading && <Typography sx={{pt:2}} component="span">
                                     <ProgressSign/>
                               </Typography>}
                              
                           
                            </Stack>
                            {errorA && <Box><Typography color="red" component="span">{errorA}</Typography></Box>}
                            <Paper sx={{mt:2, width:"100%"}} elevation={1}>
                               <TextField
                               size="small"
                                sx={{height:40, "& .MuiOutlinedInput-notchedOutline":{border:"none !important" ,height:"50px !important" },
                                    "& .MuiOutlinedInput-input":{fontSize:"1.4rem !important"}
                                }}
                                fullWidth
                                margin="normal"
                                id="last_name"
                                name="email"
                                label="Email"
                                type="email"
                                value={formik.values.email}
                                onChange={(e)=>{ 
                                    setErrorA(null)
                                    formik.setFieldValue(
                                        "email",
                                        e.target.value
                                    );
                                }}
                                error={Boolean(formik.errors.email)}
                                helperText={formik.errors.email}
                                                        
                            >
                            </TextField>
                            </Paper>
                            
                        </div>
                        <Box mt={3} sx={{cursor:timeLeft > 0 ? "not-allowed":"pointer"}}>
                                <Button disabled={timeLeft > 0 ?true:false} variant="contained" disableElevation sx={{textTransform:"none", maxWidth: "100%", mt: 1, mb: 2 }} type="submit">Resend Link</Button>
                        </Box>
                        
                    </Box>

                    {timeLeft > 0 &&
                        
                        <Typography color="error" component="div">
                        wait {timer} before requesting another code
                        </Typography>
                       
                    
                    }
                        
     
                    <Box  margin={1} sx={{border:"none", cursor:"pointer"}}
                         onClick={()=>{logout()}} 
                         component="button">
                            <Typography component="span">Log out</Typography>
                    </Box>
                </Paper>
            </Box>
        </>
    )

};

export default EmailConfirmation