import {
    Box,
    Typography,
    useTheme,
    Container,
    Paper
} from "@mui/material";
import React, {useEffect} from "react";
import useAxiosWithInterceptor from "../../../helper/jwtinterceptor";
import ProfileForm from "./ProfileForm";
import ProfilePicMenu from "./ProfilePicMenu";
import ChangePasswordDiag from "./ChangePasswordDiag";
import { BASE_URL_ACCOUNT } from "../../../congif";
import { useAuthServiceContext } from "../../../context/AuthContext";

interface dataProps{
    "email":string;
    "first_name":string;
    "last_name":string;
    "phone_number":string;
    "image": string
}



const ViewUpdateProfileSection = () => {
    const theme = useTheme();
    const [drawerOpen, setDrawerOpen] = React.useState(true);
    const jwtAxios = useAxiosWithInterceptor();
    const isDarkMode = theme.palette.mode === "dark"
   const {isLoggedIn, authLoading} = useAuthServiceContext();
    React.useEffect(() => {
                const handleDrawerToggle = (e: Event) => {
                const customEvent = e as CustomEvent;
                setDrawerOpen(customEvent.detail);
                };
                window.addEventListener("drawer-toggle", handleDrawerToggle);
                return () => window.removeEventListener("drawer-toggle", handleDrawerToggle);
    }, []);

    
    const drawerWidth = drawerOpen ? theme.primaryDraw.width : theme.primaryDraw.closed;
    const [data, setData] = React.useState<dataProps | null>(null)

    const getProfile =async ()=>{
        try{
             const response= await jwtAxios.get(`${BASE_URL_ACCOUNT}/profile/`, {withCredentials:true})
             setData(response.data)
             return response.data
        }catch(err:any){
            throw err.response
        }
    }
   const handleImageUpload = async (file: File) => {
             const formData = new FormData();
        formData.append("image", file);
        

        try {
            const response = await jwtAxios.patch(
                `${BASE_URL_ACCOUNT}/profile/`,
                formData,
            
                { 
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials:true
             }
            );

            setData(response.data); 

            return response.data
        } catch (err : any) {
          throw err.response
        }
    };
   



    useEffect(()=>{
        if(!isLoggedIn || authLoading)return ;
        getProfile()
    }, [isLoggedIn, authLoading])

  
 
    

    return (
        <>
            <Container  sx={{width:`calc(100vw - ${drawerWidth}px)`, ml:`${drawerWidth}px`}}>
            <Box sx={{display:"flex" ,backgroundColor:isDarkMode?"none":theme.palette.primary.light,m:3,borderRadius:"10px", justifyContent:"space-between"}}>
                <Box>
                    <Typography sx={{p:3}} gutterBottom variant="h4">{`${data?.first_name.charAt(0).toUpperCase()}${data?.first_name.slice(1)}'s Profile`}</Typography>
                </Box>
                <Box></Box>
                <Box>
                    <ProfilePicMenu data={data}  onUpload={handleImageUpload}/>
                    
                </Box>
            </Box>
            <Box>
                <ProfileForm data={data} />
            </Box>
                <Paper sx={{m:3}} elevation={1}>
                    <Box>
                        <ChangePasswordDiag/>
                    </Box>
                </Paper>
                 

            </Container>

        </>
    )

};

export default ViewUpdateProfileSection