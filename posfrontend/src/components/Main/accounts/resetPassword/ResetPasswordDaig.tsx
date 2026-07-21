import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import ResetPasswordForm from './ResetPasswordForm';
interface resetpProps{
    open : boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleClose:()=>void
}

export default function ResetPasswordDiag({open,setOpen, handleClose}:resetpProps) {
  

//   const handleClickOpen = () => {
//     setOpen(true);
//   };



  return (
    <React.Fragment>
      {/* <Button sx={{display:"block",margin:"1px auto", color:"tomato"}} onClick={handleClickOpen}>
        Change Passoword
      </Button> */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        role="alertdialog"
      >
        <DialogTitle sx={{textAlign:"center"}} id="alert-dialog-title">
          {"Update Password"}
        </DialogTitle>
        <DialogContent>
          <ResetPasswordForm handleClose={handleClose} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
