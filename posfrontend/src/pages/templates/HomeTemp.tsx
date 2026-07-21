import { Box, Typography, useMediaQuery, styled } from "@mui/material"
import React, { ReactNode, useEffect, useState } from "react"
import { duration, easing, useTheme } from "@mui/material/styles";
import DrawToggle from "../../components/PrimaryDraw/DrawToggle"
import MuiDrawer from "@mui/material/Drawer"

type Props = {
    children: ReactNode

}



const HomeTemp: React.FC<Props> = ({ children }) => {
    const theme = useTheme()
    const [drawerOpen, setDrawerOpen] = React.useState(true);
    React.useEffect(() => {
                    const handleDrawerToggle = (e: Event) => {
                    const customEvent = e as CustomEvent;
                    setDrawerOpen(customEvent.detail);
                    };
                    window.addEventListener("drawer-toggle", handleDrawerToggle);
                    return () => window.removeEventListener("drawer-toggle", handleDrawerToggle);
        }, []);
    const drawerWidth = drawerOpen ? theme.primaryDraw.width : theme.primaryDraw.closed;
    
   
    return (
        <>
        <Box sx={{
            flexFlow:1,
            // width:`calc(100vw - ${drawerWidth}px)`,
            mt: `${theme.primaryAppBar.height}px`,
             overflowY:"auto",
             overflowX:"hidden",
             height: `calc(100vh - ${theme.primaryAppBar.height}px)`,
             }}>
            {children}
        </Box>
            
        </>)
}
export default HomeTemp