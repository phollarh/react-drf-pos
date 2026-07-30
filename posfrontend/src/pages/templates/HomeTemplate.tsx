import { Box } from "@mui/material";
import { ReactNode } from "react";

type Props = {
    children: ReactNode;
}

const Main: React.FC<Props> = ({ children }) => {
   
    return (
        <Box sx={{
            flexGrow: 1,
        }}>

            {children}
        </Box>
    )
}
export default Main