import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import DialogForCustomDate from './DialogForCustomDate';
import useAxiosWithInterceptor from '../../../helper/jwtinterceptor';
import { Dayjs } from "dayjs";
import { Box, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../../congif';
import { useAuthServiceContext } from '../../../context/AuthContext';


interface productDetailsProps{
    id:number;
    product_name:string;
    total_amount:number;
    profit_rank:string;
    total_qty:number;
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
interface SalesByProductProps {
    salesProductData: SalesByProductProp | null;
    filterOption:string;
    showDialogForCustom:boolean;
    handleCloseDialog:()=>void
           
}

interface Column {
  id: 'product_name' | 'profit_rank' | 'sales_revenue' | 'total_qty';
  label: string;
  minWidth?: number;
  align?: 'left';
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: 'product_name', label: 'Product Name', minWidth: 70 },
  { 
    id: 'profit_rank',
    label: 'Profit Rank',
    minWidth: 30 
    },
  {
     id: 'sales_revenue'
     ,label: 'Sales Revenue',
     minWidth: 30,
    format: (value: number) => value.toLocaleString('en-US'),
},
  {
    id: 'total_qty',
    label: 'Quantity\u00a0Sold',
    minWidth: 30,
    align: 'left',
    // format: (value: number) => value.toLocaleString('en-US'),
  },
];

interface Data {
  id:number;
  product_name: string;
  profit_rank: string;
  sales_revenue:number;
  total_qty: number;

}

function createData(product_name:string,profit_rank:string,sales_revenue:number,total_qty:number, id:number): Data
 {
  return { product_name, profit_rank,sales_revenue, total_qty, id };
}


export default function SalesByProductInfoTable({salesProductData, filterOption, showDialogForCustom, handleCloseDialog}:SalesByProductProps) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const[outputedSalesDataState, setOutputedSalesData] = React.useState<productDetailsProps[]>([])
  const navigate = useNavigate()
  const jwtAxios = useAxiosWithInterceptor();
  const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
  const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
  const below450 = useMediaQuery("(max-width : 450px)")
  const {activeOutletId} = useAuthServiceContext();
  const [outletId, setOutletId] = React.useState("")

  React.useEffect(()=>{
            if(activeOutletId){
                setOutletId(String(activeOutletId))
            }
                    
    },[activeOutletId])
  


  const handleProductView = (productId:string)=>{
   
      navigate(`/sales_summary/${productId}`)

  }
  
    React.useEffect(() => {
      
        if (filterOption !== "custom"){

         setOutputedSalesData(salesProductData?.[filterOption as keyof SalesByProductProp]?? [])
        setPage(0);
    }
    setPage(0);
      }, [filterOption,salesProductData]);
      

  
  

  const handleCustomdateAPICall = async ()=>{
        if (!startDate || !endDate) return;
        if(startDate && endDate){
            const startDateFormate = startDate.format("YYYY-MM-DD");
            const EndDateFormate = endDate.format("YYYY-MM-DD")
             try{
                    const response = await jwtAxios.get(
                    `${BASE_URL}/products_info/?outlet_id=${outletId}&end_date_range=${EndDateFormate}&start_date_range=${startDateFormate}`,{
                        withCredentials:true
                    })
                    const newData = response.data?.date_range ?? [];
                    setOutputedSalesData(newData)
                    handleCloseDialog()
                    setPage(0)
                    return response.data
                }catch(err:any){
                    if (err.response?.status === 400) {
                            throw new Error("400");
                        }
                    throw err;
                
                }
            
            }
        
    }


  const rows = 
    outputedSalesDataState.map((item)=>
        createData(
        item.product_name, 
        (item.total_amount <= 0 ? "":`#${item.profit_rank}`), 
        Number(item.total_amount),
        item.total_qty,
        item.id
        )
    )
    const visibleColumns=columns.filter((item) => {
    if(below450){
        return item.id !== "sales_revenue" && item.id !== "profit_rank";

      }

  return true;
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width:below450?280:'100%',m:0,p:0, overflowX: 'hidden' }}>
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
      <TableContainer component={Paper} sx={{margin:"0px auto", maxHeight: 650,overflowY:"auto", width:below450?280:"auto", overflowX:"hidden" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow >
              {visibleColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth}}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow onClick={()=>{handleProductView(String(row.id))}} sx={{cursor:"pointer"}} hover role="checkbox" tabIndex={-1} key={row.id}>
                    {visibleColumns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{width:below450?280:"auto", margin:"0.5px auto", p:0, overflowX:"hidden"}}>
                    <TablePagination
               sx={{
                overflow:"hidden",
          "& .MuiTablePagination-toolbar": {
            width: "100%",
            margin:"2px 0px",
            borderRadius:5,
            background:"white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex:"1 1 0"
          },
          "& .MuiTablePagination-actions ":below450?{
            marginLeft:"0px !important"
          }:{marginLeft:"auto"},
          "& .MuiTablePagination-select":below450?{
            margin:"2px !important"
          }:{margin:"auto"},
      
          "& .MuiTablePagination-spacer": {
            display: "none", 
            p:0,
            m:0
          },
      
      
        }}
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
            </Box>
            
      
    </Paper>
  );
}
