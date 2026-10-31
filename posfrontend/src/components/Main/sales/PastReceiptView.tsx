import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
// import ProductUpdateForm from './ProductUpdateForm';

import { Box,Divider, List, ListItem, ListItemButton, ListItemText, MenuItem, SelectChangeEvent, TextField, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { format } from 'date-fns';
import ReceiptDetailView from './ReceiptDetailView';
import ReceiptSearch from './ReceiptSearch';
import FilterDateForm from '../../FilterDateForm';
import DialogForCustomDate from '../salesByProductInfo/DialogForCustomDate';
import { Dayjs } from 'dayjs';
import useAxiosWithInterceptor from '../../../helper/jwtinterceptor';
import { BASE_URL } from '../../../congif';
import PassCodeDiagUpdate from '../../PassCodeDiagUpdate';
import { useFormik } from 'formik';
import { requestIdProps } from '../../../@types/auth-service';




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
    is_void?: {
            "is_void": boolean,
            "void_reason": string,
            "void_at": string,
        },
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
  const jwtAxios = useAxiosWithInterceptor()
  const passTokenRef = React.useRef<string | null>(null);
  const [requestId, setRequestId] = React.useState<requestIdProps | null>(null)
  const [openVoid, setOpenVoid] = React.useState(false);
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
  const [ShowReasonToVoid, setShowReasonToVoid] = React.useState(false)
  const [isVoid, setIsVoid] = React.useState<{
            "is_void": boolean,
            "void_reason": string,
            "void_at": string,
        }| undefined>(undefined)
  const [total, setTotal] = React.useState<number>(0)
  const voidIdRef = React.useRef(crypto.randomUUID());
//   const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
//   const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
  // const handlePrint = useReactToPrint({
  //   contentRef: receiptRef,
  // });
//   const style = {
               
//                 };

        React.useEffect(()=>{ 
            setRequestId(
                {object_details:"void_receipt",
                    id:voidIdRef.current
                }
            )
            },[])
  const handleClickOpen = (scrollType: DialogProps['scroll'], itemId:number, ) => {
    const found =data?.find((item)=>item.id === itemId)
    if(found){
      if(found.is_void !== undefined){
        setIsVoid(found.is_void)
      }else{
        setIsVoid(undefined)
      }
      
        
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



  const handleClose = () => {
    setShowReasonToVoid(false)
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
      const formik = useFormik({
        enableReinitialize:true,
        initialValues:{
          "reason":"",
          "receipt_id":""
          
        }, 
        validate:(values)=>{
          const errors: Partial<typeof values> = {};
          if(!values.reason){
            setShowReasonToVoid(true)
            errors.reason="Required"
          }
          // if(!values.receipt_id){
          //   errors.receipt_id = "required"
          // }
          return errors
        }, 
        onSubmit:async(values)=>{
          const {reason} = values;
          const payload = {
            "reason":reason,
            "receipt_id":receiptId
          }
      
          try{
              const response = await jwtAxios.post(`${BASE_URL}/sales_receipt/void_receipt/`, 
              payload, 
              { 
                    headers: {
                    "X-Pass-Token": passTokenRef.current
                    },
                    withCredentials: true}
            
            )
            console.log(response.data)
              return response.data
          }catch(err:any){
              if(err.response?.status === 403 && err.response?.data.error_token){
                setOpenVoid(true)
            }
              throw err.response
          }finally{
            setShowReasonToVoid(false)
          }
        }
      })
  // const handleVoidReceipt =async ()=>{
  //   const payload = {"reason":"reason","receipt_id":receiptId}
  //   try{
  //     const response = await jwtAxios.post(`${BASE_URL}/void_receipt`, 
  //       {}, {withCredentials:true})
  //       return response.data
  //   }catch(err:any){
  //       if(err.response?.status === 403 && err.response?.data.error_token){
  //               setOpen(true)
  //           }
  //     throw err.response
  // }
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

    
        <List 
        sx={{
             py: 0,
                width: '100%',
                // maxWidth: 360,
                // height:500,
                mb:3,
                // overflowY:"auto"            ,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
        }}
        >
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
                                        <ListItemButton sx={{backgroundColor:item?.is_void?.is_void?"#e09898":"transparent"}} key={item.id}  onClick={()=>{handleClickOpen('paper', item.id)}}>
                                            
                                            <ListItemText key={item.id} disableTypography sx={{m:0, p:0}}
                                         primary={
                                            <Box sx={{display:"flex" ,mb:0.5, justifyContent:"space-between", }}>
                                                <Typography variant="body2"
                                                sx={{ 
                                                    fontWeight:800,
                                                    // fontSize: "1.2rem"
                                                }}
                                                >
                                                {`#00-${item.id}`} {item.is_void?.is_void && 
                                                <Typography component="span" sx={{ml:5, color:"#fff"}}>
                                                  {/* {`${formatDate(item.is_void?.void_at).fullDate} ${formatDate(item.is_void?.void_at).hour}:${formatDate(item.is_void?.void_at).minutes}  ${formatDate(item.is_void?.void_at).period}` } */}
                                                VOIDED RECEIPT
                                                </Typography>}
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
                     <PassCodeDiagUpdate
                          requestId={requestId}
                          purpose={"void_receipt"}
                          passTokenRef={passTokenRef}
                          formik={formik}
                          open={openVoid}
                        handleDaigClose={() => setOpenVoid(false)}
                    />
      <Dialog
        fullWidth
        sx={{zIndex:"2001"}}
        // maxWidth
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle sx={{textAlign:"center"}} id="scroll-dialog-title">
              
          <Box display={isVoid?.is_void? "none": "flex"}  component="form" sx={{maxWidth:"100%",flexGrow:1, alignItems: "center", flexDirection: "column",}} onSubmit={formik.handleSubmit}>
            <TextField
            sx={{display:ShowReasonToVoid?"block":"none", alignSelf:"flex-end"}}
              size="small"
              slotProps={{select:{MenuProps:{sx:{zIndex:2001}}}}}
              margin="normal"
              fullWidth
                                        
                                        id="reason"
                                        select
                                        name="reason"
                                        label="reason"
                                        value={formik.values.reason}
                                        onChange={formik.handleChange}
                                        error={!!formik.touched.reason && !!formik.errors.reason}
                                        helperText={formik.touched.receipt_id && formik.errors.reason}
                                    >
                                        <MenuItem value="item_returned">
                                          customer returned items
                                        </MenuItem>
                                         <MenuItem value="mistake">
                                          mistake
                                        </MenuItem>
                                    </TextField>
              <Button size='small' variant="contained" disableElevation sx={{display:"block",margin:"1px auto", textAlign:"center",backgroundColor:"#efaaaa", textTransform:"none"}} type="submit">void receipt</Button>
          </Box>
          
        </DialogTitle>
        <DialogContent sx={{p:0, m:0}}  dividers={scroll === 'paper'}>
        
          
            <ReceiptDetailView
            data={data}
            isVoid={isVoid}
            amountTenderd={amountTenderd}
            receiptId = {receiptId}
            date={date}
            balance_due={balance_due}
            total={total}
            remarks={remarks}
            issued={issued}
            orders={orders}
            payment_option={payment_option}
            onClose={()=>{setShowReasonToVoid(false);handleClose()}}
            />
          
        </DialogContent>
        <DialogActions sx={{m:"2px auto"}}>
          <Button   onClick={handleClose}>Cancel</Button>
          
          {/* <Button   onClick={handleClose}>delete receipt</Button> */}
          {/* <Button onClick={handlePrint}>
              Print
          </Button> */}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
