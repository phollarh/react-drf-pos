
import { UseoutletNstaffContext } from "../context/OutletNStaffsContext";
import { useEffect, useMemo, useState } from "react";
import useAxiosWithInterceptor from "../helper/jwtinterceptor";
import { BASE_URL_ACCOUNT } from "../congif";
import { useNavigate } from "react-router-dom";
import { useAuthServiceContext } from "../context/AuthContext";
import PrimaryAppBar from "./templates/PrimaryAppBar";
import {
    Box,
    Button,
    CssBaseline,
    MenuItem,
    Paper,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

type AuthorizerProps = 'admin'|'supervisor'|'staff'

const AuthorizationPage = () => {
    const jwtAxios = useAxiosWithInterceptor()
    const navigate = useNavigate()
    const {outletsData, staffData, getOutletStaff} =  UseoutletNstaffContext()
    const {activeOutletId} = useAuthServiceContext();
    const [staffSelect,setStaffSelect] = useState("")
    const [getoutlet, setGetOutlet] =useState("")
    // const [outletId, setOutletId] = useState(getoutlet)
    const [passCode,setPassCode] = useState("")
    const [passCodeErr,setPassCodeErr] = useState<null | string>(null)
    const [err,setErr] = useState<null | string>(null)
    const [error, setError] = useState<null | string>(null)
    const [authroizerSelect, setAuthroizerSelect] = useState<AuthorizerProps | "">("")
    
    
    // const getSession = localStorage.getItem("auth_session") || ""
    
    // const getRole = localStorage.getItem("role") || ""
    // useEffect(()=>{
    //     if(getSession && getRole === "admin" || getRole === "supervisor"){
    //         navigate("/")
    //     }
    // },[getSession,getRole])
    
    useEffect(()=>{
        if(activeOutletId){
            setGetOutlet(String(activeOutletId))
        }
        
    },[activeOutletId])
    const selectedOutletExists =useMemo(()=>
        outletsData.some((item)=>String(item.id) === getoutlet)
    ,[outletsData, getoutlet]) 
    const selectOption = selectedOutletExists ? getoutlet : ""
    console.log(activeOutletId, selectedOutletExists,selectOption)
    const handleAuthorize =async (event:React.FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        setError(null)
        setErr(null)
        setPassCodeErr(null)
        const payload = {
                "authorize_as":authroizerSelect,
                "outlet":getoutlet,
                "staff_id":staffSelect,
                "passcode":passCode
        }
        
    
        try{
            
            const response = await jwtAxios.post(`${BASE_URL_ACCOUNT}/user/pos_authorization/`
                , payload,
                {withCredentials:true}
            )
            console.log(response.data)
            if(response.status === 200 && response.data.role === "admin" || response.data.role === "supervisor"){
                // localStorage.setItem("auth_session", response.data.authSession)
                // localStorage.setItem("role", response.data.role)
                navigate("/")
            }else{
                navigate("/sales_receipts")
            }
            return response.data
        }catch(err:any){
            if(err.response?.data?.error_role){
                setErr(err.response?.data?.error_role)
            }

            setPassCodeErr(err.response?.data?.error_passcode)
            console.log(err.response)
            if(err.response.status === 409){
                setError(err.response?.data.error)
            }
        }finally{
            setTimeout(() => {
                setError(null)
            }, 100 * 100);
        }
            
    }
    useEffect(()=>{
       
        console.log(staffData)
        
    }, [staffData])
 return (
    <>
        <CssBaseline />
        <PrimaryAppBar />

        <Box
            sx={{
                minHeight: "100vh",
                px: 2,
                py: 4,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: (theme) =>
                    theme.palette.mode === "dark"
                        ? "linear-gradient(135deg, #121212 0%, #1d2433 100%)"
                        : "linear-gradient(135deg, #f5f7fa 0%, #e8eef7 100%)",
            }}
        >
            <Paper
                elevation={10}
                sx={{
                    width: "100%",
                    maxWidth: 480,
                    px: {
                        xs: 2.5,
                        sm: 4,
                    },
                    py: {
                        xs: 3,
                        sm: 4,
                    },
                    borderRadius: 4,
                    border: (theme) =>
                        `1px solid ${theme.palette.divider}`,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <Box
                        sx={{
                            width: 55,
                            height: 55,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            mb: 1.5,
                            boxShadow: 3,
                        }}
                    >
                        <LockOutlinedIcon />
                    </Box>

                    <Typography
                        variant="h5"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            textAlign: "center",
                        }}
                    >
                        POS Authorization
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                            textAlign: "center",
                        }}
                    >
                        Select your role and enter your passcode to continue
                    </Typography>
                </Box>

                <Box
                    component="form"
                    onSubmit={handleAuthorize}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <TextField
                        fullWidth
                        size="small"
                        id="authorizer"
                        select
                        name="authorizer"
                        label="Use POS As"
                        value={authroizerSelect}
                        error={Boolean(err)}
                        helperText={err}
                        onChange={(event) => {
                            setError(null);
                            setErr(null);
                            setStaffSelect("");

                            const authorizer =
                                event.target.value as AuthorizerProps;

                            setAuthroizerSelect(authorizer);
                        }}
                    >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="supervisor">
                            Supervisor
                        </MenuItem>
                        <MenuItem value="staff">Staff</MenuItem>
                    </TextField>

                    <Tooltip
                        placement="top"
                        title={
                            Boolean(activeOutletId)
                                ? "Please log in as admin or supervisor to change the active outlet"
                                : ""
                        }
                    >
                        
                        <Box component="span" sx={{ display: "block" }}>
                            <TextField
                                fullWidth
                                size="small"
                                disabled={
                                    // selectedOutletExists &&
                                    // getoutlet !== ""
                                    Boolean(activeOutletId)
                                }
                                id="outlet"
                                select
                                name="outlet"
                                label="Choose Outlet"
                                value={selectOption}
                                // error={Boolean(passCodeErr)}
                                // helperText={passCodeErr}
                                onChange={(event) => {
                                    if(activeOutletId){

                                    }
                                    setStaffSelect("");
                                    setGetOutlet(event.target.value);
                                    getOutletStaff(event.target.value);
                                }}
                                sx={{
                                    "& .MuiInputBase-root": {
                                        borderRadius: 2,
                                    },
                                    "& .Mui-disabled": {
                                        cursor: "not-allowed",
                                    },
                                }}
                            >
                                {outletsData.map((item) => (
                                    <MenuItem
                                        key={item.id}
                                        value={String(item.id)}
                                    >
                                        {item.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Tooltip>

                    {staffData.length > 0 && (
                        <Tooltip
                            placement="top"
                            title={
                                authroizerSelect === "admin"
                                    ? "Staff selection is not required when using the POS as admin"
                                    : ""
                            }
                        >
                            <Box component="span" sx={{ display: "block" }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    id="staffs"
                                    select
                                    name="staffs"
                                    label="Select Staff"
                                    value={staffSelect}
                                    disabled={
                                        authroizerSelect === "admin"
                                    }
                                    onChange={(event) => {
                                        setStaffSelect(event.target.value);
                                    }}
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            borderRadius: 2,
                                        },
                                    }}
                                >
                                    {staffData.map((staff) => (
                                        <MenuItem
                                            key={staff.Employee_id}
                                            value={staff.Employee_id}
                                        >
                                            {staff.username}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </Tooltip>
                    )}

                    {(staffSelect ||
                        authroizerSelect === "admin") && (
                        <TextField
                            fullWidth
                            required
                            size="small"
                            id="passcode"
                            name="passcode"
                            label="Enter Passcode"
                            type="password"
                            value={passCode}
                            error={Boolean(passCodeErr)}
                            helperText={passCodeErr}
                            inputProps={{
                                maxLength: 20,
                            }}
                            onChange={(event) => {
                                setPassCode(event.target.value);
                                setPassCodeErr(null);
                            }}
                            sx={{
                                "& .MuiInputBase-root": {
                                    borderRadius: 2,
                                },
                            }}
                        />
                    )}

                    {error && (
                        <Box
                            sx={{
                                px: 2,
                                py: 1.25,
                                borderRadius: 2,
                                bgcolor: (theme) =>
                                    theme.palette.mode === "dark"
                                        ? "rgba(244, 67, 54, 0.15)"
                                        : "error.lighter",
                                border: (theme) =>
                                    `1px solid ${theme.palette.error.main}`,
                            }}
                        >
                            <Typography
                                variant="body2"
                                color="error"
                                textAlign="center"
                            >
                                {error}
                            </Typography>
                        </Box>
                    )}

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={
                            !authroizerSelect ||
                            // !getoutlet ||
                            !passCode ||
                            (authroizerSelect !== "admin" &&
                                !staffSelect)
                        }
                        sx={{
                            mt: 1,
                            py: 1.2,
                            borderRadius: 2,
                            fontWeight: 700,
                            textTransform: "none",
                            boxShadow: 3,
                            transition:
                                "transform 0.2s ease, box-shadow 0.2s ease",
                            "&:hover": {
                                transform: "translateY(-1px)",
                                boxShadow: 6,
                            },
                        }}
                    >
                        Authorize and Continue
                    </Button>
                </Box>
            </Paper>
        </Box>
    </>
);
};

export default AuthorizationPage;
