import {
    useTheme,
    Container,
    useMediaQuery,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import useAxiosWithInterceptor from "../../helper/jwtinterceptor";
import SalesByProductInfo from "./salesByProductInfo/SalesByProductInfo";
import { useAuthServiceContext } from "../../context/AuthContext";
import { BASE_URL } from "../../congif";


interface productDetailsProps{
    id:number;
    product_name:string;
    total_amount:number;
    profit_rank:string;
    total_qty:number;
}

interface SalesByProductProps {
        date_range:productDetailsProps[];
        today:productDetailsProps[];
        yesterday:productDetailsProps[];
        this_week:productDetailsProps[];
        this_month:productDetailsProps[];
        last_week:productDetailsProps[];
        last_month:productDetailsProps[]   
}


const MainSalesByProduct = () => {
    const theme = useTheme();
    const jwtAxios = useAxiosWithInterceptor();
    const [drawerOpen, setDrawerOpen] = React.useState(true);
    const [salesProductData, setSalesProductData] = useState<SalesByProductProps | null>(null)
    const below750 = useMediaQuery("(max-width : 750px)");
    const {activeOutletId} = useAuthServiceContext();
    const [outletId, setOutletId] = useState("")
    
    useEffect(()=>{
                if(activeOutletId){
                    setOutletId(String(activeOutletId))
                }
                        console.log(activeOutletId)
        },[activeOutletId])
        
    React.useEffect(() => {
                const handleDrawerToggle = (e: Event) => {
                const customEvent = e as CustomEvent;
                setDrawerOpen(customEvent.detail);
                };
                window.addEventListener("drawer-toggle", handleDrawerToggle);
                return () => window.removeEventListener("drawer-toggle", handleDrawerToggle);
    }, []);
    
    const drawerWidth = drawerOpen ? theme.primaryDraw.width : theme.primaryDraw.closed;

   const getSalesDByProductdata = async ()=>{
        try{
            const response = await jwtAxios.get(
            `${BASE_URL}/products_info/?outlet_id=${outletId}`,{
                withCredentials:true
            })
            console.log(response.data)
            setSalesProductData(response.data)
            return response.data
        }catch(err:any){
            console.log(err.response)
            if (err.response?.status === 400) {
                    throw new Error("400");
                }
            throw err;
            
        }
    
    }
 
    useEffect(() => {
       if(outletId === "") return;

        getSalesDByProductdata();
    }, [outletId]);



    return (
        <>
            <Container  
            sx={{width:below750?"100%":`calc(100vw - ${drawerWidth}px)`,mt:3, ml:below750?"5px":`${drawerWidth}px`,height:"100%", overflow:"hidden"}}
            >
                
            
                 {salesProductData && <SalesByProductInfo salesProductData={salesProductData} />}
 

                
                
            
            </Container>
        </>
    )

};

export default MainSalesByProduct