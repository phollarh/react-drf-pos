import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import SalesReceipt from './SalesReceipt';

interface productType{
    id?:number;
    user?:number;
    product_name:string;
    sold_in:string;
    cost_price: number;
    selling_price:number;
    stock_inventory:number;
    category:string

}
interface orderType  {
    id:number;
    product:productType;
    quantity:number;
    description?:string
    date:string;
    paid:boolean;
    sub_total:number

}
interface ServerReceipt {
    id: number;
    orders: orderType[];
    remarks?: string;
    date?: string;
    issued?:boolean;
    total?:number
    
}
interface ReceiptDialogueProps{
    handleClose:()=>void;
    open:boolean;
    receiptData:ServerReceipt[];
    handleClick:(id:number)=>Promise<void>;
    setDataCRUDReceipt:React.Dispatch<React.SetStateAction<ServerReceipt[]>>;
}
export default function ReceiptDialogue( {handleClose,open,receiptData,handleClick,setDataCRUDReceipt}:ReceiptDialogueProps) {
//   const [open, setOpen] = React.useState(false);

//   const handleClickOpen = () => {
//     setOpen(true);
//   };

//   const handleClose = () => {
//     setOpen(false);
//   };

  return (
    <React.Fragment>
      <Dialog
      hideBackdrop
        disableEscapeKeyDown
      disableEnforceFocus
      slotProps={{
        paper:{
          sx:{
              position:"absolute",
              top: 20,
              right: 20,
              margin: 0
          }
        }
      }}
        open={open}
        onClose={(event, reason) => {
          if (reason === "backdropClick") return;
          handleClose;
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        role="alertdialog"
      >
        <DialogTitle sx={{textAlign:"center"}} id="alert-dialog-title">
          Sales Receipt
        </DialogTitle>
        <DialogContent sx={{width:"100%", m:0,p:0}}>
          <SalesReceipt
          dataCRUD={receiptData} 
          handleClick={handleClick} 
          setDataCRUDReceipt={setDataCRUDReceipt}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Back</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
