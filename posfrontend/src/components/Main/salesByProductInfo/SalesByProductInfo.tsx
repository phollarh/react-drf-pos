import * as React from 'react';
import Box from '@mui/material/Box';
import { SelectChangeEvent, useTheme } from '@mui/material';
import FilterSalesByProduct from './FilterSalesByProduct';
import SalesByProductInfoTable from './SalesByProductInfoTable';


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
    salesProductData : SalesByProductProp | null      
}


export default function SalesByProductInfo({salesProductData}:SalesByProductProps) {
  const theme = useTheme();
  const [filterOption, setFilterOption] = React.useState('today')
  const [showDialogForCustom, setShowDialogForCustom] = React.useState(false);
  

  const handleChange=(event: SelectChangeEvent)=>{
    const newValue = event.target.value as string
    
    setFilterOption(newValue);
    if(newValue === "custom"){
       setShowDialogForCustom(true)
    }
  }

    const handleCloseDialog = () => {
    setShowDialogForCustom(false);
  };

 
  return (
      <>
      <Box 
            sx={{
              backgroundColor:theme.palette.primary.light,
              display:"block",
              p:0,
              mb:2,
              borderRadius: "5px"
            }}
            >
              <Box sx={{display:"flex", justifyContent:"space-between"}}>
                <Box></Box>
                <Box 
                sx={{
                  m:0
                  // backgroundColor:'red'
                }}
                >
                  <FilterSalesByProduct
                  filterOption={filterOption}
                  handleChange={handleChange}
                  
                  />
                
                </Box>
          
              </Box>
            
            </Box>
                
                <SalesByProductInfoTable 
                    salesProductData={salesProductData}
                    filterOption={filterOption}
                    showDialogForCustom={showDialogForCustom}
                    handleCloseDialog={handleCloseDialog}
                />
        
        
        
      </>
      
  
  );
}
