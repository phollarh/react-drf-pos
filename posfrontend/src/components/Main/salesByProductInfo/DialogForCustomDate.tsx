import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DateRangePicker from './DateRangePicker';
import { Dayjs } from "dayjs";
import { Box} from '@mui/material';
import { useLocation } from 'react-router-dom';

interface dialogProps{
    open : boolean;
    handleCloseDialog : ()=>void
    onClick?:()=>Promise<void>;
    onClickReceipt?:()=>void
    startDate:Dayjs | null;
    endDate:Dayjs | null
    onStartDateChange: (value: Dayjs | null) => void;
    onEndDateChange: (value: Dayjs | null) => void;
    
}
export default function DialogForCustomDate({ open,onClickReceipt, handleCloseDialog,startDate,endDate,onEndDateChange, onStartDateChange,onClick }:dialogProps) {
      const location = useLocation();
      const isOnPastReceipt = location.pathname === "/past_receipts";
      const IsOnSalesSummary = location.pathname === "/sales_summary";
      const isOnHome = location.pathname === "/";
      

  return (
    <React.Fragment>
      {/* <Button variant="outlined" onClick={handleClickOpen}>
        Open responsive dialog
      </Button> */}
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        aria-labelledby="responsive-dialog-title"
        PaperProps={{
    sx: {
      width:"50%",
      position: 'absolute',
      top: 24,  
      left:"40%",       
      margin: 0,
    },
  }}
      >
        <DialogContent sx={{width:"100%"}}>
          <DateRangePicker 
            
          startDate={startDate} 
          endDate={endDate} 
          // onClose={onClose}
          onEndDateChange={onEndDateChange} 
          onStartDateChange={onStartDateChange}
          />
        </DialogContent>
        <DialogActions sx={{m:0, p:0}}>
          <Box sx={{display:"block", margin:"1px auto"}}>
              <Button sx={{textTransform:"none"}} size='small' autoFocus onClick={handleCloseDialog}>
            Close
          </Button>
          {isOnHome&&
          <Button sx={{textTransform:"none"}} size='small' onClick={onClick} >
            Show Sales Summary
          </Button>
          }
          
          {isOnPastReceipt&&
              <Button sx={{textTransform:"none"}} size='small' onClick={onClickReceipt} autoFocus>
                Filter
              </Button>
          }
          {IsOnSalesSummary&&
              <Button sx={{textTransform:"none"}} size='small' onClick={onClick} >
                Filter
              </Button>
          }
          
          </Box>
            
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
