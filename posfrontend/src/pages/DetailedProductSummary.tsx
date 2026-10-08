import {Box, CssBaseline} from "@mui/material"
import PrimaryAppBar from "./templates/PrimaryAppBar";
import PrimaryDraw from "./templates/PrimaryDraw";
import SideMenu from "../components/PrimaryDraw/SideMenu";
import ProductSummary from "../components/Main/salesByProductInfo/ProductSummary";
import HomeTemp from "./templates/HomeTemp";


const DetailedProductSummary = () => {

  return(
    <>
    <Box sx={{display:"flex"}}>
        <CssBaseline/>
        <PrimaryAppBar/>
        <PrimaryDraw>
            <SideMenu open={false} />
        </PrimaryDraw>
        <Box sx={{flexGrow:1, width:"100%"}}>
            <HomeTemp >
               <ProductSummary/>
            </HomeTemp>
        </Box>
        
    </Box>
       
    </>
  );
};


export default DetailedProductSummary