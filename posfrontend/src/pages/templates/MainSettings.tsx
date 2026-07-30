import { Box,useTheme } from "@mui/material";
import { ReactNode } from "react";

type Props = {
    children: ReactNode;
}

const MainSettings: React.FC<Props> = ({ children }) => {
    const theme= useTheme()
    return (
        <Box sx={{
            flexGrow: 1,
            mt: `${theme.primaryAppBar.height}px`,
            minWidth: `240px`,
            height: `calc(100vh - ${theme.primaryAppBar.height}px)`,
            overflow: "hidden"
        }}>

            {children}
        </Box>
    )
}
export default MainSettings