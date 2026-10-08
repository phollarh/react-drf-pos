import {
    Box,
    Typography,
    useTheme,
    Container,
    Paper,
    SelectChangeEvent
} from "@mui/material";
import useCrud from "../../hooks/useCrud";
import React, { useEffect, useState } from "react";
import PastReceiptView from "./sales/PastReceiptView";
import PaginationControlled from "../pagination/Pagination";
import PaginationSizeForm from "../pagination/PaginationSizeForm";
import { Dayjs } from "dayjs";
import { useAuthServiceContext } from "../../context/AuthContext";
import { OrderProps } from "../../@types/server";



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

const MainPastReceipts = () => {
    const theme = useTheme();
    const [, setDrawerOpen] = React.useState(true);
    const [filterOption, setFilterOption] = React.useState("today")
    const [showDialogForCustom, setShowDialogForCustom] = React.useState(false);
    React.useEffect(() => {
                const handleDrawerToggle = (e: Event) => {
                const customEvent = e as CustomEvent;
                setDrawerOpen(customEvent.detail);
                };
                window.addEventListener("drawer-toggle", handleDrawerToggle);
                return () => window.removeEventListener("drawer-toggle", handleDrawerToggle);
    }, []);
    
    const [page, setPage] = React.useState(1);
    const [size, setSize] = React.useState<number|null>(null);
    const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
    const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
    const [tempStartDate, setTempStartDate] = React.useState<Dayjs | null>(null);
    const [tempEndDate, setTempEndDate] = React.useState<Dayjs | null>(null);
    const [searchById, setSearchById] = React.useState<string>("");
    const {activeOutletId} = useAuthServiceContext();
    const [outletId, setOutletId] = useState("")
    
    useEffect(()=>{
                if(activeOutletId){
                    setOutletId(String(activeOutletId))
                }
                        
    },[activeOutletId])
        
    
    const url = React.useMemo(() => {
        if(outletId === "")return null;
        const params = new URLSearchParams();

    
        params.append("issued", "true");

        if (outletId) {
            params.append("outlet_id", outletId);
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
        
        return `/sales_receipt/?${params.toString()}`
    
    }, [outletId,page,filterOption, startDate,endDate,size, searchById]);


    const { dataCRUD,dataCRUDPaginate, fetchData, error } = useCrud<Server>([], url )
    useEffect(() => {
            if (!url) return; 

            fetchData();
        }, [url]);

    console.log(dataCRUD)
    const handleChangePagination =(_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);      
      };
    const handlePaginationSize =(event: SelectChangeEvent<string | number>) => {
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

    // const [data, setData] = React.useState<Server[]>([])
    //     useEffect(() => {
    //         setData(dataCRUD)
    // }, [dataCRUD]);
    
    
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
                    filterOption={filterOption} data={dataCRUD} handleChange={handleSearchClick} inputValue={searchById}/>   
                     
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