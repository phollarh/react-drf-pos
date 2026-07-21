import {CssBaseline} from "@mui/material"
import PrimaryAppBar from "./templates/PrimaryAppBar";
import PrimaryDraw from "./templates/PrimaryDraw";
import SideMenu from "../components/PrimaryDraw/SideMenu";
import Main from "./templates/Main";
import CreateReceiptMainSection from "../components/Main/CreateReceiptMainSection";

const Products = () => {

  return(
    <>
        <CssBaseline/>
        <PrimaryAppBar/>
        <PrimaryDraw>
            <SideMenu open={false} />
        </PrimaryDraw>
        <Main>
            <CreateReceiptMainSection/>
        </Main>
    </>
  );
};

export default Products;
