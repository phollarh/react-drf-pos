import * as React from 'react';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { useMediaQuery } from '@mui/material';

interface PaginationControlledProps {
  totalPages?: number;
  handleChangePagination:(event: React.ChangeEvent<unknown>, value: number)=>void;
  page:number;
}

export default function PaginationControlled({totalPages,handleChangePagination, page}:PaginationControlledProps) {
  const isMobile = useMediaQuery("(max-width:600px)")

  return (
    <Stack  sx={{width:"100%", p:0 }} spacing={1}>
      <Typography sx={{textAlign:"center"}}>Page: {page}</Typography>
      <Stack justifyContent="center" sx={{width:"100%", m:0, p:0, whiteSpace:"nowrap"}}>
        <Pagination 
          siblingCount={isMobile ? 0 : 1}   
          boundaryCount={1}                 

        sx={{ 
            margin:"1px auto",
            "& .MuiPaginationItem-root": {
            mx: 1,
            margin:isMobile?"0.5px":"auto",
            whiteSpace:"nowrap"
           }
            }} count={totalPages} page={page} onChange={handleChangePagination} />  
      </Stack>
      
    </Stack>
  );
}