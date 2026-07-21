import * as React from 'react';
import Button from '@mui/material/Button';
import { styled, useTheme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';



interface dataProps{
    "email":string;
    "first_name":string;
    "last_name":string;
    "phone_number":string;
    "image": string
}
interface dataP{
    data : dataProps | null;

}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default function ProfilePicDiaglogue(data:dataP) {
  const [open, setOpen] = React.useState(false);
    const theme= useTheme()
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button disableElevation  sx={{p:0, m:0,color:theme.palette.primary.main, textTransform:"none"}} variant="text" onClick={handleClickOpen}>
        View Profile Picture
      </Button>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
         <Box>
                <img src={data.data?.image} alt="profile picture" 
                    style={{ 
                        width: 500, 
                        height: 500, 
                        borderRadius: "20%"
                     }}
                    />
         </Box>
        </DialogContent>
      </BootstrapDialog>
    </React.Fragment>
  );
}
