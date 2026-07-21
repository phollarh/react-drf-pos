import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LinearIndeterminate from '../../progressSign/LinearIndeterminate';
import CategoryUpdateForm from './CategoryUpdateForm';
import { Chip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UpdateIcon from '@mui/icons-material/Update';


interface Server {
    id: number;
    name: string;
   
}

interface UpdateProductDialogueProps {
  handleOrderDelete:(id:number|undefined)=>Promise<void>;
  dataCRUD?: Server[];
  open: boolean;
  onSuccess:()=>Promise<any>;
  scroll: "body" | "paper" | undefined
  dataObject:Server | null
    handleClose: () => void
}

export default function UpdateCategoryDialogue({handleOrderDelete,onSuccess,dataObject,handleClose,open,scroll, dataCRUD}:UpdateProductDialogueProps) {

  const [name ,setName] = React.useState("")
  const [categoryId, setCategoryId] = React.useState<number>(0)
const [isLoading, setIsloading] = React.useState<boolean>(false)
  

    

 
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
  
      <Dialog
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        {isLoading && <LinearIndeterminate/>}
        <DialogTitle sx={{textAlign:"center"}} id="scroll-dialog-title">{dataObject?.id? "Update Category": "Create Category"}</DialogTitle>
        <DialogContent dividers={scroll === 'paper'}>
        
          
            <CategoryUpdateForm 
             dataObject={dataObject}
            handleOrderDelete={handleOrderDelete} 
            categoryId = {dataObject?.id}
            dataCRUD={dataCRUD}
            setIsLoading={setIsloading}
            name={dataObject?.name}
            onSuccess={onSuccess}
            onClose={()=>{handleClose()}}
            />
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
