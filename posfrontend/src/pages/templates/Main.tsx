import { Box,useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ReactNode } from "react";

type Props = {
    children: ReactNode;
    showReceiptDetaills?:boolean;
    layout: "main" | "secondary";
}


const Main: React.FC<Props> = ({ children,showReceiptDetaills , layout}) => {
    const theme = useTheme()
    const below720 = useMediaQuery("(max-width:720px)")
    const below500 = useMediaQuery("(max-width:500px)")
    const above720 = useMediaQuery("(min-width:720px)")
    const isOnSalesReceipt = location.pathname === "/sales_receipts";
    let width;

    if(below500 && isOnSalesReceipt){
        width='100%'
    }else if
    (below720 && !isOnSalesReceipt) {
        width = "100%";
    }else if(above720 && isOnSalesReceipt){
        width = "60%"
    
    }
    // else if(below500 && isOnSalesReceipt){
    //     width='100%'
    // }
     else if (!showReceiptDetaills && isOnSalesReceipt) {
        width="15%"
    } 
    else {
        width = "auto";
    }
    
    return (
        <Box sx={{
            display:(isOnSalesReceipt && below500 && layout === "secondary")?"none":"auto",
            flexGrow: 1,
            transition:"width 0.3s ease-in-out",
            mt: `${theme.primaryAppBar.height}px`,
            mx:0,
            width:width,
            p:0,
            minWidth:below720?"auto":`${theme.MainDrawWidth.width}px`,
            height: `calc(100vh - ${theme.primaryAppBar.height}px)`,
            overflow: "hidden"
        }}>
            {children}
        </Box>
    )
}
export default Main