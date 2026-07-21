import { Box, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";


type SecondaryDrawProps = {
    children: React.ReactNode;
};
const SecondaryDrawLog = ({ children}: SecondaryDrawProps) => {
    const theme = useTheme()
    const isDarkMode = theme.palette.mode === "dark"
    const below720 = useMediaQuery("(max-width: 720px)")
    const above720 = useMediaQuery("(min-width: 720px)")
    const below1200 = useMediaQuery("(max-width: 1200px)")
    const isOnSalesReceipt = location.pathname === "/sales_receipts";

    // let width;
    // console.log(showReceiptDetaills)

    // if (below720 && !isOnSalesReceipt) {
    //     width = "100%";
    // } else if (!showReceiptDetaills && isOnSalesReceipt) {
        
    //     width = "85%";
        
    // } else if (showReceiptDetaills === true && isOnSalesReceipt){
    //     width="15%"
    // }
    // else {
    //     width = "auto";
    // }
    // console.log(width)
    return (
        <Box sx={{
            mt: `${theme.primaryAppBar.height}px`,
            position: below1200 ? "absolute" : "relative",
            top: 0,
            left: 0,
            width:below1200?"100%":"70%",
            height: `calc(100vh - ${theme.primaryAppBar.height}px)`,
            overflow: "hidden",
            zIndex: 1,
            // transition:"width 0.3s ease-in-out",
            // minWidth:!below720?`${theme.SecondaryDraw.width}px`:"auto",
            
            borderRight: `1px solid ${theme.palette.divider}`,
            
        }}>
            {children}

        </Box>
    )
}
export default SecondaryDrawLog