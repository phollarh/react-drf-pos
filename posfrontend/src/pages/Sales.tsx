import {CssBaseline} from "@mui/material"
import PrimaryAppBar from "./templates/PrimaryAppBar";
import PrimaryDraw from "./templates/PrimaryDraw";
import SideMenu from "../components/PrimaryDraw/SideMenu";
import Main from "./templates/Main";
import MainSection from "../components/Main/MainSection";
import SalesSection from "../components/Main/SalesSection";

const Sales = () => {

  return(
    <>
        <CssBaseline/>
        <PrimaryAppBar/>
        <PrimaryDraw>
            <SideMenu open={false} />
        </PrimaryDraw>
        <Main>
            <SalesSection/>
        </Main>
    </>
  );
};

export default Sales;
