import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import PassCodeForm from './PassCodeForm';
import { requestIdProps } from '../@types/auth-service';

interface passcodeProps{
      open:boolean;
      passTokenRef: React.MutableRefObject<string | null>
      handleClose : () => void;
     handleDelete: () => Promise<any>
      requestId: requestIdProps | null
      purpose:string
}

export default function PassCodeDiag({handleClose,passTokenRef,handleDelete,purpose,open, requestId}:passcodeProps) {
  // const [open, setOpen] = React.useState(false);

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  // const handleClose = () => {
  //   setOpen(false);
  // };

  return (
    <React.Fragment>
         {/* <Button onClick={handleClickOpen}  size="small" color="error" variant="contained" disableElevation sx={{textTransform:"none",p:1, alignSelf: "center" }} >Delete</Button> */}
         
  
      <Dialog
      maxWidth="xs"
      
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        role="alertdialog"
      >
        <DialogContent>
            <PassCodeForm passTokenRef={passTokenRef} purpose={purpose} requestId={ requestId} handleDelete={ handleDelete} handleClose={handleClose}/>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
