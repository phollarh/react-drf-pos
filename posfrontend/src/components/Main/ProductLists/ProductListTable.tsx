import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Box, DialogProps, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Server } from '../../../@types/server';
import UpdateProductDialogue from './UpdateProductDialogue';

interface dataCRUDProps{
    dataCRUD:Server[];
    handleClick:(id:number)=>void
    handleOrderDelete:(id:number|undefined)=>Promise<void>
    open:boolean;
    dataObject:Server | null;
    setDataObject: React.Dispatch<React.SetStateAction<Server | null>>;
    onSuccess:()=>Promise<any>
    setOpen:React.Dispatch<React.SetStateAction<boolean>>;
    handleClose:()=>void
}




interface ColumnProps {
  id: 'product_name' | 'code'|'selling_price' | 'category' | 'stock_inventory';
  label: string;
  minWidth?: number;
  align?: 'left';
  format?: (value: number) => string;
}

const columns: readonly ColumnProps[] = [
  { id: 'product_name', label: 'Product Name', minWidth: 70, },
  { id: 'code', label: 'Product\u00a0Code', minWidth: 30 },
  { id: 'selling_price', label: 'Selling Price', minWidth: 70,format: (value: number) => `₦${value.toLocaleString()}`, },
  { id: 'category',label: 'Category',minWidth: 70},
  { id: 'stock_inventory',label: 'Stock Inventory',minWidth: 30,format: (value: number) => value.toLocaleString(),},
];

interface Data {
  product_name: string;
  selling_price:number;
  code: number;
  category?:string
  stock_inventory: number;

}

function createData(product_name:string,selling_price:number,code:number,category:string,stock_inventory:number): Data
 {
  return { product_name,selling_price ,code,category, stock_inventory };
}


export default function ProductListTable({setOpen,dataObject,setDataObject,onSuccess,handleClose,dataCRUD,handleOrderDelete, open}:dataCRUDProps) {
    
    const [scroll, setScroll] = React.useState<DialogProps['scroll']>('paper');
  const [page, setPage] = React.useState(0);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark"
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const below1200 = useMediaQuery("(max-width:1200px)")
  const below720 = useMediaQuery("(max-width:720px)")
  const below550 = useMediaQuery("(max-width:550px)")

  

  const rows = dataCRUD?.map((item)=>
    createData(item.product_name, Number(item.selling_price), item.id, item['category'].name, Number(item.stock_inventory))
  )
  console.log(dataCRUD)

  const visibleColumns=columns.filter((item) => {
    if(below550){
        return item.id !== "category" && item.id !== "stock_inventory" && item.id !== "code";

      }
  if (below1200) {
    return item.id !== "category" && item.id !== "stock_inventory"
  }


  return true;
  });
  console.log(columns)
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleClick = (id:number ,scrollType: DialogProps['scroll'])=>{
    dataCRUD.some((item)=>{
        if(String(item.id) === String(id) ){
            setDataObject(item)
        }

    })
    setOpen(true);
    setScroll(scrollType);

  }

  return (
    <>
    <Box >
        <UpdateProductDialogue onSuccess={onSuccess} handleOrderDelete={handleOrderDelete} handleClose={handleClose} open={open} scroll={scroll} dataCRUD={dataCRUD} dataObject={dataObject}/>
    </Box>
        
        <TableContainer elevation={0}  component={Paper} 
        sx={{ 
          margin:"1px auto",p:0,width:below1200?
          below550?250:350
          :"100%", 
          border:"none", height: "85%", overflowY:"auto", overflowX:"hidden"}}>
        <Table  stickyHeader style={{backgroundColor:isDarkMode?theme.palette.primary.main:theme.palette.primary.light, margin:0}}>
          <TableHead >
            <TableRow style={{backgroundColor:theme.palette.primary.main}}>
              {visibleColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth:below550?10: column.minWidth }}
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
                  <Tooltip key={row.code}
                    title={
                      <>
                       <Typography variant='body2'>
                        {row.product_name}
                      </Typography>
                      <Typography variant='body2'>
                        {row.stock_inventory} in Stock
                      </Typography>
                      <Typography variant='body2'>
                        {row.category}
                      </Typography>
                          <Typography variant='body2'>
                        {row.code}
                      </Typography>
                      </>
                      
                    } 
                    arrow
                    placement="top">
                < TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {visibleColumns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell sx={{whiteSpace:"nowrap",overflow:"hidden",maxWidth:110,cursor:"pointer", textOverflow:"ellipsis"}} 
                        onClick={()=>{handleClick(row.code, 'paper')}} 
                        key={column.id} align={column.align}>
                           
                              {column.format && typeof value === "number"
                                ? column.format(value)
                                : value}

                        </TableCell>
                      );
                    })}
                  </TableRow>
                  </Tooltip>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{width:below720?300:"70%", margin:"1px auto", p:0, overflowX:"hidden"}}>
              <TablePagination
         sx={{
          overflow:"hidden",
    "& .MuiTablePagination-toolbar": {
      width: "100%",
      backgroundColor:isDarkMode?"#352f2f !important":"none",
      margin:"2px 0px",
      borderRadius:5,
      background:"white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flex:"1 1 0"
    },
    "& .MuiTablePagination-actions ":below550?{
      marginLeft:"0px !important"
    }:{marginLeft:"auto"},
    "& .MuiTablePagination-select":below550?{
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
      
    </>
    // <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        
      
    // </Paper>
  );
}
