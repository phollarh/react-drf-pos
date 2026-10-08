import {
  Outlet,
} from "react-router-dom";
import OutletNstaffContextProvider from "../../context/OutletNStaffsContext";

const OutletContextLayout = () => {
  return (
    <OutletNstaffContextProvider>
      <Outlet />
    </OutletNstaffContextProvider>
  );
};
export default OutletContextLayout