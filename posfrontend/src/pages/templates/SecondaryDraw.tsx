import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";


type SecondaryDrawProps = {
    children: React.ReactNode;
    showReceiptDetaills:boolean;
};
const SecondaryDraw = ({ children,showReceiptDetaills }: SecondaryDrawProps) => {
    const theme = useTheme()
    const below720 = useMediaQuery("(max-width: 720px)")
    const isBelow750 = useMediaQuery("(max-width : 750px)")
    const isOnSalesReceipt = location.pathname === "/sales_receipts";
    const isOnsettings = location.pathname === "/settings";


    let width;
    console.log(showReceiptDetaills)

    if (below720 && !isOnSalesReceipt) {
        width = "100%";
    } else if (!showReceiptDetaills && isOnSalesReceipt) {
        
        width = "85%";
        
    } else if (showReceiptDetaills === true && isOnSalesReceipt){
        width="15%"
    }
    else {
        width = "auto";
    }
    console.log(isBelow750, width, '.......................')
    return (
        <Box sx={{
            mt: `${theme.primaryAppBar.height}px`,
            width:isOnsettings && isBelow750? "100%":width,
            // !showReceiptDetaills?
            // "15%":"85%"
            // :"auto",
            transition:"width 0.3s ease-in-out",
            minWidth:isOnsettings && isBelow750? undefined:isOnsettings?theme.SecondaryDraw.width:undefined,
            height: `calc(100vh - ${theme.primaryAppBar.height}px)`,
            borderRight: `1px solid ${theme.palette.divider}`,
            overflow: "hidden"
        }}>
            {children}

        </Box>
    )
}
export default SecondaryDraw