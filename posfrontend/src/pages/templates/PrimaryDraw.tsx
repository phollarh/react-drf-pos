import { Box, Typography, useMediaQuery, styled } from "@mui/material"
import React, { ReactNode, useEffect, useState } from "react"
import { duration, easing, useTheme } from "@mui/material/styles";
import DrawToggle from "../../components/PrimaryDraw/DrawToggle"
import MuiDrawer from "@mui/material/Drawer"
import { useLocation } from "react-router-dom";

type Props = {
    children: ReactNode

}

type ChildProps = {
    open: boolean;
};

type ChildElement = React.ReactElement<ChildProps>;

const PrimaryDraw: React.FC<Props> = ({ children }) => {
    const theme = useTheme()
    const below600 = useMediaQuery("(max-width:750px)")

    const [open, setOpen] = useState(!below600);
    const isDarkMode = theme.palette.mode === "dark"
    
    // N:B mixins are reusuable function in i code
    const openedMixin = () => ({
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
        }),
        overflowX: "hidden",
        width: theme.primaryDraw.width
    });

    const closedMixin = () => ({
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
        }),
        overflowX: "hidden",
        width: theme.primaryDraw.closed
    });

    const Drawer = styled(MuiDrawer, {})(({ theme, open }) => ({
        width: theme.primaryDraw.width,
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        ...(open && {
            ...openedMixin(),
            "& .MuiDrawer-paper": openedMixin(),
        }),
        ...(!open && {
            ...closedMixin(),
            "& .MuiDrawer-paper": closedMixin(),
        }),
    }));

    useEffect(() => {
        setOpen(!below600)

    }, [below600])

    const handleDrawerOpen = () => {
        setOpen(true);
        window.dispatchEvent(new CustomEvent("drawer-toggle", { detail: true }));
    };

    const handleDrawerClose = () => {
        setOpen(false);
        window.dispatchEvent(new CustomEvent("drawer-toggle", { detail: false }));
        
    };

    return (
        <>
            <Drawer open={open} variant={!below600 ? "permanent" : "temporary"}
                PaperProps={{
                    sx: {
                       // mt: `${theme.primaryAppBar.height}px`,
                        // height: `calc(100vh - ${theme.primaryAppBar.height}px)`,
                        width: theme.primaryDraw.width,
                        // filter: isDarkMode ?,
                        backgroundColor:isDarkMode ?"none":`${theme.palette.primary.light}`

                    }
                }}
            >
                <Box>
                    <Box sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        p: 0,
                        width: open ? "auto" : "100%"
                    }}>
                        <DrawToggle
                            open={open}
                            handleDrawClosed={handleDrawerClose}
                            handleDrawOpen={handleDrawerOpen} />
                    </Box>
                    {React.Children.map(children, (child) => {
                        return React.isValidElement(child)
                            ? React.cloneElement(child as ChildElement, { open }) : child
                    })}
                </Box>

            </Drawer>
        </>)
}
export default PrimaryDraw