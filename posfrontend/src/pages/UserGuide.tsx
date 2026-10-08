import {Box, CssBaseline, useMediaQuery} from "@mui/material"
import PrimaryAppBar from "./templates/PrimaryAppBar";
import HomeTemp from "./templates/HomeTemp";
import MainUserGuide from "../components/Main/MainUserGuide";
import PrimaryDraw from "./templates/PrimaryDraw";
import SideMenu from "../components/PrimaryDraw/SideMenu";

const UserGuide = () => {
    const below1000 = useMediaQuery("(max-width : 1000px)")
  return(
    <>
      <Box sx={{display:"flex"}}>
        <CssBaseline/>
        <PrimaryAppBar/>
         {!below1000 &&
            <PrimaryDraw>
                <SideMenu open={false} />
            </PrimaryDraw>
        }
        <Box sx={{flexGrow:1}}>
            <HomeTemp  >
               <MainUserGuide/>
            </HomeTemp>
        </Box>
        
      </Box>
    </>
  );
};

export default UserGuide;
