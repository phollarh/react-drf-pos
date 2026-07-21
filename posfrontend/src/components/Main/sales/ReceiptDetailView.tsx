import { Box, Button, Card, CardActions, CardContent, Container, Divider, List, ListItem, ListItemText, Typography, useTheme } from '@mui/material';
import { format } from 'date-fns';
import React from 'react';
import { forwardRef } from "react";
import { UseReactToPrintFn } from 'react-to-print';
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
    amount_tenderd:number
    balance_due: number;
    payment_option:string;
    orders:OrderProps[];
    issued: boolean;
    remarks: string
    total: number
    

}

interface ReceiptDialogueProps {
  data: Server[];
  receiptId:number;
  date:string;
  amountTenderd:number;
  balance_due:number;
  total:number;
  remarks:string;
  issued:boolean;
  orders:OrderProps[];
  payment_option:string;
  OnclickPrint: UseReactToPrintFn;
 
  onClose?:() => void;

}

const ReceiptDetailView = forwardRef<HTMLDivElement, ReceiptDialogueProps>(
    (
        {
            data,
            OnclickPrint,
            receiptId,
            date,
            balance_due,
            amountTenderd,
            total,
            remarks,
            issued,
            orders,
            payment_option,
            onClose,
        },
        ref
    ) => {
        
          const theme = useTheme();
            const style = {
                py: 0,
                width: '100%',
                // maxWidth: 360,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                };

            
            function formatDate(dateString: string) {
                          const date = new Date(dateString);
                          // const time=date.toTimeString()
                    
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
    <>
    <div ref={ref}>
        <Container component="main" maxWidth="lg">
        <Card
            sx={{
                height: "100%",
                width:"100%",
                padding:1,
                '&:hover':{
                        backgroundColor:theme.palette.action.hover,
                     }
                                        
                                        
                }}
            >
            <CardContent sx={{height:'100%', p: 2 }}>
                <>
                <Box>
                    <Typography>
                        Issued by : Admin
                    </Typography>
                    <Typography>
                        Receipt id : {`#00${receiptId}`}
                    </Typography>
                    <Typography>
                        Date : {`${formatDate(date).fullDate} ${formatDate(date).hour}:${formatDate(date).minutes}  ${formatDate(date).period}` }
                    </Typography>
                </Box>
                <List sx={style}>
                    <ListItem>
                                             
                    <ListItemText
                    disableTypography
                    
                    primary={
                    <Box sx={{
                        // display:"flex"
                        m:0, 
                        p:0
                        // justifyContent:"space-between"
                        }}>
                         {orders.map((item)=>{
                            return(
                                    <React.Fragment key={item.id}>
                                        <Box sx={{display: "flex", justifyContent:"space-between"}}>
                                            <Typography
                                            noWrap
                                            variant="body2"
                                            textAlign="start"
                                            sx={{
                                                fontWeight: 700,

                                            }}>
                                            {item.product.product_name}
                                            <Typography component="span" display="block">{item.quantity} X {item.product.selling_price}</Typography>
                                            
                                            
                                            </Typography>
                                            
                                            <Typography></Typography>
                                            <Typography
                                            noWrap
                                            variant="body2"
                                            textAlign="start"
                                            sx={{
                                                    fontWeight: 700,
                                                    
                                                }}>
                                            {item.sub_total}
                                            </Typography>
                                        </Box>
                                        <Divider/>
                                    </React.Fragment>
                                )
                            })}
                    </Box>}
                                                        
                    secondary={
                                <>
                                <Box sx={{display:"flex",m:1, justifyContent:"space-between" }}>
                                        <Typography
                                        variant="body2"
                                        sx={{fontWeight:800}}
                                                                
                                        >
                                           Sub total

                                        </Typography>
                                        <Typography></Typography>
                                                           
                                        <Typography
                                            variant="body2"
                                            sx={{fontWeight:800}}
                                        >
                                            {total}

                                        </Typography>

                                     </Box>
                                     <Box sx={{display:"flex",m:1, justifyContent:"space-between" }}>
                                        <Typography
                                        variant="body2"
                                        sx={{fontWeight:800}}
                                                                
                                        >
                                            Tax

                                        </Typography>
                                        <Typography></Typography>
                                                           
                                        <Typography
                                            variant="body2"
                                            sx={{fontWeight:800}}
                                        >
                                            

                                        </Typography>

                                     </Box>
                                    <Box sx={{display:"flex",m:1, justifyContent:"space-between" }}>
                                        <Typography
                                        variant="body2"
                                        sx={{fontWeight:800}}
                                                                
                                        >
                                            Amount Tendered

                                        </Typography>
                                        <Typography></Typography>
                                                           
                                        <Typography
                                            variant="body2"
                                            sx={{fontWeight:800}}
                                        >
                                            {amountTenderd}

                                        </Typography>

                                     </Box>
                                      <Box sx={{display:"flex",m:1, justifyContent:"space-between" }}>
                                        <Typography
                                        variant="body2"
                                        // sx={{fontWeight:800}}
                                                                
                                        >
                                            Payment Method

                                        </Typography>
                                        <Typography></Typography>
                                                           
                                        <Typography
                                            variant="body2"
                                            // sx={{fontWeight:800}}
                                        >
                                            {payment_option}

                                        </Typography>

                                     </Box>
                                       <Box sx={{display:"flex",m:1, justifyContent:"space-between" }}>
                                        <Typography
                                        variant="body2"
                                        // sx={{fontWeight:800}}
                                                                
                                        >
                                            Balance Due

                                        </Typography>
                                        <Typography></Typography>
                                                           
                                        <Typography
                                            variant="body2"
                                            // sx={{fontWeight:800}}
                                        >
                                            {balance_due}

                                        </Typography>

                                     </Box>

                                    <Box sx={{display:"flex", pt:2,borderTop:`1px solid ${theme.palette.divider}`, mt:1, justifyContent:"space-between" }}>
                                                            
                                        <Typography
                                        variant="body2"
                                        sx={{fontWeight:800}}                         
                                        >
                                            Total
                                        </Typography>
                                        <Typography></Typography>
                                                           
                                        <Typography
                                            variant="body2"
                                            sx={{fontWeight:800}}
                                        >
                                            {total}
                                        </Typography>
                                     </Box>                       
                                </>             
                            }
                            />
                    </ListItem>
                </List>
                
                </>
            
            </CardContent>
            <CardActions>
                <Button onClick={OnclickPrint}>
                    Print
                </Button>
            </CardActions>
        </Card>



    </Container>
    </div>
    
    </>
    );
    });

export default ReceiptDetailView