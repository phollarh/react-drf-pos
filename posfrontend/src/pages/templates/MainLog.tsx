import { Box, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ReactNode, useState } from "react";

type Props = {
    children: ReactNode;
    showFormDetails:boolean;
    handleCloseForm:((input: string | undefined | null) => void);
    clickedOption: string | null | undefined;
    showFormDetailRegister: boolean
}


const Main: React.FC<Props> = ({ children,clickedOption,showFormDetails,showFormDetailRegister,handleCloseForm}) => {
    const theme = useTheme()
    const below720 = useMediaQuery("(max-width:720px)")
    const above720 = useMediaQuery("(min-width:720px)")
    const isOnSalesReceipt = location.pathname === "/sales_receipts";
    const below1200 = useMediaQuery("(max-width : 1200px)")
    const isDarkMode = theme.palette.mode === "dark"
    // const [showForm , setShowForm] = useState(false);

    // const handleCloseForm = ()=>{
    //     setShowForm(false)
    // }
    

    // if (below720 && !isOnSalesReceipt) {
    //     width = "100%";
    // }else if(above720 && isOnSalesReceipt){
    //     width = "auto"
    
    // } else if (!showReceiptDetaills && isOnSalesReceipt) {
    //     width="15%"
    // } 
    // else {
    //     width = "auto";
    // }
    
    return (
        <Box sx={{
            mt:below1200?"auto": `${theme.primaryAppBar.height}px`,
             position: below1200 ? "absolute" : "relative",
             
            // top: 0,
            // right:0,
            zIndex:showFormDetailRegister || showFormDetails ? theme.zIndex.appBar + 1:5,
            width:below1200?"100%": "30%",
            height:below1200?"100vh": `calc(100vh - ${theme.primaryAppBar.height}px)`,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor:isDarkMode?"auto": below1200
            ? "rgba(138, 162, 229, 0.15)" 
            : "#dbe6f0",

    // backdropFilter: below1300 ? "blur(6px)" : "none",
        }}>
            {below1200 && showFormDetails && (
                <Box
                    onClick={()=>{handleCloseForm(clickedOption)}}
                    sx={{
                        width:"100%",
                        height:"100vh",
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "#aba1a180",
                    zIndex:showFormDetails? theme.zIndex.appBar + 2 : 2,
                    cursor: "pointer",
                    }}
                />
                )}
                {below1200 && showFormDetailRegister && (
                <Box
                    onClick={()=>{handleCloseForm(clickedOption)}}
                    sx={{
                        width:"100%",
                        height:"100vh",
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "#aba1a180",
                    zIndex:showFormDetailRegister? theme.zIndex.appBar + 2 : 2,
                    cursor: "pointer",
                    }}
                />
                )}
        
            
                {children}
            
        </Box>
    )
}
export default Main