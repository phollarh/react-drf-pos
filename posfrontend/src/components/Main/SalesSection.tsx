import {
    Box,
    Typography,
    useTheme,
    Container,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Toolbar,
    Input,
    SelectChangeEvent,
    TextField
} from "@mui/material";

import useCrud from "../../hooks/useCrud";
import React, { useEffect } from "react";
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import useAxiosWithInterceptor from "../../helper/jwtinterceptor"
import PaymentMethodOption from "../salesSectionComp/PaymentMethodOption";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

interface productType{
    id?:number;
    user?:number;
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
    quantity:number;
    description?:string
    date:string;
    paid:boolean;
    sub_total:number

}

interface Server {
    id: number;
    orders: orderType[];
    remarks?: string;
    date?: string;
    issued?:boolean;
    total?:number
    
}

const MainSection = () => {
    const theme = useTheme();
    const [drawerOpen, setDrawerOpen] = React.useState(true);
    const jwtAxios = useAxiosWithInterceptor();
    const [paymentOption, setPaymentOption] = React.useState('');
    const [remarks, setRemarks] = React.useState('');
    const [balance, setBalance] = React.useState<number>(0)
    const [amountTendered, setAmountTendered] = React.useState<number>(0)
    const outlet_id:string  = localStorage.getItem("outlet_id") || ""

        const url = React.useMemo(() => {
            let base = `/sales_receipt/`;
            const params = new URLSearchParams();
    
            if (outlet_id !== "") {
                params.append("outlet_id", outlet_id);
            }
            if(params.toString()){
             base += `?${params.toString()}`
            }
            return base
        },[outlet_id])
    const { dataCRUD, setDataCRUD } = useCrud<Server>([], url)
    console.log(dataCRUD)
  const handleChange = (event: SelectChangeEvent) => {
    setPaymentOption(event.target.value);
  };

    const handleRemarksChange = (e:React.ChangeEvent<HTMLInputElement| HTMLTextAreaElement>) => {
    setRemarks(e.target.value);
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
        setDataCRUD((prevData)=>prevData.map((item)=>
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


    
    React.useEffect(() => {
                const handleDrawerToggle = (e: Event) => {
                const customEvent = e as CustomEvent;
                setDrawerOpen(customEvent.detail);
                };
                window.addEventListener("drawer-toggle", handleDrawerToggle);
                return () => window.removeEventListener("drawer-toggle", handleDrawerToggle);
    }, []);


    
    const drawerWidth = drawerOpen ? theme.primaryDraw.width : theme.primaryDraw.closed;
 
    
    console.log('this page is active')
    // useEffect(() => {
    //     fetchData();

    // }, []);

    // const [data, setData] = React.useState<Server[]>([])
    // useEffect(() => {
    //     setData(dataCRUD)

    // }, [dataCRUD]);

    //     useEffect(() => {
    //     console.log(dataCRUD)

    // }, [dataCRUD]);

    const ordersLenght = dataCRUD.reduce((acc, num)=>
        acc + num.orders.length
    ,0)

  

    function handleInputValue(e:React.ChangeEvent<HTMLInputElement| HTMLTextAreaElement>, sellingPrice:number, id?:number){
        const newQuantity = e.currentTarget.value
        const subTotalVal = parseFloat(newQuantity) * sellingPrice

        setDataCRUD((prevData)=>
                prevData.map((item)=>
                ({
                    ...item,
                    orders:item.orders.map((orderItem)=>
                    orderItem.id === id?{
                        ...orderItem, 
                        quantity:parseInt(newQuantity),
                        sub_total:subTotalVal
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
        setAmountTendered(TotalPrice);
    }, [TotalPrice]);



    const handleBalChange =(e:React.ChangeEvent<HTMLInputElement| HTMLTextAreaElement>)=>{
        const tenderedAmount = Number(e.target.value)
        const bal = Number(e.target.value) - TotalPrice
        // const amountTendered = Number(e.target.value)
        setBalance(bal)
        setAmountTendered(tenderedAmount)
    }

    const handleReceiptSubmit = async ()=>{
        const orderId = dataCRUD[0]?.id
       const payload ={
                "id":orderId,
                "orders": 
                   dataCRUD.flatMap((item)=>
                    item.orders.map((orderItem)=>{
                        return( {
                            'product': orderItem.product.id,
                            'quantity':orderItem.quantity,
                            'sub_total':orderItem.sub_total
                        })
                      
                    })
                   )
                ,
                "remarks": remarks??"",
                "payment_option": paymentOption?? "",
                "amount_tenderd": amountTendered
                }
                console.log(payload)
        try{
            const response = await jwtAxios.put(`http://127.0.0.1:8000/api/sales_receipt/${orderId}/`,
            payload,
           { withCredentials: true}
        )
            const dataCRUDBack = response.data
            // setData(dataCRUDBack)
            console.log(dataCRUDBack)
            return dataCRUDBack
        }catch(error:any){
             if (error.response?.status === 400) {
                new Error("400");
            }
            throw error;
        }

    }
  

    
    

    return (
        <>
            <Container  sx={{width:`calc(100vw - ${drawerWidth}px)`, ml:`${drawerWidth}px`}}>
            
                <Card sx={{m:'10px auto',maxWidth:'80%', alignContent:'center', alignItems:'center' }}>
                   {ordersLenght > 0?
                   (
                    <>
                        <CardContent>
                            <>
                            <Typography sx={{textAlign:'center'}} gutterBottom variant="h5" component="div">
                                Sales Receipt 
                            </Typography>
                            
                            {dataCRUD.map((item)=>{
                                return(
                                    <React.Fragment key={item.id}>
                                    <Box key={item.id}>
                                        
                                            {item.orders.map((orderItem)=>{
                                                return(
                                                    <Box key={orderItem.id} sx={{
                                                            display:'flex',
                                                            // alignContent:'center',
                                                            alignItems:'center',
                                                            justifyContent:'space-between',
                
                                                            }} >
                                                        <Typography variant="body2" 
                                                            sx={{
                                                                    maxWidth:'100%',
                                                                    fontWeight:800,
                                                                    fontSize:"10px",
                                                                    m:2, 
                                                                    flex:1,
                                                                    overflow:'hidden',
                                                                    textOverflow:'ellipsis',
                                                                    
                                                                    whiteSpace:'nowrap',
                                                                    // alignItems:'center'
                                                                  }}>
                                                            {orderItem.product.product_name}
                                                        </Typography>
                                                        <Typography 
                                                        variant="body2" 
                                                        component="span" 
                                                        sx={{ 
                                
                                                            flex:1,
                                                            overflow:'hidden',
                                                            textOverflow:'ellipsis',
                                                            maxWidth:'120px',
                                                            fontSize:"10px"
                                                           
                                                             }}>
                                                            <Input 
                                                            size="small"
                                                                onChange={(e)=>handleInputValue(e, orderItem.product.selling_price, orderItem.id)}
                                                                disableUnderline
                                                                 sx={{
                                                                    width:'80%',
                                                                    '& input':{
                                                                        textAlign:'center',
                                                                        fontSize:"15px"
                                                                    },
            
                                                                    // p:0.5,
                                                                    border:`1px solid ${theme.palette.divider}`,
                                                                    borderRadius:'10px'
                                                                    }} 
                                                            value={orderItem.quantity}
                                                            margin="dense" 
                                                            type="number" 
                                                            // value={orderItem.quantity}
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
                                                            {orderItem.product.selling_price}
                                                        </Typography>
                                                        <Typography  
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
                                                            {orderItem.sub_total}
                                                            {/* {booSubtotal? subTotal : orderItem.sub_total} */}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                            
                                                                flex:0.2
                                                            }}
                                                        >
                                                            <Button onClick={()=>{handleOrderDelete(orderItem.id)}} sx={{color:'#ef5350',minWidth:0, p:0.5, width:'100%'}}>
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
                                            {TotalPrice.toFixed(2)}
                                        </Typography>
                                

                                </Box>
                                <Box>
                                  
                                </Box>

                            
                        <>
                                
                        </>
                            
                    </CardActions>
                    <Box sx={{m:0, p:1, textAlign:'center', borderTop:`1px solid ${theme.palette.divider}`}}>
                        <TextField
                                    
                                    // fullWidth
                                    // multiline
                                    // minRows={1}
                                    // maxRows={4}
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
                                    {balance}
                                </Typography>
                            
                            
                    </Box>
                    <Box sx={{m:0, display:'flex', p:2, textAlign:'center', borderTop:`1px solid ${theme.palette.divider}`}}>
                        <TextField
                                    fullWidth
                                    multiline
                                    minRows={1}
                                    maxRows={4}
                                    label='Remarks'
                                    value={remarks}
                                    onChange={(e)=>handleRemarksChange(e)}
                                    sx={{
                                        flexGrow: 1
                                    }} />
                    </Box>
                    <Box sx={{m:0, p:2, textAlign:'center', borderTop:`1px solid ${theme.palette.divider}`}}>
                        <Button onClick={handleReceiptSubmit} color="success" variant="contained">Issue Receipt</Button>
                    </Box>

                </>
                        
                   ):
                   (
                    'No Order please Add new Order'
                   )
                   }
                                            
                </Card>


                 

            </Container>

        </>
    )

};

export default MainSection