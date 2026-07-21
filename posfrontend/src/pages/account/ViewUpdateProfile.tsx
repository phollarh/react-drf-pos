import {CssBaseline} from "@mui/material"

import HomeTemp from "../templates/HomeTemp";
import PrimaryAppBar from "../templates/PrimaryAppBar";
import PrimaryDraw from "../templates/PrimaryDraw";
import SideMenu from "../../components/PrimaryDraw/SideMenu";
import ViewUpdateProfileSection from "../../components/Main/accounts/ViewUpdateProfileSection";


const ViewUpdateProfile = () => {

  return(
    <>
        <CssBaseline/>
        <PrimaryAppBar/>
        <PrimaryDraw>
            <SideMenu open={false} />
        </PrimaryDraw>
        <HomeTemp>
            <ViewUpdateProfileSection/>
        </HomeTemp>
    </>
  );
};

export default ViewUpdateProfile;
