import { ChevronLeft, ChevronRight } from "@mui/icons-material"
import { Box, Button, Card, CardActions, CardContent, IconButton, ListItem, ListItemIcon, ListItemText, Typography, useTheme } from "@mui/material"
import ProductionQuantityLimitsOutlinedIcon from '@mui/icons-material/ProductionQuantityLimitsOutlined';


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
    // id: number;
    orders: orderType[];
    remarks?: string;
    date?: string;
    issued?:boolean;
    total?:number
    
}
// : React.FC<Server> =
const CreateReceiptInner = ({selling_price, sold_In, product_name,stock_inventory}) => {
     const theme = useTheme();
    return (

            <Card
                sx={{
                        height: "100%",
                        padding:1,
                         '&:hover':{
                                        backgroundColor:theme.palette.action.hover,
                                    }                    
                    }}
            >

                    <CardContent sx={{m:0, p: 0, "&:last-child": { paddingBottom: 0 } }}>
                        <ListItem disablePadding>
                            <ListItemIcon sx={{ minWidth: 0, pr:1 }}>
                                <ProductionQuantityLimitsOutlinedIcon/>
                            </ListItemIcon>
                        <ListItemText
                            disableTypography
                             //textOverflow:"ellipsis" this add '...' to the end of the text when it exceed the given space so the text dosent move to the next line
                             primary={
                                        <Typography
                                            variant="body2"
                                            textAlign="start"
                                            sx={{
                                                    fontWeight: 700,
                                                    textOverflow: "ellipsis",
                                                    overflow: "hidden",
                                                    whiteSpace: "nowrap"
                                                 }}>
                                                    {product_name} 
                                        </Typography>}
                                            secondary={
                                                <>
                                                    <Typography
                                                        variant="body2"
                                                    >
                                                        {selling_price} {sold_In}

                                                    </Typography>
                                                            { stock_inventory > 0 &&
                                                    <Typography
                                                        variant="body2"
                                                    >
                                                        {stock_inventory} in stock

                                                    </Typography>}
                                                            
                                                    <Typography
                                                        variant="body2"
                                                    >
                                                        {category}

                                                    </Typography>
                                                </>}
                                                />
                                            </ListItem>
                    </CardContent>
                    <CardActions sx={{justifyContent:'center',alignItems:'center',m:0, height:'50%'}}>
                            <Button onClick={()=>{handleClick(item.id)}} variant="contained" size="small"><AddShoppingCartOutlinedIcon/></Button>
                    </CardActions>
                                    
            </Card>
        
    )
}
export default CreateReceiptInner