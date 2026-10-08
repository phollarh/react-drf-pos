import {
    ListItem,
    ListItemText,
    Box,
    Typography,
    useTheme,
    Container,
    Grid,
    Card,
    CardContent,
    Paper,
    SelectChangeEvent
} from "@mui/material";
import useCrud from "../../hooks/useCrud";
import React, { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import { useNavigate } from "react-router-dom";
import useAxiosWithInterceptor from "../../helper/jwtinterceptor"
import OutletFilterSelection from "../OutletFilterSelection";
import { useAuthServiceContext } from "../../context/AuthContext";
import { BASE_URL } from "../../congif";


interface Server {
    id: number;
    product_name: string;
    sold_In: string;
    selling_price: number;
    stock_inventory: number
    category: string
    cost_price?:string
    user?:number
    

}

const MainSection = () => {
    const navigate = useNavigate();
    const jwtAxios = useAxiosWithInterceptor();
    const theme = useTheme();
    const [drawerOpen, setDrawerOpen] = React.useState(true);
    const {activeOutletId, userId} = useAuthServiceContext();
    const [outletId, setOutletId] = useState("")

    useEffect(()=>{
            if(activeOutletId){
                setOutletId(String(activeOutletId))
            }
                    
    },[activeOutletId])
    

    const [filterOption, setFilterOption] = React.useState(() => outletId || "" );
    React.useEffect(() => {
                const handleDrawerToggle = (e: Event) => {
                const customEvent = e as CustomEvent;
                setDrawerOpen(customEvent.detail);
                };
                window.addEventListener("drawer-toggle", handleDrawerToggle);
                return () => window.removeEventListener("drawer-toggle", handleDrawerToggle);
    }, []);
    
    const drawerWidth = drawerOpen ? theme.primaryDraw.width : theme.primaryDraw.closed;
    const style = {
                p:1,
                m:1,
                width: '100%',
                // maxWidth: 360,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                };
    
    const handleOutletChange = async (event:SelectChangeEvent)=>{
                        const value = event.target.value as string
                        setFilterOption(value) 
                          localStorage.setItem("outlet_id", value)  
        }
     const url = React.useMemo(() => {
            let base = `/products/`;
            const params = new URLSearchParams();
    
            if (filterOption !== "") {
                params.append("outlet_id", filterOption);
            }

    
            if (params.toString()) {
                base += `?${params.toString()}`;
            }
            
    
            return base;
        }, [filterOption]);
    const { dataCRUD,  error } = useCrud<Server>([], url)
    
    // useEffect(() => {
    //     fetchData();

    // }, []);

    // useEffect(() => {
    //     console.log(dataCRUD)

    // }, [dataCRUD]);
    // const userId = localStorage.getItem('user_id')
    const handleClick = async (id:number )=>{
        try {
            const response = await jwtAxios.post(`${BASE_URL}/order/`,
                {
                    user:userId,
                    'product':id,
                    'quantity':1
                } ,
            {
                withCredentials: true,
            });
            const data = response.data;
            console.log(data);
            navigate('/sales')
            
            return data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                new Error("400");
            }
            throw error;
        }
    };
    

    return (
        <>
            <Container  sx={{width:`calc(100vw - ${drawerWidth}px)`, ml:`${drawerWidth}px`}}>
                <Box sx={{m:2,background:theme.palette.primary.light,borderRadius:"15px", pt: 2 , display:error?"block":"flex", justifyContent:"space-between"}}>
                    {error?
                    (
                        <Paper sx={{display:"block",m:"1px auto",alignContent:"center", backgroundColor:theme.palette.primary.light}}>
                            <Box >
                                <Typography color="error" variant="h6" sx={{textAlign:"center"}}>
                                    {error}
                                </Typography>
                            </Box>
                        </Paper>
                    ):
                    (
                        <Typography variant="h4"
                        noWrap
                        sx={{
                            m:1,
                            p:1,
                            display: {
                                fontWeight: 150,
                                fontSize: "20px",
                                letterSpacing: "-2px"
                            },
                        }}
                    >
                        {dataCRUD?.length > 0 ? 'Product Lists' : "No Products Added...Please Add Product"}

                    </Typography>

                    )
                    
                    }
                    
                    <Typography flexGrow={1}></Typography>
                    <Typography  component="span" 
                    sx={{m:1, p:1, display:"none"}}
                    >
                        <OutletFilterSelection filterOption={filterOption} handleChange={handleOutletChange}/>
                    </Typography> 
                </Box>
                {!error&&

                        <Paper sx={style}>
                    <Grid container spacing={2}>
                    {dataCRUD.map((item) => {
                        return (
                            <Grid  key={item.id} 
                             size={{ xs: 6, md: 3 }}
                            >
                                <Card
                                    sx={{
                                        // width:"50%",
                                        height: "100%",
                                    }}
                                >

                                        <CardContent sx={{height:'70%', p: 0, "&:last-child": { paddingBottom: 0 } }}>
                                            <ListItem disablePadding>
                                                <ListItemText
                                                    disableTypography
                                                    //textOverflow:"ellipsis" this add '...' to the end of the text when it exceed the given space so the text dosent move to the next line
                                                    primary={
                                                        <Typography
                                                            
                                                            variant="body2"
                                                            textAlign="center"
                                                            sx={{
                                                                fontWeight: 700,
                                                                textOverflow: "ellipsis",
                                                                overflow: "hidden",
                                                                whiteSpace: "nowrap"
                                                            }}>
                                                            {item.product_name} 
                                                        </Typography>}
                                                    secondary={
                                                        <>
                                                             <Typography
                                                             textAlign="center"
                                                                variant="body2"
                                                            >
                                                                 {item.selling_price} {item.sold_In}

                                                            </Typography>
                                                            { item.stock_inventory > 0 &&
                                                                <Typography
                                                                textAlign="center"
                                                                variant="body2"
                                                            >
                                                                 {item.stock_inventory} in stock

                                                            </Typography>
                                                            }
                                                            
                                                            <Typography
                                                            textAlign="center"
                                                                variant="body2"
                                                            >
                                                                {item.category}

                                                            </Typography>
                                                        </>
                                                       }
                                                />
                                            </ListItem>
                                           
                                        </CardContent>
                                        <CardActions sx={{display:'block'}}>
                                            <Box sx={{mb:2,height:'20%',display:"block", textAlign:"center" }}>
                                                <Button onClick={()=>handleClick(item.id)} variant="outlined" color="success">
                                                    <AddShoppingCartOutlinedIcon />
                                                </Button>
                                            </Box>
                                            
                                        </CardActions>
                                         
                                            
                                </Card>
                                

                            </Grid>
                        )
                    })}
                </Grid> 

                </Paper>
                }
                
                
            </Container>

        </>
    )

};

export default MainSection