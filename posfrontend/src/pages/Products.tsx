import {CssBaseline} from "@mui/material"
import PrimaryAppBar from "./templates/PrimaryAppBar";
import PrimaryDraw from "./templates/PrimaryDraw";
import SideMenu from "../components/PrimaryDraw/SideMenu";
import Main from "./templates/Main";
import MainSection from "../components/Main/MainSection";

const Products = () => {

  return(
    <>
        <CssBaseline/>
        <PrimaryAppBar/>
        <PrimaryDraw>
            <SideMenu open={false} />
        </PrimaryDraw>
        <Main>
            <MainSection/>
        </Main>
    </>
  );
};

export default Products;
