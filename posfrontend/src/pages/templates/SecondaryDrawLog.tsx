import { Box,useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";


type SecondaryDrawProps = {
    children: React.ReactNode;
    isLoggedIn: boolean
};
const SecondaryDrawLog = ({ children, isLoggedIn}: SecondaryDrawProps) => {
    const theme = useTheme()
    const below1200 = useMediaQuery("(max-width: 1200px)")
    

    
    return (
        <Box sx={{
            mt: `${theme.primaryAppBar.height}px`,
            position: below1200 ? "absolute" : "relative",
            top: 0,
            left: 0,
            width:below1200?"100%":isLoggedIn?"100%":"70%",
            height: `calc(100vh - ${theme.primaryAppBar.height}px)`,
            overflowY: "auto",
            zIndex: 1,
            borderRight: `1px solid ${theme.palette.divider}`,
            
        }}>
            {children}

        </Box>
    )
}
export default SecondaryDrawLog