import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MeasurementUpdateForm from './MeasurementUpdateForm';
import LinearIndeterminate from '../../progressSign/LinearIndeterminate';
import { Chip, useTheme } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AddLinkIcon from '@mui/icons-material/AddLink';
import UpdateIcon from '@mui/icons-material/Update';


interface Server {
    id: number;
    measurement_type: string;
    value: number;
    outlet_id:string;
}

interface UpdateProductDialogueProps {
  dataCRUD?: Server[];
  idDataCrud?:number;
  onSuccess: () => Promise<void>;
  outlet_id : string

}

export default function UpdateMeasurementDialogue({idDataCrud,dataCRUD,outlet_id, onSuccess}:UpdateProductDialogueProps) {
  const [open, setOpen] = React.useState(false);
  const [scroll, setScroll] = React.useState<DialogProps['scroll']>('paper');
  const [measurementType ,setMeasurementType] = React.useState("")
  const [value, setValue] = React.useState<number>(0)
  const [measurementId, setMeasurementId] = React.useState<number>(0)
const [isLoading, setIsloading] = React.useState<boolean>(false)
  
  const theme = useTheme();
  const handleClickOpen = (scrollType: DialogProps['scroll']) => {

     if (idDataCrud && dataCRUD){
        const found= dataCRUD.find((item)=>item.id === idDataCrud)
        if(found){

             setMeasurementType(found.measurement_type)
             setValue(found.value)
            setMeasurementId(found.id)
        }else{
             setMeasurementType("")
             setValue(0)
            setMeasurementId(idDataCrud)
        }
    }else{
        setMeasurementType("")
        setValue(0)
        setMeasurementId(0)
    }
    setOpen(true);
    setScroll(scrollType);
  };
 

  const handleClose = () => {
    setOpen(false);
  };

  const descriptionElementRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <React.Fragment>
        <Chip
        sx={{fontSize:"0.9rem", margin:"1px auto",color:theme.palette.primary.main, backgroundColor:theme.palette.primary.contrastText}}
        color={idDataCrud?"default":"default"}
        // label={idDataCrud? "View Details" : "Create New Measurement"}
        onClick={()=>{handleClickOpen('paper')}}
        icon={idDataCrud?<UpdateIcon/>:<AddLinkIcon />}
    />

      <Dialog
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        {isLoading && <LinearIndeterminate/>}
        <DialogTitle sx={{textAlign:"center"}} id="scroll-dialog-title">{idDataCrud? "Update Category": "Create Category"}</DialogTitle>
        <DialogContent dividers={scroll === 'paper'}>
        
          
            <MeasurementUpdateForm 
            outlet_id={outlet_id}
            measurementId = {measurementId}
            measurementType={measurementType}
            ItemValue={value}
            dataCRUD={dataCRUD}
            setIsLoading={setIsloading}
            onSuccess={onSuccess}
            onClose={handleClose}
            />
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
