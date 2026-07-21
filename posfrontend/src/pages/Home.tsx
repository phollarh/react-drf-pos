import {Box, CssBaseline} from "@mui/material"
import PrimaryAppBar from "./templates/PrimaryAppBar";
import PrimaryDraw from "./templates/PrimaryDraw";
import SideMenu from "../components/PrimaryDraw/SideMenu";
import HomeTemp from "./templates/HomeTemp";
import HomeMainSection from "../components/Main/HomeMainSection";

const Home = () => {

  return(
    <>
      <Box sx={{display:"flex"}}>
        <CssBaseline/>
        <PrimaryAppBar/>
        <PrimaryDraw>
            <SideMenu open={false} />
        </PrimaryDraw>
        <Box sx={{flexGrow:1}}>
            <HomeTemp >
               <HomeMainSection/>
            </HomeTemp>
        </Box>
        
      </Box>
    </>
  );
};

export default Home;
