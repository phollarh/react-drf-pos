import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Paper, SelectChangeEvent, useTheme } from '@mui/material';
import { Grid } from '@mui/material';
import FilterSalesByProduct from '../salesByProductInfo/FilterSalesByProduct';
import useAxiosWithInterceptor from '../../../helper/jwtinterceptor';
import { Dayjs } from 'dayjs';
import DialogForCustomDate from '../salesByProductInfo/DialogForCustomDate';

type salesDataType={
 net_sales?: number; gross_sales?: number, cost_of_sales?:number
}

interface salesDataProps{
  salesData : Record<string, salesDataType> 
    
}

export default function SalesInfo({salesData}:salesDataProps) {
  const theme = useTheme();
  const [filterOption, setFilterOption] = React.useState('today')
  const [showDialogForCustom, setShowDialogForCustom] = React.useState(false);
  const[outputedSalesDataState, setOutputedSalesData] = React.useState<salesDataProps |{}>({})
//   const [showDialogForCustom, setShowDialogForCustom] = React.useState(false);
  const jwtAxios = useAxiosWithInterceptor();
  const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
  const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
  const outlet_id = localStorage.getItem("outlet_id") || ""
  
    const handleChange=(event: SelectChangeEvent)=>{
      const newValue = event.target.value as string
      console.log(newValue)
      setFilterOption(newValue);
      if(newValue === "custom"){
         setShowDialogForCustom(true)
      }
    }
    
    React.useEffect(() => {
      if (filterOption !== "custom"){
               
                 console.log(salesData)
            // setShowDialogForCustom(false)
             setOutputedSalesData(salesData[filterOption]?? {})
            
        }
          }, [filterOption,salesData]);
          
    
      
      const handleCloseDialog = () => {
      setShowDialogForCustom(false);
    };

    const handleCustomdateAPICall = async ()=>{
        if (!startDate || !endDate) return;
        if(startDate && endDate){
            const startDateFormate = startDate.format("YYYY-MM-DD");
            const EndDateFormate = endDate.format("YYYY-MM-DD")
             try{
                    const response = await jwtAxios.get(
                    `http://127.0.0.1:8000/api/sales_info/?outlet_id=${outlet_id}&end_date_range=${EndDateFormate}&start_date_range=${startDateFormate}`,{
                        withCredentials:true
                    })
                
                    console.log(response.data)
                    const newData = response.data?.date_range ?? {};
                    setOutputedSalesData(newData)
                    handleCloseDialog()
                    return response.data
                }catch(err:any){
                    if (err.response?.status === 400) {
                            throw new Error("400");
                        }
                    throw err;
                
                }
            
            }
        
    }


  return (
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
      </Box>
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
            
      <Box 
        sx={{
          // display:"flex",
          // flexWrap:"wrap",
          // flexGrow:1,
          borderRadius: "5px",
          p:2,
          backgroundColor:theme.palette.primary.light
          //  justifyContent:"space-between"
           }}>
            <Grid container spacing={2}>
              {Object.entries(outputedSalesDataState || {}).map(([key, value])=>{
                return(
                   <Grid key={key} size={{ xs: 12, md: 4 }}>
                      <Paper elevation={3} sx={{ height: 100 }} >
                            <Typography variant="body2" 
                            sx={{
                              pt:1,
                              borderBottom:`1px solid ${theme.palette.success.main}`,
                              fontSize:"1.2rem",
                              textAlign:"center"
                              }} 
                              // color="text.secondary"
                              >
                                  {key.replace(/\_/g, ' ').replace(/\b\w/g, c=> c.toUpperCase())}
                                </Typography>
                                <Typography variant="body1" 
                                sx={{ 
                                  pt:2,
                                  pb:1,
                                  borderBottom:`1px solid ${theme.palette.divider}`,
                                  textAlign:"center",
                                  // fontFamily:"sans-serif",
                                  fontSize:"1.3rem"
                                  // color: theme.palette.error.main,
                                   }}>
                                  {Number(value?? 0).toFixed(2)}
                                </Typography>
                      </Paper>
                    </Grid>
                )
              })}
             
            </Grid>

        </Box>   
        
        
      </>
      
  
  );
}
