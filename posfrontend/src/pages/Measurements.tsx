import {CssBaseline} from "@mui/material"
import PrimaryAppBar from "./templates/PrimaryAppBar";
import PrimaryDraw from "./templates/PrimaryDraw";
import SideMenu from "../components/PrimaryDraw/SideMenu";
import Main from "./templates/Main";
import MeasurementsMainSection from "../components/Main/MeasurementsMainSection";


const Measurements = () => {

  return(
    <>
        <CssBaseline/>
        <PrimaryAppBar/>
        <PrimaryDraw>
            <SideMenu open={false} />
        </PrimaryDraw>
        <Main>
            <MeasurementsMainSection/>
        </Main>
    </>
  );
};

export default Measurements;
