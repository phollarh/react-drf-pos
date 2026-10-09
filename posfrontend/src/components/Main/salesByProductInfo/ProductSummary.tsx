import { Box, Divider, Grid, List, ListItem, ListItemText, Paper, SelectChangeEvent, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import FilterSalesByProduct from "./FilterSalesByProduct";
import { useEffect, useState } from "react";
import React from "react";
import DialogForCustomDate from "./DialogForCustomDate";
import { Dayjs } from "dayjs";
import useAxiosWithInterceptor from "../../../helper/jwtinterceptor";
import { useParams } from "react-router-dom";
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import { BASE_URL } from "../../../congif";
import SalesByProductChart from "./SalesByProductChart";
import { useAuthServiceContext } from "../../../context/AuthContext";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import MinimizeIcon from '@mui/icons-material/Minimize';

interface productDetailsProps{
    id:number;
    product_name:string;
    total_qty:number;
    total_amount:number;
    total_profit:number;
    sales_contribution: string;
}
interface SalesByProductProp {
        date_range:productDetailsProps[];
        today:productDetailsProps[];
        yesterday:productDetailsProps[];
        this_week:productDetailsProps[];
        this_month:productDetailsProps[];
        last_week:productDetailsProps[];
        last_month:productDetailsProps[]   
}
interface weeklySalesProps {
        "Monday": number;
        "Tuesday": number;
        "Wednesday": number;
        "Thursday": number;
        "Friday": number;
        "Saturday":number
        "Sunday": number
    
}

interface inventoryProps {

    action : string;
    id:number;
    quantity:number;
    created_at : string
    performed_by:string

}

export default function ProductSummary() {
    const theme = useTheme()
    const jwtAxios = useAxiosWithInterceptor();
    const [salesProductData, setSalesProductData] = useState<SalesByProductProp | null>(null)
    const [salesWeeklyData, setSalesWeeklyData] = useState<weeklySalesProps | null>(null)
    const [productInventoryData, setProductInventoryData] = useState<inventoryProps[]>([])
    const [inventoryMessage,setInventoryMessage] = useState("")
    const [disableButton, setDisableButton] = useState(false)
    const [filterOption, setFilterOption] = useState('today')
    const [showDialogForCustom, setShowDialogForCustom] = React.useState(false);
    const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
    const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
    const {productId} =useParams();
    const isBelow1000 = useMediaQuery("(max-width : 1000px)");
    const isDarkMode = theme.palette.mode === "dark"
    const[outputedSalesDataState, setOutputedSalesData] = React.useState<productDetailsProps[]>([])
    const [change , setChange] =useState<
        {
            "percentage_change":number;
            "compareAgainst":string ; 
            "filterOprion":string} | null    
        >(null)

    const {activeOutletId} = useAuthServiceContext();
    const [outletId, setOutletId] = useState("")

    useEffect(()=>{
            if(activeOutletId){
                setOutletId(String(activeOutletId))
            }
                    
    },[activeOutletId])
    


    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        
        const isToday =
                date.getFullYear() === now.getFullYear() &&
                date.getMonth() === now.getMonth() &&
                date.getDate() === now.getDate();

        if (isToday) {
            return date.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
            });
        }

        return date.toLocaleDateString([], {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };
    
    const getInventorydetials = async ()=>{
         try{
                const response = await jwtAxios.get(
                `${BASE_URL}/inventory_log/?product_id=${productId}`,
                {
                    headers:{
                        "X-Count-Header":productInventoryData.length <= 0 ? 0: productInventoryData.length
                    },
                    withCredentials:true
                })
    
                setProductInventoryData(response.data["data"])
                setDisableButton(response.data["disable_button"])
                setInventoryMessage(response.data["message"])
                return response.data
            }catch(err:any){
                    if (err.response?.status === 400) {
                            throw new Error("400");
                        }
                    throw err;
                    
                }
        }
    useEffect(()=>{
        if(!outletId) return;
        const getDetailedProductSales = async ()=>{
                try{
                const response = await jwtAxios.get(
                `${BASE_URL}/products_info/?outlet_id=${outletId}&product_id=${productId}`,{
                    withCredentials:true
                })
                setSalesProductData(response.data)
                
                return response.data
            }catch(err:any){
                if (err.response?.status === 400) {
                        throw new Error("400");
                    }
                    throw err;
                
                }
        }
    getDetailedProductSales();
    getInventorydetials();
 
    },[outletId,productId])
      
    useEffect(()=>{
        if(!outletId) return;
        const getDetailedProductSales = async ()=>{
         try{
                const response = await jwtAxios.get(
                `${BASE_URL}/product_sales/info/?outlet_id=${outletId}&product_id=${productId}`,{
                    withCredentials:true
                })
                setSalesWeeklyData(response.data?.daily_sales)
                return response.data
        }catch(err:any){
                if (err.response?.status === 400) {
                        throw new Error("400");
                    }
                throw err;
        
            }
    
        }
        getDetailedProductSales()
 
    },[outletId,productId])
    // console.log(salesProductData?.[filterOption as keyof SalesByProductProp][0].total_amount)
    const handleChange=(event: SelectChangeEvent)=>{
        const newValue = event.target.value as string
        
        if(newValue === "custom"){
           setShowDialogForCustom(true)
           return;
        }
        if(newValue === "date_range"){
           setShowDialogForCustom(true)
           return;
        }

        setFilterOption(newValue);
        
      }
    const handleCloseDialog = () => {
        setShowDialogForCustom(false);
    };

    React.useEffect(() => {
          
            if (filterOption !== "custom"){
    
             setOutputedSalesData(salesProductData?.[filterOption as keyof SalesByProductProp]?? [])
            
        }
        console.log(outputedSalesDataState, salesProductData)
     }, [filterOption,salesProductData]);
          console.log(outputedSalesDataState, salesProductData)


    

    const handleCustomdateAPICall = async ()=>{
        
        if (!startDate || !endDate || !outletId) return;
        console.log('got here 2')
        if(startDate && endDate){
            const startDateFormate = startDate.format("YYYY-MM-DD");
            const EndDateFormate = endDate.format("YYYY-MM-DD")
             try{
                    const response = await jwtAxios.get(
                    `${BASE_URL}/products_info/?outlet_id=${outletId}&product_id=${productId}&end_date_range=${EndDateFormate}&start_date_range=${startDateFormate}`,{
                        withCredentials:true
                    })
                
                    setOutputedSalesData(response.data.date_range ?? [])
                    setFilterOption("date_range")

                    setSalesProductData(response.data)
                    // Object.entries(response.data).forEach(([key,value])=>{
                    //     if(key === "date_range"){
                    //         setFilterOption(key)
                    //     }
                    // });
                    
                    // setFilterOption(response.data.date_range)
                    
                    // setOutputedSalesData(newData)
                    // console.log(newData)
                    handleCloseDialog()
                    // setPage(0)
                    setEndDate(null)
                    setStartDate(null)
                    return response.data
                }catch(err:any){
                    if (err.response?.status === 400) {
                            throw new Error("400");
                        }
                    throw err;
                
                }
            
            }
        
    }
    useEffect(()=>{
        if(startDate && endDate){
            handleCustomdateAPICall()
        }
        
    }, [endDate, startDate]) 
  
    const getPercentageDiffOnQtySold = () =>{
        let percentChange = NaN
        let compareOption = ""
        if(filterOption === "today" || filterOption === "yesterday"){
            compareOption = filterOption === "today" ? "yesterday" : "today"
            
            const qty = Number(outputedSalesDataState[0].total_qty ?? 0)
            
            const qtyToCompare = Number(salesProductData?.[compareOption as keyof SalesByProductProp]?.[0]?.total_qty ?? 0)
              
            
            const getIfinity =qtyToCompare == 0 ? NaN: (qty-qtyToCompare)/qtyToCompare
            
            
            percentChange =getIfinity * 100
            console.log("ty",compareOption, filterOption,qty, qtyToCompare,percentChange)
        }else if(filterOption === "this_month" || filterOption === "last_month"){
            compareOption = filterOption === "this_month" ? "last_month" : "this_month"
            const qty = Number(outputedSalesDataState[0].total_qty ?? 0)
            
            const qtyToCompare = Number(salesProductData?.[compareOption as keyof SalesByProductProp]?.[0]?.total_qty ?? 0)
            const getIfinity =qtyToCompare == 0 ? NaN: (qty-qtyToCompare)/qtyToCompare
            console.log(getIfinity)
            percentChange = ( getIfinity * 100)
            console.log("tl",compareOption, filterOption,qty, qtyToCompare,percentChange)
        }else if (filterOption === "this_week" || filterOption === "last_week"){
            compareOption = filterOption === "this_week" ? "last_week" : "this_week"
             const qty = Number(outputedSalesDataState[0].total_qty ?? 0);
            
            const qtyToCompare = Number(salesProductData?.[compareOption as keyof SalesByProductProp]?.[0]?.total_qty ?? 0)
            const getIfinity =qtyToCompare == 0 ? NaN: (qty-qtyToCompare)/qtyToCompare
              
            
            percentChange = getIfinity * 100   
            console.log("tl",compareOption, filterOption,qty, qtyToCompare,percentChange)
        }
        console.log(percentChange, filterOption)
        return {"percentage_change":percentChange, "compareAgainst":compareOption , "filterOprion":filterOption}
    }
     useEffect(()=>{
        if(outputedSalesDataState.length <= 0 ) return
        const qtyRate = getPercentageDiffOnQtySold()
        setChange(qtyRate)
   },[outletId, outputedSalesDataState])  
   
    return(
        <>
        <Box>
              {showDialogForCustom && 
                    <DialogForCustomDate 
                    startDate={startDate}
                    endDate={endDate}
                    open={showDialogForCustom}
                    onEndDateChange ={(newValue)=>{setEndDate(newValue)}}
                     onStartDateChange= {(newValue)=>{setStartDate(newValue)}}
                    handleCloseDialog={handleCloseDialog}
                    onClick={handleCustomdateAPICall}
            
                />}
            <Paper  elevation={2} sx={{display:"block",m:2, backgroundColor:isDarkMode?"transparent":theme.palette.primary.light}}>
                <FilterSalesByProduct
                    productId={productId}
                    filterOption={filterOption}
                    handleChange={handleChange}
                                  
                />
            </Paper>
            <Grid  m={1} container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper  elevation={3} sx={{ height: 100, p:0  }} >
                    <List sx={{m:0, p:0}}>
                        <ListItem >
                            <ListItemText sx={{p:0, m:0}} 
                            slotProps={{
                                secondary:{component:"div", color:"inherit"},
                            
                            }}
                            primary={
                                <Typography sx={{}}>
                                    {filterOption.charAt(0).toUpperCase()}{filterOption.slice(1).split("_").join(" ")}'s Sales
                                   
                                </Typography>
                            }
                             secondary={
                                <>
                                    <Typography variant="h6"  sx={{fontWeight:500, textAlign:"center",fontSize:"1.1rem !important" ,fontFamily:"fangsong"}}>
                                    {/* {Number(salesProductData?.[filterOption as keyof SalesByProductProp][0].total_amount).toLocaleString() ?? 0} */}
                                    {outputedSalesDataState.length > 0 && outputedSalesDataState[0].total_amount.toLocaleString() }
                                    </Typography>
                                    <Typography sx={{textAlign:"center"}}>
                                        
                                         {outputedSalesDataState.length > 0 && 
                                       
                                        `${outputedSalesDataState[0].product_name.charAt(0).toUpperCase()}${outputedSalesDataState[0].product_name.slice(1).split("_").join(" ")}`
                                        
                                        }
                                    {/* <TransitEnterexitTwoToneIcon sx={{color:"blue", fontSize:"2em"}}/> */}
                                    
                                </Typography>
                                </>
                                
                            }
                            />
                           
                        </ListItem>
                    </List>
                    </Paper>
                </Grid> 
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={3} sx={{ height: 100 }} >
                        <List sx={{m:0, p:0}}>
                        <ListItem >
                            <ListItemText sx={{p:0, m:0}}  
                            slotProps={{
                                secondary:{component:"div", color:"inherit"}
                            }}
                            primary={
                                <Typography sx={{}}>
                                    {filterOption.charAt(0).toUpperCase()}{filterOption.slice(1).split("_").join(" ")}'s Issued Order
                                </Typography>
                            }
                             secondary={
                                <>
                                     <Typography variant="h6" sx={{fontSize:"1.1rem !important",fontWeight:500, textAlign:"center", fontFamily:"fangsong"}}>
                                    {salesProductData &&  salesProductData?.[filterOption as keyof SalesByProductProp][0].total_qty}
                                    
                                </Typography>
                                    <Typography 
                                        sx={{
                                            textAlign:"center",
                                            fontFamily:"fangsong",
                                            fontSize:"0.8rem",
                                            // fontWeight:600, 
                                            color:(change && Number.isNaN(change.percentage_change)) ? "#4a4848" : (change && change.percentage_change < 0) ?"#f44336":"#08ac3c",
                                            m:0, p:0, width:"100%", textOverflow:"ellipsis", overflow:"hidden", textWrap:"nowrap"}}>
                                        {   ( !change || Number.isNaN(change.percentage_change)) ? 
                                            (
                                                <MinimizeIcon sx={{fontSize:"1.9rem", m:0, p:0, color:"#2f2d2d"}}/>
                                            ):
                                            (change && change?.percentage_change < 0 ) ? 
                                                (
                                                    <ArrowDropDownIcon sx={{fontSize:"1.9rem", m:0, p:0, color:"#f44336"}}/>
                                                )
                                                :
                                                (
                                                    <ArrowDropUpIcon sx={{fontSize:"1.9rem", m:0, p:0, color:"#08ac3c"}}/>
                                                )
                                        }


                                        {/* {salesProductData && 
                                           `${Number(salesProductData?.[filterOption as keyof SalesByProductProp][0].sales_contribution).toFixed(1)}% `
                                           
                                        } */}
                                        {
                                            // Number(outputedSalesDataState[0].sales_contribution).toFixed(1)
                                            (
                                                change && filterOption === change.filterOprion && !Number.isNaN(change.percentage_change)
                                            ) ?
                                            // change.percentage_change < 0 ? `${String(change?.percentage_change.toFixed(1)).slice(1)}%`:
                                           ` ${Number(change?.percentage_change).toFixed(1)} %` : 'N/A'
                                        }
                                        <Typography component="span" sx={{color:`${theme.palette.primary.main} !important`, fontSize:"0.8rem"}}>
                                        {(change && filterOption === change.filterOprion  )&&
                                            
                                            `
                                                from ${change?.compareAgainst} 
                                                
                                            `
                                        }
                                         
                                        </Typography>
                                    </Typography>
                                    
                                </>
                               
                            }
                            />
                           
                        </ListItem>
                    </List>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={3} sx={{ height: 100 }} >
                        <List sx={{m:0, p:0}}>
                        <ListItem >
                            <ListItemText sx={{p:0, m:0}} 
                             slotProps={{
                                secondary:{component:"div", color:"inherit"}
                            }}
                            primary={
                                <Typography sx={{}}>
                                    {filterOption.charAt(0).toUpperCase()}{filterOption.slice(1).split("_").join(" ")}'s Total Profit
                                </Typography>
                            }
                             secondary={
                                <>
                                    <Typography variant="h6"  sx={{fontWeight:500, textAlign:"center", fontFamily:"fangsong", fontSize:"1.1rem !important"}}>
                                        {/* {salesProductData && Number(salesProductData?.[filterOption as keyof SalesByProductProp][0].total_profit).toLocaleString()} */}
                                        {outputedSalesDataState.length > 0 && outputedSalesDataState[0].total_profit.toLocaleString()}
                                    </Typography>
                                  <Typography sx={{textAlign:"center"}}>
                                        <AssuredWorkloadIcon sx={{fontSize:"2em", color:theme.palette.primary.main}}/>
                                        
                                    </Typography>
                                </>
                               
                            }
                            />
                           
                        </ListItem>
                    </List>
                    </Paper>
                </Grid>        
            </Grid>
            <Box sx={{display:isBelow1000?"block":"flex"}}>
                <Box 
                flexGrow={1.1}
                 >
                <Paper sx={{m:1,}} elevation={4} >
                    <Typography variant="h5" sx={{fontWeight:700, m:1,p:3, fontFamily:"sans-serif"}}>
                        Sales Overview
                    </Typography>
                    <Box sx={{minWidth:0, width:"100%"}}>
                            <SalesByProductChart salesWeeklyData={salesWeeklyData}/>
                    </Box>
                    
                </Paper>
                </Box>
                <Box  flexGrow={1} sx={{width:isBelow1000?"100%":"40%", m:isBelow1000?2:1, height:390, overflowY:"auto"}}>
                    <Paper sx={{width:"100%" ,display: "flow-root"}} elevation={4}>
                        <Box width="100%" sx={{backgroundColor:isDarkMode?"transparent":theme.palette.primary.light}}>
                            <Typography variant="h6" sx={{fontWeight:700, m:0,p:1, fontFamily:"sans-serif", color:isDarkMode?theme.palette.primary.contrastText:"inherit"}}>
                                Inventory Summary
                            </Typography>
                        </Box>
                        <List>
                             <ListItem>
                                <ListItemText
                                    primary={
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            <Typography sx={{ width: "30%" }}>
                                                Performed By
                                            </Typography>
                                            <Typography sx={{ width: "20%" }}>
                                                Action
                                            </Typography>

                                            <Typography sx={{ width: "30%" }}>
                                                Quantity
                                            </Typography>

                                            <Typography sx={{whiteSpace:"nowrap",textOverflow:"ellipsis",overflow:"hidden", width: "20%" }}>
                                                Created At
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                            <Divider/>
                            {productInventoryData.length >=1 && productInventoryData.map((item)=>{
                                return(
                                <React.Fragment key={item.id}>
                                    <ListItem key={item.id} sx={{cursor:"pointer",":hover":{backgroundColor:isDarkMode?theme.palette.primary.main:theme.palette.primary.light}}}>
                                        <ListItemText key={item.id}
                                        primary={
                                            <>
                                                
                                                <Box sx={{display:"flex", justifyContent:"space-between"}}>
                                                     <Typography sx={{width:"30%", fontWeight:600,fontSize:"0.8rem", textOverflow:"ellipsis",overflowX:"hidden"}}>
                                                        {item.performed_by.charAt(0).toUpperCase()}{item.performed_by.slice(1)}
                                                    </Typography>
                                                    <Typography sx={{width:"20%",fontSize:"0.8rem"}}>
                                                        {item.action.charAt(0).toLowerCase()}{item.action.slice(1)}
                                                    </Typography>
                                                    <Typography sx={{width:'30%',fontSize:"0.8rem"}}>
                                                    {Number(item.quantity).toFixed(2)}
                                                    </Typography>
                                                    <Typography sx={{width:"20%", fontSize:"0.8rem"}}>
                                                    {formatDate(item.created_at) }
                                                    </Typography>
                                                </Box>
                                                
                                            </>
                                            
                                            
                                        }
                                        />
                                    </ListItem>
                                    <Divider/>
                                </React.Fragment>
                                )
                            })}
                            
                        </List>
                        {productInventoryData.length >= 1 && (

                        <Box component="button" onClick={getInventorydetials}
                        disabled={disableButton === true ? true : false}
                            sx={{
                                cursor:disableButton === true ?" not-allowed":"pointer",
                                border : "none", 
                                backgroundColor:disableButton === true ? "#bbc3de": "#34316c",borderRadius:2,p:1, 
                                margin:"10px auto", textAlign:"center", 
                                display:"block",
                                ":hover":{backgroundColor:"#9eb0ea !important"}
                            
                                }}>
                            <Typography sx={{color:"#fff"}}>{inventoryMessage}</Typography>
                        </Box>

                        )
                        
                        }
                        
                    </Paper>
                </Box>
                
                
            </Box>
        </Box>
            
        </>
  );

}
