import {Box, CssBaseline} from "@mui/material"
import PrimaryAppBar from "./templates/PrimaryAppBar";
import PrimaryDraw from "./templates/PrimaryDraw";
import SideMenu from "../components/PrimaryDraw/SideMenu";
import Main from "./templates/Main";
import MainPastReceipts from "../components/Main/MainPastReceipts";


const PastReceipt = () => {

  return(
    <>
    <Box display="flex">
        <CssBaseline/>
        <PrimaryAppBar/>
        <PrimaryDraw>
            <SideMenu open={false} />
        </PrimaryDraw>
        <Main>
            <MainPastReceipts/>
        </Main>
    </Box>
        
    </>
  );
};

export default PastReceipt;
