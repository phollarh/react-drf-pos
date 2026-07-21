import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
// import ProductUpdateForm from './ProductUpdateForm';

import { Box, Chip, Divider, List, ListItem, ListItemButton, ListItemText, SelectChangeEvent, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { format } from 'date-fns';
import ReceiptDetailView from './ReceiptDetailView';
import { Key, Receipt } from '@mui/icons-material';
import ReceiptSearch from './ReceiptSearch';
import FilterDateForm from '../../FilterDateForm';
import DialogForCustomDate from '../salesByProductInfo/DialogForCustomDate';
import { Dayjs } from 'dayjs';
import { useReactToPrint } from "react-to-print";


interface ProductProps{
    id:number;
    product_name:string;
    category:string;
    cost_price:number;
    selling_price :number;
    stock_inventory:number;
    sold_In:string
    
}

interface OrderProps {
    id:number;
    date:string;
    description:string;
    paid:boolean;
    product:ProductProps;
    quantity:number;
    sub_total:number

}

interface Server {
    id: number;
    date: string;
    amount_tenderd:number;
    balance_due: number;
    payment_option:string;
    orders:OrderProps[];
    issued: boolean;
    remarks: string
    total: number
    

}
interface UpdateProductDialogueProps {
  data: Server[];
  filterOption:string;
  tempEndDate:Dayjs | null;
  tempStartDate:Dayjs | null
  setTempStartDate: React.Dispatch<React.SetStateAction<Dayjs | null>>
  setTempEndDate:React.Dispatch<React.SetStateAction<Dayjs | null>>;
//   setFilterOption: React.Dispatch<React.SetStateAction<string>>
  handleChange:(event:React.ChangeEvent<HTMLInputElement>)=>void;
  handleFilterChange:(event: SelectChangeEvent)=>void;

  handleApplyCustomDate:()=>void
  inputValue:string
  showDialogForCustom:boolean;
  handleCloseDialog:()=>void;

}

export default function PastReceiptView({
  filterOption,handleFilterChange,handleCloseDialog,showDialogForCustom,
  setTempEndDate,setTempStartDate,
  tempEndDate, tempStartDate,handleApplyCustomDate,data,handleChange, inputValue}:UpdateProductDialogueProps) {
  const theme = useTheme();
  const receiptRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [scroll, setScroll] = React.useState<DialogProps['scroll']>('paper');
  const [date ,setDate] = React.useState("")
  const [balance_due ,setBalance_due] = React.useState(0)
  const isMobile = useMediaQuery("(max-width: 500px)")
  const [amountTenderd ,setAmountTenderd] = React.useState(0)
  const [payment_option, setPayment_option] = React.useState("")
  const [orders ,setOrders] = React.useState<OrderProps[]>([])
  const [issued, setIssued] = React.useState(false)
  const [receiptId, setReceiptId] = React.useState<number>(0)
  const [remarks, setRemarks] = React.useState("")
  const [total, setTotal] = React.useState<number>(0)
//   const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
//   const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
  // const handlePrint = useReactToPrint({
  //   contentRef: receiptRef,
  // });
  const style = {
                py: 0,
                width: '100%',
                // maxWidth: 360,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                };
  const handleClickOpen = (scrollType: DialogProps['scroll'], itemId:number, ) => {
    const found =data?.find((item)=>item.id === itemId)
    if(found){

        setReceiptId(found.id);
        setDate(found.date);
        setAmountTenderd(found.amount_tenderd)
        setBalance_due(found.balance_due);
        setPayment_option(found.payment_option);
        setOrders([...found.orders]);
        setIssued(found.issued);
        setRemarks(found.remarks);
        setTotal(found.total);
    }

    setOpen(true);
    setScroll(scrollType);

  };

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
  });

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


  function formatDate(dateString: string) {
              const date = new Date(dateString);
                 const h1=format(date,'HH');
                  const m=format(date,'mm');
                  const s1=format(date,'ss');
                  const period=format(date,'a')
              return {
                  hour:h1,
                  minutes:m,
                  seconds:s1,
                  period:period,
                  fullDate: format(date, "PPP")      
              };
          }

  return (
    <React.Fragment>

        
            <Box sx={{width:"50%"}}>
                       {showDialogForCustom && 
                       <DialogForCustomDate
                          open={showDialogForCustom}
                          handleCloseDialog={handleCloseDialog}
                          startDate={tempStartDate}
                          endDate={tempEndDate}
                          onStartDateChange={setTempStartDate}
                          onEndDateChange={setTempEndDate}
                          onClickReceipt={handleApplyCustomDate}
/>
                              }
            </Box>

    
        <List sx={style}>
          <Toolbar sx={{display:isMobile?"block":"flex",justifyContent:"space-between"}}>
            <Box >
                <FilterDateForm filterOption={filterOption} handleChange={handleFilterChange}/>
            </Box>
            <Box flexGrow={1}></Box>
            <Box 
            // sx={{width:"50%"}}
            >
                <ReceiptSearch inputValue={inputValue} handleChange={handleChange}/>
            </Box>
            
          </Toolbar>
                        {data?.map((item)=>{
                            return(
                                <React.Fragment key={item.id}>
                                    <ListItem  key={item.id}>
                                        <ListItemButton key={item.id}  onClick={()=>{handleClickOpen('paper', item.id)}}>
                                            
                                            <ListItemText key={item.id} disableTypography sx={{m:0, p:0}}
                                         primary={
                                            <Box sx={{display:"flex" ,mb:0.5, justifyContent:"space-between"}}>
                                                <Typography variant="body2"
                                                sx={{ 
                                                    fontWeight:800,
                                                    // fontSize: "1.2rem"
                                                }}
                                                >
                                                {`#00-${item.id}`}
                                                </Typography>
                                                 <Typography></Typography>
                                                 <Typography variant="body2" 
                                                 sx={
                                                    {
                                                    // width:"20%",
                                                    fontWeight:800,
                                                    // fontSize: "1em"
                                                    }}>
                                                    {item.total}
                                                </Typography>
                                            </Box>
                                            
                                         }
                                         secondary={
                                            <Box sx={{
                                                display:"flex",
                                                //  fontSize:'1rem', 
                                                 flexWrap:'nowrap' , 
                                                 justifyContent:"space-between",
                                                 color:theme.palette.primary.main
                                                 }}>
                                                <Typography fontSize="small" variant="body2"
                                                >
                                                    {item.payment_option}
                                                </Typography>
                                                <Typography></Typography>

                                                <Typography 
                                                    sx={{
                                                        p:0,
                                                        ml:0,
                                                    }} 
                                                    variant="body2"
                                                >
                                                    {`${formatDate(item.date).fullDate} ${formatDate(item.date).hour}:${formatDate(item.date).minutes}  ${formatDate(item.date).period}` }
                                                </Typography >
                                                
                                            </Box>
                                            
                                         }
                                         />
                                        </ListItemButton> 
                                    </ListItem>
                                    <Divider component="li" />
                                </ React.Fragment>
                                
                            )
                        })}
                    </List>
      <Dialog
        fullWidth
        // maxWidth
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle sx={{textAlign:"center"}} id="scroll-dialog-title"></DialogTitle>
        <DialogContent  dividers={scroll === 'paper'}>
        
          
            <ReceiptDetailView
            OnclickPrint={handlePrint}
            ref={receiptRef}
            data={data}
            amountTenderd={amountTenderd}
            receiptId = {receiptId}
            date={date}
            balance_due={balance_due}
            total={total}
            remarks={remarks}
            issued={issued}
            orders={orders}
            payment_option={payment_option}
            onClose={()=>{handleClose()}}
            />
          
        </DialogContent>
        <DialogActions sx={{m:"2px auto"}}>
          <Button   onClick={handleClose}>Cancel</Button>
          {/* <Button onClick={handlePrint}>
              Print
          </Button> */}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
