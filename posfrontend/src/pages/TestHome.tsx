import {Box, CssBaseline, Typography} from "@mui/material"
import PrimaryAppBar from "./templates/PrimaryAppBar";
import PrimaryDraw from "./templates/PrimaryDraw";
import SideMenu from "../components/PrimaryDraw/SideMenu";
import HomeTemp from "./templates/HomeTemp";
import HomeMainSection from "../components/Main/HomeMainSection";

const HomeTest = () => {

  return(
    <>
        <Box sx={{display:"flex"}}>
            <CssBaseline/>
            <Box sx={{display:"block"}}>
                <PrimaryAppBar/>
            </Box>
            
        
        <Box sx={{backgroundColor:"red"}}>
            <Typography>
                Hi
            </Typography>

        </Box>
        <Box sx={{flexGrow:1, backgroundColor:"blueviolet"}}>
            <Typography>
                Hello
            </Typography>
        </Box>
        </Box>
        



    </>
  );
};

export default HomeTest;
