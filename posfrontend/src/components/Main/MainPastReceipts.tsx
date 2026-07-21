import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Typography,
    useTheme,
    Container,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Button,
    Paper,
    SelectChangeEvent
} from "@mui/material";
import useCrud from "../../hooks/useCrud";
import React, { useEffect } from "react";
import useAxiosWithInterceptor from "../../helper/jwtinterceptor";
import { format } from "date-fns";
import Divider from '@mui/material/Divider';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import PastReceiptView from "./sales/PastReceiptView";
import PaginationControlled from "../pagination/Pagination";
import PaginationSizeForm from "../pagination/PaginationSizeForm";
import FilterDateForm from "../FilterDateForm";
import { Dayjs } from "dayjs";


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
    balance_due: number;
    amount_tenderd:number;
    payment_option:string;
    orders:OrderProps[];
    issued: boolean;
    remarks: string
    total: number
}

interface DataCrudProps {
    count : number;
    next:string
    previous:string | null;
    results: Server[]
}


const MainPastReceipts = () => {
    const theme = useTheme();
    const [drawerOpen, setDrawerOpen] = React.useState(true);
    const [filterOption, setFilterOption] = React.useState("today")
    const jwtAxios = useAxiosWithInterceptor();
    const [open, setOpen] = React.useState(false);
    const [scroll, setScroll] = React.useState<DialogProps['scroll']>('paper');
    const [showDialogForCustom, setShowDialogForCustom] = React.useState(false);
    React.useEffect(() => {
                const handleDrawerToggle = (e: Event) => {
                const customEvent = e as CustomEvent;
                setDrawerOpen(customEvent.detail);
                };
                window.addEventListener("drawer-toggle", handleDrawerToggle);
                return () => window.removeEventListener("drawer-toggle", handleDrawerToggle);
    }, []);
    
    const drawerWidth = drawerOpen ? theme.primaryDraw.width : theme.primaryDraw.closed;
    const [page, setPage] = React.useState(1);
    const [size, setSize] = React.useState<number|null>(null);
    const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
    const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
    const [tempStartDate, setTempStartDate] = React.useState<Dayjs | null>(null);
    const [tempEndDate, setTempEndDate] = React.useState<Dayjs | null>(null);
    const [searchById, setSearchById] = React.useState<string>("");
    const outlet_id:string  = localStorage.getItem("outlet_id") || ""
    
    const url = React.useMemo(() => {
        const params = new URLSearchParams();

    
        params.append("issued", "true");

        if (outlet_id) {
            params.append("outlet_id", outlet_id);
        }
        if (filterOption === "custom") {
            if (!startDate || !endDate) return null;
            
                params.append("startDate", startDate.format("YYYY-MM-DD"))
                params.append("endDate", endDate.format("YYYY-MM-DD"))
        
                
            } else {
                params.append("dateRange", filterOption)
            }
        if (page) {
            params.append("page", String(page));
        }

        if (size) {
            params.append("size", String(size));
        }

        if (searchById) {
            params.append("search", searchById);
        }
        console.log(`/sales_receipt/?${params.toString()}`);
        return `/sales_receipt/?${params.toString()}`
    
    }, [outlet_id,page,filterOption, startDate,endDate,size, searchById]);


    const { dataCRUD,dataCRUDPaginate, fetchData, error } = useCrud<Server>([], url )
    useEffect(() => {
            if (!url) return; 

            fetchData();
        }, [url]);

    
    const handleChangePagination =(event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);      
      };
    const handlePaginationSize =(event: SelectChangeEvent<string>) => {
        const value = event.target.value
        setSize( value === ""?  null: Number(value));    
        
      };
    const handleSearchClick = (event:React.ChangeEvent<HTMLInputElement>)=>{
        const inputId = event.target.value.trim()
        setSearchById(inputId)
    }

    useEffect(() => {
        fetchData();

    }, [page, size, searchById]);

    const [data, setData] = React.useState<Server[]>([])
        useEffect(() => {
            setData(dataCRUD)
    }, [dataCRUD]);
    console.log(data)
        useEffect(() => {
            console.log(dataCRUDPaginate)
    
        }, [dataCRUDPaginate]);

    const handleFilterChange=(event: SelectChangeEvent)=>{
        const newValue = event.target.value as string
        
        if(newValue === "custom"){
                 setShowDialogForCustom(true)
        }else{
                setFilterOption(newValue)
        }
    }
    const handleApplyCustomDate = () => {
            if (!tempStartDate || !tempEndDate) return;

            setStartDate(tempStartDate);
            setEndDate(tempEndDate);
            setFilterOption("custom");  
            setShowDialogForCustom(false);
        };
    const handleCloseDialog = () => {
          setShowDialogForCustom(false);
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
            <Container  sx={{

                 }}>
                {error&&
                    <Paper sx={{m:2, backgroundColor:theme.palette.primary.light}}>
                    <Box>
                        <Typography color="error" variant="h6" sx={{textAlign:"center"}}>
                            {error}
                        </Typography>
                    </Box>
                </Paper>
                }
                <Box sx={{ pt: 2, textAlign:"center", display:"block" ,}}>
                    <PaginationSizeForm size={size} handleChange={handlePaginationSize}/>
                </Box>
                <Box sx={{
                    display:"block",
                    '& > :not(style)': {
                    m: 1,
                    width:{lg:"70%",md:"80%", xs:"100%", sm:"100%"},
                    margin:"10px auto",
                    // minHeight: "50%",
                    },
                                
                    }}>
                        
                    <PastReceiptView 
                    handleFilterChange={handleFilterChange} handleApplyCustomDate={handleApplyCustomDate} handleCloseDialog={handleCloseDialog}
                     tempEndDate={tempEndDate} tempStartDate={tempStartDate} setTempStartDate={setTempStartDate} setTempEndDate={setTempEndDate}
                     showDialogForCustom={showDialogForCustom}
                    filterOption={filterOption} data={data} handleChange={handleSearchClick} inputValue={searchById}/>   
                     
                </Box>


            <Box sx={{position:"sticky", bottom:0, backgroundColor:theme.palette.primary.light, borderRadius:"20px",width:{lg:"70%",md:"80%", xs:"100%", sm:"100%"},
                    margin:"10px auto",}}>
                    <PaginationControlled 
                        totalPages={dataCRUDPaginate?.total_pages} 
                        page={page} 
                        handleChangePagination={handleChangePagination}/>
            </Box>
            
            </Container>
        </>
    )

};

export default MainPastReceipts