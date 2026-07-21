import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import useAxiosWithInterceptor from '../../../helper/jwtinterceptor';
import dayjs, { Dayjs } from "dayjs";

import { Box, DialogProps, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
;
import UpdateProductDialogue from './UpdateProductDialogue';
import UpdateCategoryDialogue from '../ProductLists/UpdateCategoryDialogue';

interface catProps {
    id: number;
    name: string;
    
}

interface dataCRUDProps{
    dataCRUD:catProps[];
    handleClick:(id:number)=>void
    handleOrderDelete:(id:number|undefined)=>Promise<void>
    open:boolean;
    dataObject:catProps | null;
    setDataObject: React.Dispatch<React.SetStateAction<catProps | null>>;
    onSuccess:()=>Promise<any>
    setOpen:React.Dispatch<React.SetStateAction<boolean>>;
    handleClose:()=>void
}


interface productDetailsProps{
    id:number;
    product_name:string;
    total_qty:number;
}

interface SalesByProductProps {
    salesProductData :Record<string , productDetailsProps[]>
    filterOption:string;
    showDialogForCustom:boolean;
    handleCloseDialog:()=>void
    
           
}

interface ColumnProps {
  id: 'category_name' | 'code';
  label: string;
  minWidth?: number;
  align?: 'left';
  format?: (value: number) => string;
}

const columns: readonly ColumnProps[] = [
  { id: 'category_name', label: 'Product Name', minWidth: 70, },
  { id: 'code', label: 'Category\u00a0Code', minWidth: 30 },

];

interface Data {
  category_name: string;
  code: number;


}

function createData(category_name:string,code:number,): Data
 {
  return { category_name,code};
}


export default function CatListTable({setOpen,dataObject,setDataObject,onSuccess,handleClose,dataCRUD,handleOrderDelete, open}:dataCRUDProps) {
    
    const [scroll, setScroll] = React.useState<DialogProps['scroll']>('paper');
  const [page, setPage] = React.useState(0);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark"
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const below1200 = useMediaQuery("(max-width:1200px)")
  const below720 = useMediaQuery("(max-width:720px)")
  const below550 = useMediaQuery("(max-width:550px)")
  const jwtAxios = useAxiosWithInterceptor();


  

  const rows = dataCRUD?.map((item)=>
    createData(item.name, item.id)
  )
  console.log(dataCRUD)

  const handleChangePage = (event: unknown, newPage: number) => {
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
        <UpdateCategoryDialogue onSuccess={onSuccess} handleOrderDelete={handleOrderDelete} handleClose={handleClose} open={open} scroll={scroll} dataCRUD={dataCRUD} dataObject={dataObject}/>
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
              {columns.map((column) => (
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
                        {row.category_name}
                      </Typography>
                        <Typography variant='body2'>
                        {row.code}
                      </Typography>
                      </>
                      
                    } 
                    arrow
                    placement="top">
                < TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column) => {
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
      <Box sx={{width:below720?"100%":"70%", margin:"1px auto", p:0, overflowX:"hidden"}}>
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
