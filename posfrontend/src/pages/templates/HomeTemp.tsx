import { Box,} from "@mui/material"
import React, { ReactNode,} from "react"
import { useTheme } from "@mui/material/styles";


type Props = {
    children: ReactNode

}



const HomeTemp: React.FC<Props> = ({ children }) => {
    const theme = useTheme()
    const [, setDrawerOpen] = React.useState(true);
    React.useEffect(() => {
                    const handleDrawerToggle = (e: Event) => {
                    const customEvent = e as CustomEvent;
                    setDrawerOpen(customEvent.detail);
                    };
                    window.addEventListener("drawer-toggle", handleDrawerToggle);
                    return () => window.removeEventListener("drawer-toggle", handleDrawerToggle);
        }, []);
    
    
   
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