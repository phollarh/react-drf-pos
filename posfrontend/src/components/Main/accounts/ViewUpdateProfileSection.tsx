import {
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    Typography,
    useTheme,
    Container,
    Grid,
    Card,
    CardContent,
    Button,
    Toolbar,
    Paper
} from "@mui/material";
import useCrud from "../../../hooks/useCrud";
import React, { useCallback, useEffect, useState } from "react";
import ProductionQuantityLimitsOutlinedIcon from '@mui/icons-material/ProductionQuantityLimitsOutlined';
import UpdateProductDialogue from "../ProductLists/UpdateProductDialogue";
import useAxiosWithInterceptor from "../../../helper/jwtinterceptor";
import ProductSearchForm from "../ProductLists/ProductSearchForm";
import ProfileForm from "./ProfileForm";
import ProfilePicMenu from "./ProfilePicMenu";
import ChangePasswordDiag from "./ChangePasswordDiag";

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
             const response= await jwtAxios.get('http://127.0.0.1:8000/accounts/api/profile/', {withCredentials:true})
             setData(response.data)
             return response.data
        }catch(err:any){
            console.log(err)
        }
    }
   const handleImageUpload = async (file: File) => {
             const formData = new FormData();
        formData.append("image", file);
        console.log(formData)

        try {
            const response = await jwtAxios.patch(
                "http://127.0.0.1:8000/accounts/api/profile/",
                formData,
            
                { 
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials:true
             }
            );

            setData(response.data); 
            console.log(formData)
            console.log(response.data)
            return response.data
        } catch (err) {
          console.log(err);
        }
    };
   



    useEffect(()=>{

        getProfile()
    }, [])

    useEffect(() => {
           
            console.log(data)
    }, [data]);

 
    

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