import {
    Box,
    Typography,
    useTheme,
    Container,
    Paper,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import BarChartMain from "./SalesInfo/BarCharts";
import LineChartHome from "./SalesInfo/LineChart";
import useAxiosWithInterceptor from "../../helper/jwtinterceptor";
import SalesInfo from "./SalesInfo/SalesInfo"

type SaleRecord = { net_sales?: number; gross_sales?: number, cost_of_sales?:number };
type typeSales = {
    
        today:SaleRecord;
        yesterday:SaleRecord;
        this_week:SaleRecord;
        this_month:SaleRecord;
        last_week:SaleRecord;
        last_month:SaleRecord
    
    
}


const HomeMainSection = () => {
    const theme = useTheme();
    const jwtAxios = useAxiosWithInterceptor();
    const [drawerOpen, setDrawerOpen] = React.useState(true);
    const [xLabelsMonthlySales , SetxLabelsMonthlySales] = useState<string[]>([])
    const [labelsDataMonthlySales , SetlabelsDataMonthlySales] = useState<number[]>([])
    const [xLabelsDailySales , setXLabelsDailySales] = useState<string[]>([])
    const [labelsDataDailySales , setLabelsDataDailySales] = useState<number[]>([])
    const [salesData, setSalesData] = useState<typeSales|null>(null)
    const outlet_id:string  = localStorage.getItem("outlet_id") || ""
    const [noOutletError , setNoOutletError] = useState<null | string>(null)
    React.useEffect(() => {
        console.log(drawerOpen)
                const handleDrawerToggle = (e: Event) => {
                const customEvent = e as CustomEvent;
                setDrawerOpen(customEvent.detail);
                };
                window.addEventListener("drawer-toggle", handleDrawerToggle);
                return () => window.removeEventListener("drawer-toggle", handleDrawerToggle);
    }, []);
    

   const getSalestData = async ()=>{
        

         try{
        const response = await jwtAxios.get(
        `http://127.0.0.1:8000/api/sales_info/?outlet_id=${outlet_id}`,{
            withCredentials:true
        })
        if(response.data?.error){
            setNoOutletError(response.data?.error)
        }
        console.log(response.data)
        setSalesData(response.data)
        return response.data
    }catch(err:any){
        if (err.response?.status === 400) {
                throw new Error("400");
            }
        throw err;
        
    }
    
    }

    const getSalesChartData = async ()=>{
        

         try{
        const response = await jwtAxios.get(
        `http://127.0.0.1:8000/sales/info/?outlet_id=${outlet_id}`,{
            withCredentials:true
        })
        const dailysalesData = response.data['daily_sales']
        
        const dailyLablesData :number[]= []
        const dailyLables:string[] = []

        for(let x in dailysalesData){
            dailyLables.push(dailysalesData[x]['daily'])
            dailyLablesData.push(dailysalesData[x]['total_daily'] ?? 0)
            console.log(dailyLablesData)
            
        }
        setXLabelsDailySales(dailyLables)
        setLabelsDataDailySales(dailyLablesData)

        const monthlySalesData = response.data['monthly_sales']
        console.log(monthlySalesData)
        const MonthlyLablesData :number[]= []
        const MonthlyLables:string[] = []
        for(let x in monthlySalesData){
            MonthlyLables.push(monthlySalesData[x]['month'])
            MonthlyLablesData.push(monthlySalesData[x]['total'] ?? 0)
            
        }
        SetxLabelsMonthlySales(MonthlyLables)
        SetlabelsDataMonthlySales(MonthlyLablesData)
        return response.data
    }catch(err:any){
        if (err.response?.status === 400) {
            console.log(err.response)
                throw new Error("400");
            }
        throw err;
        
    }
    
    }
    
    useEffect(() => {
       
        getSalesChartData();
        getSalestData();
    }, []);


    


    return (
        <>
            <Container maxWidth="lg"   sx={{width:"100%", overflow:"hidden"}}>
                {noOutletError &&
                <Paper sx={{m:2}} elevation={3} >
                        <Typography component="h4" sx={{color:"red", display:"block",fontSize:"1.3rem", p:2,margin:"1px auto", textAlign:"center"}}>
                        please Activate or add an Outlet to View Details
                    </Typography>
                </Paper>
                     
                }
               
                <Box>
                    <Typography variant="h3" sx={{fontFamily:"sans-serif", color:theme.palette.primary.main, p:2, m:0}}>
                        Dashboard
                        <Typography variant="body1" sx={{mt:2, fontSize:'0.4em', fontFamily:'inherit'}}>
                            Dashboard
                        </Typography>
                    </Typography>
                </Box>
                <Box>

                 {salesData && <SalesInfo salesData={salesData} />}
 

                </Box>
                <Box sx={{display:{lg:"flex",sm:"flex", xs:"block"}}}>
                    <Box sx={{flex:1}}>
                        <Typography variant="body1" sx={{p:2,color:theme.palette.primary.main,fontFamily:"sans-serif"}}>This Week Chart Summary</Typography>
                        <BarChartMain 
                            xLabels={xLabelsMonthlySales}
                            uData={labelsDataMonthlySales}
                            />

                    </Box>
                    <Box sx={{flex:1}}>
                        <Typography variant="body1" sx={{p:2,color:theme.palette.primary.main,fontFamily:"sans-serif"}}>Monthly Chart Summary</Typography>
                        <LineChartHome
                            pData={labelsDataDailySales}
                            xLabels={xLabelsDailySales}
                        />

                    </Box>
                </Box>
                
                
            
            </Container>
        </>
    )

};

export default HomeMainSection