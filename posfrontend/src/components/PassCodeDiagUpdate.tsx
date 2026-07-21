import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PassCodeForm from './PassCodeForm';
import PassCodeFormUpdate from './PassCodeFormUpdate';
import { requestIdProps } from '../@types/auth-service';

interface passcodeProps{
     formik: any;
     purpose:string;
     requestId:requestIdProps | null;
     open:boolean;
      handleDaigClose: () => void
      passTokenRef: React.MutableRefObject<string | null>
}

export default function PassCodeDiag({formik,requestId,open,passTokenRef,purpose, handleDaigClose}:passcodeProps) {


  return (
    <React.Fragment>
         {/* <Button onClick={handleDiagClickOpen}  size="small" color="error" variant="contained" disableElevation sx={{textTransform:"none",p:1, alignSelf: "center" }} >show</Button> */}
         
  
      <Dialog
      maxWidth="xs"
      
        open={open}
        onClose={handleDaigClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        role="alertdialog"
      >
        <DialogContent>
        
             <PassCodeFormUpdate
                    requestId={requestId}
                    purpose={purpose}
                    formikS={formik}
                    handleClose={handleDaigClose}
                    passTokenRef={passTokenRef}
                />
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
