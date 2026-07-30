import {
    Box,
    Typography,
    useTheme,
    Card,
    CardContent,
    Button,
    SelectChangeEvent,
    Input,
    CardActions,
    TextField,
    Tooltip,
} from "@mui/material";
import React, { useEffect,useState } from "react";
import useAxiosWithInterceptor from "../../../helper/jwtinterceptor";
import PaymentMethodOption from "../../salesSectionComp/PaymentMethodOption";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NumberInput from "./NumberInput";



interface productType{
    id?:number;
    user?:number;
    outlet:string;
    product_name:string;
    sold_in:string;
    cost_price: number;
    selling_price:number;
    stock_inventory:number;
    category:string

}

interface orderType  {

    id:number;
    product:productType;
    quantityInput?: string;
    quantity:number;
    description?:string
    date:string;
    paid:boolean;
    sub_total:number
    sub_totalInput?:string

}

interface ServerReceipt {
    id: number;
    hold:boolean;
    orders: orderType[];
    remarks?: string;
    date?: string;
    issued?:boolean;
    total?:number
    
}

interface SalesProps{
    handleClick : (id:number)=>void;
    dataCRUD:ServerReceipt[];
    setDataCRUDReceipt: React.Dispatch<React.SetStateAction<ServerReceipt[]>>
    handleReceiptSubmit?:(hold:boolean, receipt_id:number)=>Promise<void>;
    paymentOption:string;
    remarks?:string;
    amountTendered?:number;
    setAmountTendered?: React.Dispatch<React.SetStateAction<number>>;
    setRemarks?: React.Dispatch<React.SetStateAction<string>>;
    setPaymentOption?: React.Dispatch<React.SetStateAction<string>>;
    showReceiptDetaills: boolean

}

