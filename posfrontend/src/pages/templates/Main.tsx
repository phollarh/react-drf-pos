import { Box, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ReactNode } from "react";

type Props = {
    children: ReactNode;
    showReceiptDetaills?:boolean;
}


const Main: React.FC<Props> = ({ children,showReceiptDetaills }) => {
    const theme = useTheme()
    const below720 = useMediaQuery("(max-width:720px)")
    const above720 = useMediaQuery("(min-width:720px)")
    const isOnSalesReceipt = location.pathname === "/sales_receipts";
    let width;

    if (below720 && !isOnSalesReceipt) {
        width = "100%";
    }else if(above720 && isOnSalesReceipt){
        width = "auto"
    
    } else if (!showReceiptDetaills && isOnSalesReceipt) {
        width="15%"
    } 
    else {
        width = "auto";
    }
    console.log(width, isOnSalesReceipt, "main..................")
    return (
        <Box sx={{
            flexGrow: 1,
            transition:"width 0.3s ease-in-out",
            // backgroundColor:theme.palette.primary.contrastText,
            mt: `${theme.primaryAppBar.height}px`,
            mx:0,
            width:width,
            p:0,
            minWidth:below720?"auto":`${theme.MainDrawWidth.width}px`,
            height: `calc(100vh - ${theme.primaryAppBar.height}px)`,
            overflow: "hidden"
        }}>
            {/* {[...Array(50)].map((_, i) => (
                <Typography key={i} paragraph>
                    {i + 1}
                </Typography>)
            )} */}
            {children}
        </Box>
    )
}
export default Main