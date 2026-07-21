import { useContext } from "react";

import { useTheme } from "@mui/material/styles";
import { Box, IconButton, Typography } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4"
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import { ColorModeContext } from "../../context/DarkModeContext";



const DarkModeSwitch = () => {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);
    return (
        <>
            <Box sx={{display:"flex",mt:1, justifyContent:"center"}}>
                <Brightness4Icon sx={{p:0,mt:1.2, marginRight: "6px", fontSize: "20px" }} />
                <Typography variant="body2" sx={{  mt:1.2, p: 0, textTransform: "capitalize" }}>
                {theme.palette.mode} mode here
                </Typography>
                <IconButton
                sx={{ mt: 0, p: 0, pl: 2 }}
                onClick={colorMode.toggleColorMode}
                color="inherit"
                >
                {theme.palette.mode === "dark" ? (
                    <ToggleOffIcon sx={{ fontSize: "2.5rem", p: 0 }} />
                ) : (<ToggleOnIcon sx={{ fontSize: "2.5rem" }} />

                )}

                </IconButton>
            </Box>
            

        </>
    )
}

export default DarkModeSwitch;