const SalesReceipt = ({dataCRUD,paymentOption,setPaymentOption,amountTendered,setAmountTendered,remarks,setRemarks,setDataCRUDReceipt, handleReceiptSubmit}:SalesProps) => {
    const theme = useTheme();
    const jwtAxios = useAxiosWithInterceptor();
    const [editingField, setEditingField] = useState<"quantity" | "subtotal">("quantity");
    const [balance, setBalance] = React.useState<number>(0)

useEffect(() => {
    const needsInitialization = dataCRUD.some(item =>
        item.orders.some(order => order.quantityInput === undefined)
    );

    if (!needsInitialization) return;

    setDataCRUDReceipt(
        dataCRUD.map(item => ({
            ...item,
            orders: item.orders.map(order => ({
                ...order,
                quantityInput: String(order.quantity),
            })),
        }))
    );
}, [dataCRUD]);
   
useEffect(() => {
    const needsInitialization = dataCRUD.some(item =>
        item.orders.some(order => order.sub_totalInput === undefined)
    );

    if (!needsInitialization) return;

    setDataCRUDReceipt(
        dataCRUD.map(item => ({
            ...item,
            orders: item.orders.map(order => ({
                ...order,
                sub_totalInput: String(order.sub_total),
            })),
        }))
    );
}, [dataCRUD]);
   

    const handleChange = (event: SelectChangeEvent) => {
        setPaymentOption?.(event.target.value);
    };
    const handleRemarksChange = (e:React.ChangeEvent<HTMLInputElement| HTMLTextAreaElement>) => {
        setRemarks?.(e.target.value);
    };
    const handleOrderDelete = async (orderId:number) =>{
    const id=orderId
    console.log(id)
    try{
        const response = await jwtAxios.delete(
        `http://127.0.0.1:8000/api/order/${id}/`,{
            withCredentials:true
        })
        console.log(response.data)
        setDataCRUDReceipt((prevData)=>prevData.map((item)=>
        ({
            ...item,
           orders:item.orders.filter((orderItem)=>
            orderItem.id !== id
        )
        })
        ))
        return response.data
    }catch(err:any){
        if (err.response?.status === 400) {
                new Error("400");
            }
        throw err;
        
    }
    
  }
    const ordersLenght = dataCRUD?.reduce((acc, num)=>
        acc + num.orders.length
    ,0)
   
    function handleInputValue(value:string, sellingPrice:number, id?:number){
            if(editingField === "subtotal" )return;
            
            const quantity = value === "" ? 0 : parseFloat(value);
            const subTotalVal = quantity * sellingPrice
            
                setDataCRUDReceipt((prevData)=>
                    prevData.map((item)=>
                    ({
                        ...item,
                        orders:item.orders.map((orderItem)=>
                        orderItem.id === id?{
                            ...orderItem, 
                            quantityInput: value,
                            quantity:quantity,
                            sub_totalInput:String(subTotalVal),
                            sub_total:subTotalVal
                        }
                            :orderItem
                        )
                    })
                    )
                    )
        
            
            
               
        }
            function handleInputSubtotalChange(e:React.ChangeEvent<HTMLInputElement| HTMLTextAreaElement>, sellingPrice:number, id?:number){
            if(editingField === "quantity") return
            const value = e.currentTarget.value
            
              if (!/^\d*\.?\d*$/.test(value)) {
                    return;
                }
                const newSubTotal=value === ""? 0 : Number(value);
                // const newQuantity =  Math.trunc((newSubTotal / sellingPrice)* 100)/100
                const newQuantity =  newSubTotal / sellingPrice

            
                setDataCRUDReceipt((prevData)=>
                    prevData.map((item)=>
                    ({
                        ...item,
                        orders:item.orders.map((orderItem)=>
                        orderItem.id === id?{
                            ...orderItem, 
                            quantity:newQuantity,
                            quantityInput:String(newQuantity),
                            sub_total:newSubTotal,
                            sub_totalInput:value
                        }
                            :orderItem
                        )
                    })
                    )
                    )
        
            
            
               
        }

        const TotalPrice = React.useMemo(()=>{
            let total = 0;
            dataCRUD.forEach((item)=>
                item.orders.forEach((orderItem)=>
                total += Number(orderItem.sub_total )
                )
            )
                    
            return total;
        
        }, [dataCRUD])
            useEffect(() => {
                setAmountTendered?.(TotalPrice);
            }, [TotalPrice]);
        
        
        
        const handleBalChange =(e:React.ChangeEvent<HTMLInputElement| HTMLTextAreaElement>)=>{
            const tenderedAmount = Number(e.target.value)
            const bal = Number(e.target.value) - TotalPrice
            setBalance(bal)
            setAmountTendered?.(tenderedAmount)
        }
      
    
    return (
        <>
            {/* <Container sx={{backgroundColor:"grey", m:0, p:0,height:"100%",maxWidth:"100%",overflow:"auto"}} > */}
                            
                            <Card 
                            sx={{
                                 backgroundColor:theme.palette.primary.light,
                                 overflowX:"hidden"
                                 }}>
                               {ordersLenght > 0?
                               (
                                <>
                                    <CardContent sx={{padding:"0px !important"}}>
                                        <>
                                        
                                        {dataCRUD.map((item)=>{
                                            return(
                                                <React.Fragment key={item.id}>
                                                <Box sx={{width:"100%", m:0, p:0}} key={item.id}>
                                                    
                                                        {item.orders.map((orderItem)=>{
                                                            return(
                                                                <Box key={orderItem.id} sx={{
                                                                        display:'flex',
                                                                        // alignContent:'center',
                                                                        alignItems:'center',
                                                                        justifyContent:'space-between',
                            
                                                                        }} >
                                                                    <Tooltip arrow placement="top-start"  title={orderItem.product.product_name}>
                                                                        <Typography variant="body2" 
                                                                        sx={{
                                                                                maxWidth:'100%',
                                                                                fontWeight:800,
                                                                                fontSize:"10px",
                                                                                cursor:"pointer",
                                                                                m:2, 
                                                                                flex:1,
                                                                                overflow:'hidden',
                                                                                textOverflow:'ellipsis',
                                                                                
                                                                                whiteSpace:'nowrap',
                                                                                // alignItems:'center'
                                                                              }}>
                                                                        {orderItem.product.product_name}
                                                                    </Typography>
                                                                    </Tooltip>
                                                                    
                                                                    <Typography 
                                                                    variant="body2" 
                                                                    component="div" 
                                                                    sx={{ 
                                            
                                                                        flex:1,
                                                                        overflow:'hidden',
                                                                        textOverflow:'ellipsis',
                                                                        maxWidth:'120px',
                                                                        fontSize:"10px"
                                                                       
                                                                         }}>
                                                                        <NumberInput
                                                                        setEditingField={setEditingField}
                                                                        value={orderItem.quantityInput ?? ""}
                                                                        onChange={(value) =>
                                                                            handleInputValue(
                                                                                value,
                                                                                orderItem.product.selling_price,
                                                                                orderItem.id
                                                                            )
                                                                        }
                                                                    />
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="body2" 
                                                                        sx={{ 
                                                                            color: 'text.secondary',
                                                                            flex:0.5,
                                                                            overflow:'hidden',
                                                                            whiteSpace:'nowrap',
                                                                            textAlign:'center',
                                                                            fontSize:"12px"
                                                                             }}>
                                                                        X
                                                                    </Typography>
                                                                    <Typography  
                                                                        variant="body2" 
                                                                        sx={
                                                                            {
                                                                                maxWidth:'120px',
                                                                                flex:1,
                                                                                overflow:'hidden',
                                                                                whiteSpace:'nowrap',
                                                                                fontSize:"12px"
                                                                            
                                                                             }}>
                                                                        {Number(orderItem.product.selling_price.toLocaleString())}
                                                                    </Typography>
                                                                    <Typography  
                                                                    component="div"
                                                                        variant="body2" 
                                                                        sx={
                                                                            {
                                                                                maxWidth:'120px',
                                                                                fontWeight:800,
                                                                                flex:1.2,
                                                                                overflow:'hidden',
                                                                                whiteSpace:'nowrap',
                                                                                fontSize:"12px"
                                                                            
                                                                             }}>
                                                                        {/* {Number(orderItem.sub_total.toLocaleString())} */}
                                                                        {/* {booSubtotal? subTotal : orderItem.sub_total} */}
                                                                        <Input 
                                                                        size="small"
                                                                        onFocus={()=>{setEditingField("subtotal")}}
                                                                            onChange={(e)=>handleInputSubtotalChange(e, orderItem.product.selling_price, orderItem.id)}
                                                                            disableUnderline
                                                                             sx={{
                                                                                width:'100%',
                                                                                '& input':{
                                                                                    textAlign:'center',
                                                                                    fontSize:"15px"
                                                                                },
                        
                                                                                // p:0.5,
                                                                                border:`1px solid ${theme.palette.divider}`,
                                                                                borderRadius:'10px'
                                                                                }} 
                                                                        value={orderItem.sub_totalInput}
                                                                        margin="dense" 
                                                                        // type="number" 
                                                                        // value={orderItem.quantity}
                                                                        />
                                                                    </Typography>
                                                                    <Typography component="div"
                                                                        variant="body2"
                                                                        sx={{
                                                        
                                                                            flex:0.2
                                                                        }}
                                                                    >

                                                                        <Button  onClick={()=>{handleOrderDelete(orderItem.id)}} sx={{color:'#ef5350',minWidth:0, p:0.5, width:'100%'}}>
                                                                            <DeleteForeverIcon/>
                                                                        </Button>
                                                                        
                                                                    </Typography>
                                                                </Box>
                                                                
                                                            )
                                                        })}  
                                            </Box>
                                            <Box sx={{display:'block',m:0,p:0,textAlign:'center'}}>
                                                <PaymentMethodOption
                                                    paymentOption={paymentOption}
                                                    handleChange={handleChange}
                                                />
                                            </Box> 
                                            </React.Fragment>
                                            )
                                        })}    
            
                                                              
                                
                                    </>
                                </CardContent>
                                <CardActions>
            
                                            <Box sx={{
                                                display:"flex",
                                                width:"100%",
                                                
                                            
                                                }}>
                                                    <Typography 
                                                    sx={{
                                                        mt:0,
                                                        ml:'10%',
                                                        fontSize:"15px",
                                                        fontWeight:700
                                                        }}>
                                                        Total
                                                    </Typography>
                                                    <Box flexGrow={1}>
            
                                                    </Box>
                                                    
                                                    <Typography 
                                                    sx={{
                                                        fontSize:"15px",
                                                        mr:'20%',
                                                        fontWeight:700
                                                        }}>
                                                            {/* {totalPrice === 0 ?item.total : totalPrice } */}
                                                        {/* {item.total} */}
                                                        {TotalPrice.toLocaleString()}
                                                    </Typography>
                                            
            
                                            </Box>
                                            <Box>
                                              
                                            </Box>
            
                                        
                                    <>
                                            
                                    </>
                                        
                                </CardActions>
                                <Box sx={{m:0, p:1, textAlign:'center', borderTop:`1px solid ${theme.palette.divider}`}}>
                                     <Tooltip title='Amount Tendered' arrow placement="top-start">
                                        <TextField
                                                size="small"
                                                type="number"
                                                label='Amount Tendered'
                                                value={amountTendered}
                                                onChange={(e)=>handleBalChange(e)}
                                                sx={{
                                                    fontSize:"15px",
                                                    width:'20%',
                                                    '& input':{
                                                        textAlign:"center",
                                                        p:0.2,
                                                        m:0
                                                    }
                                                    
                                                }} />
                                     </Tooltip>
                                    
                                </Box>
                                <Box sx={{display:"flex",justifyContent:"space-between",width:"100%", textAlign:'center', borderTop:`1px solid ${theme.palette.divider}`}}>
                                        
                                            <Typography 
                                                sx={{  
                                                    ml:"10%",
                                                    fontSize:"15px",
                                                    p:1,
                                                    fontWeight:700}}>
                                                Balance Due
                                            </Typography>
                                        
                                        <Box flexGrow={1}></Box>
            
                                        
                                        
                                            <Typography
                                                sx={{ 
                                                    fontSize:"15px",
                                                    p:1,
                                                    mr:'20%',
                                                    fontWeight:700
                                                }}
                                             >
                                                {balance.toLocaleString()}
                                            </Typography>
                                        
                                        
                                </Box>
                                <Box sx={{m:0, display:'flex', p:2, textAlign:'center', borderTop:`1px solid ${theme.palette.divider}`}}>
                                    <TextField
                                                fullWidth
                                                multiline
                                                size="small"
                                                minRows={1}
                                                maxRows={2}
                                                label='Remarks'
                                                value={remarks}
                                                onChange={(e)=>handleRemarksChange(e)}
                                                sx={{
                                                    flexGrow: 1
                                                }} />
                                </Box>
                                <Box sx={{m:0, p:2, textAlign:'center', borderTop:`1px solid ${theme.palette.divider}`}}>
                                    <Button sx={{textTransform:"none"}} onClick={()=>{handleReceiptSubmit?.(false,dataCRUD?.[0].id)}} color="success" variant="contained">Issue Receipt</Button>
                                   {!dataCRUD?.[0].hold&&<Button sx={{m:1, textTransform:"none"}} onClick={()=>{handleReceiptSubmit?.(true, dataCRUD?.[0].id)}} color="error" variant="contained">hold Receipt</Button>} 
                                </Box>
            
                            </>
                                    
                               ):
                               (
                                'No Order please Add new Order'
                               )
                               }
                                                        
                            </Card>

            
                        {/* </Container> */}
            
                 

         

        </>
    )

};

export default SalesReceipt