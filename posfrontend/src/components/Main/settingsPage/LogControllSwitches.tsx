import { Box,Typography} from "@mui/material"
import PinRequestPopOver from "./PinRequestPopOver";
import { outletsDataProps, outletStaffDataProps, staffStatusProps } from "../../../@types/outletsNstaff-service";
import { UseoutletNstaffContext } from "../../../context/OutletNStaffsContext";
import { useAuthServiceContext } from "../../../context/AuthContext";

interface pinProps {
  
  Employee_id:string | undefined;
  outletStaff:outletStaffDataProps |null;
  setAssignedStaff?:React.Dispatch<React.SetStateAction<outletStaffDataProps | null>>
  outlet:outletsDataProps | null;
  staffStatus:staffStatusProps | undefined;
  setAssignMess?: React.Dispatch<React.SetStateAction<string | null>>;
  fetchReceipt ?: () => Promise<void>
}

export default function ControlledSwitches({outletStaff,setAssignMess,setAssignedStaff,outlet,staffStatus,Employee_id,fetchReceipt}:pinProps) {
  const {filterOption,setFilterOption} = UseoutletNstaffContext()
  const isOnSalesReceipt = location.pathname === "/sales_receipts"
  const {activeOutletId} = useAuthServiceContext();
  

  return (
    <>
      {
        isOnSalesReceipt ? 
        (
           <Box sx={{display:"flex",mt:1, justifyContent:"center"}}>
                {/* <LoginIcon sx={{p:0,mt:1.2, marginRight: "6px", fontSize: "20px" }} />
                <LogoutIcon sx={{p:0,mt:1.2, marginRight: "6px", fontSize: "20px" }} /> */}
                {!staffStatus || staffStatus.assigned === false ?
                  (<Typography variant="body2" sx={{fontFamily:"sans-serif",  mt:1.2, p: 0, textTransform: "capitalize" }}>
                      Please Assign to continue
                  </Typography>):
                  ( <Typography variant="body2" sx={{fontFamily:"sans-serif",  mt:1.2, p: 0, textTransform: "capitalize" }}>
                      Unassign
                    </Typography>
                  )
                }
                <PinRequestPopOver fetchReceipt={fetchReceipt} setAssignMess={setAssignMess} outlet={null}  filterOption="" setFilterOption={()=>{setFilterOption("")}} setAssignedStaff={setAssignedStaff} outletStaff={outletStaff} staffStatus={staffStatus} Employee_id={undefined} />
        </Box>
        ):
        (
          <>
              
        {outletStaff&&
          <Box sx={{display:"flex",mt:1, justifyContent:"center"}}>
                {/* <LoginIcon sx={{p:0,mt:1.2, marginRight: "6px", fontSize: "20px" }} />
                <LogoutIcon sx={{p:0,mt:1.2, marginRight: "6px", fontSize: "20px" }} /> */}
                {staffStatus?.is_active === false?
                  (<Typography variant="body2" sx={{fontFamily:"sans-serif",  mt:1.2, p: 0, textTransform: "capitalize" }}>
                      Log in
                  </Typography>):
                  ( <Typography variant="body2" sx={{fontFamily:"sans-serif",  mt:1.2, p: 0, textTransform: "capitalize" }}>
                      Log out
                    </Typography>
                  )
                }
                <PinRequestPopOver outlet={null} filterOption="" setFilterOption={()=>{setFilterOption("")}} outletStaff={outletStaff} staffStatus={staffStatus} Employee_id={Employee_id} />
        </Box>
        }
        {outlet &&

            <Box sx={{display:"flex",mt:1, justifyContent:"center"}}>
                  {String(activeOutletId) === String(outlet.id)?
                  (<Typography variant="body2" sx={{fontFamily:"sans-serif",  mt:1.2, p: 0, textTransform: "capitalize" }}>
                      Deactivate Outlet
                  </Typography>):
                  ( <Typography variant="body2" sx={{fontFamily:"sans-serif",  mt:1.2, p: 0, textTransform: "capitalize" }}>
                      Activate Outlet
                    </Typography>
                  )
                }
                
                <PinRequestPopOver setFilterOption={setFilterOption} filterOption={filterOption} outlet={outlet} outletStaff={outletStaff} staffStatus={staffStatus} Employee_id={Employee_id} />
        </Box>
   
        }
          </>
        )
         
      }
        
        
    </>
      
  );
}

   
