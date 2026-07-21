import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ProductUpdateForm from './ProductUpdateForm';
import LinearIndeterminate from '../../progressSign/LinearIndeterminate';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UpdateIcon from '@mui/icons-material/Update';
import { Chip } from '@mui/material';
import { outletsDataProps } from '../../../@types/outletsNstaff-service';
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
  // const [open, setOpen] = React.useState(false);
  // const [scroll, setScroll] = React.useState<DialogProps['scroll']>('paper');
  // const [productName ,setProductName] = React.useState("")
  // const [category ,setCategory] = React.useState("")
  // const [costPrice, setCostPrice] = React.useState<number>(0)
  // const [sellingPrice ,setSellingPrice] = React.useState<number>(0)
  // const [soldIn, setSoldIn] = React.useState("")
  // const [outlet,setOutlet] = React.useState("")
  // const [stockInventory, setStockInventory] = React.useState<number>(0)
  // const [productId, setProductId] = React.useState<number>(0)
  const [isLoading, setIsloading] = React.useState<boolean>(false)
  

  // const handleClickOpen = (scrollType: DialogProps['scroll']) => {
  //   if (idDataCrud && dataCRUD){
  //       const found= dataCRUD.find((item)=>item.id === idDataCrud)
  //       if(found){
  //           setOutlet(found.outlet)
  //            setProductName( found.product_name)
  //            setCategory(found.category)
  //            setCostPrice(found.cost_price)
  //            setSellingPrice(found.selling_price)
  //           setSoldIn(found.sold_In)
  //           setStockInventory(found.stock_inventory)
  //           setProductId(found.id)
            
  //       }else{
  //            setProductName( "")
  //            setOutlet("")
  //            setCategory("")
  //            setCostPrice(0)
  //            setSellingPrice(0)
  //           setSoldIn("")
  //           setStockInventory(0)
  //           setProductId(idDataCrud)
  //       }
  //   }else{
  //        setProductName( "")
  //            setCategory("")
  //            setCostPrice(0)
  //            setSellingPrice(0)
  //           setSoldIn("")
  //           setStockInventory(0)
  //           setProductId(0)
  //   }
  //   setOpen(true);
  //   setScroll(scrollType);

  // };

  // const handleClose = () => {
  //   setOpen(false);
  // };

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
      {/* <Chip
              sx={{fontSize:"0.9rem", p:1}}
              color={idDataCrud?"default":"success"}
              label={idDataCrud? "View Details" : "Create New Product"}
              onClick={()=>{handleClickOpen('paper')}}
              icon={idDataCrud?<UpdateIcon/>:<AddCircleOutlineIcon />}
          /> */}
      {/* <Button variant="outlined" color="info" onClick={()=>{handleClickOpen('paper')}}>View Details</Button> */}
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
