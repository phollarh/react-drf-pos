import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import ProductUpdateForm from './ProductUpdateForm';
import LinearIndeterminate from '../../progressSign/LinearIndeterminate';
import { Server } from '../../../@types/server';




interface UpdateProductDialogueProps {
  dataCRUD?: Server[];
  handleOrderDelete:(id:number|undefined)=>Promise<void>;
  // setDataCRUD:React.Dispatch<React.SetStateAction<Server[]>>
  // idDataCrud?:number;
  // onSuccess?: () => void;
  
   open: boolean;
   onSuccess:()=>Promise<any>;
  scroll: "body" | "paper" | undefined
  dataObject:Server | null
   handleClose: () => void

}

export default function UpdateProductDialogue({handleOrderDelete,onSuccess,dataObject,handleClose,open,scroll, dataCRUD}:UpdateProductDialogueProps) {
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
        <DialogTitle sx={{textAlign:"center", p:1}} id="scroll-dialog-title">{dataObject?.id? "Update Product": "Create Product"}</DialogTitle>
        <DialogContent dividers={scroll === 'paper'}>
        
          
            <ProductUpdateForm 
            dataObject={dataObject}
            handleOrderDelete={handleOrderDelete}
            outlet={dataObject?.outlet}
            productId = {dataObject?.id}
            productName={dataObject?.product_name}
            sellingPrice={dataObject?.selling_price}
            category={dataObject?.category}
            costPrice={dataObject?.cost_price}
            soldIn={dataObject?.sold_In}
            stockInventory={dataObject?.stock_inventory}
            dataCRUD={dataCRUD}
            setIsLoading={setIsloading}
            //setDataCRUD={setDataCRUD}
            onSuccess={onSuccess}
            onClose={()=>{handleClose()}}
            />
          
        </DialogContent>
        <DialogActions sx={{p:1}}>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
