
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, useMediaQuery } from '@mui/material';



interface printerSetupdbProps {
    
    outlet: string,
    paper_size: string,
    id: number
}

interface printerSetupProps{
    printerSetup:printerSetupdbProps | null;
    handleSetPaperSize: (event: SelectChangeEvent)=>Promise<any>;
     
}

export default function PrinterSetup({printerSetup, handleSetPaperSize}:printerSetupProps) {
    const isBelow750 = useMediaQuery("(max-width: 750px)") 
   
    
   

  return (
    <>

        <Box sx={{display:"block",width:'100%',mt:4,}}>
            {/* <Tooltip title="No printer on dropdown, click to refresh" placement="top">
                 <Box component="button" onClick={searchPrinter} sx={{borderRadius:2,display:"block",p:1,cursor:"pointer", backgroundColor:"#6feca3",margin:"1px auto", border:"transparent"}}>
                    <Typography sx={{display:"block",color:"white",width:"100%", backgroundColor:"transparent"}}>
                        Search for Printer
                    </Typography>

                </Box>
            </Tooltip> */}
           
        </Box>
      

        <Box sx={{ width:isBelow750?"50%":undefined, display:"block", margin:"1px auto"}}>
                        <FormControl fullWidth sx={{mt:2, fontFamily:"sans-serif", minWidth: 150 }} size="small">
                            <InputLabel id="demo-select-small-label">choose paper size</InputLabel>
                              <Select
                              MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            maxHeight: 150,
                                        },
                                    },
                                }}
                                labelId="demo-select-small-label"
                                id="demo-select-small"
                                value={printerSetup? printerSetup.paper_size : ""}
                                label="choose paper size"
                                onChange={handleSetPaperSize}
                              >
                                <MenuItem value="">
                                  <em>None</em>
                                </MenuItem>
                                  
                                <MenuItem  value="80">80 mm</MenuItem>
                                <MenuItem   value="58">58 mm</MenuItem>
                            
                              </Select>
                        </FormControl>
         </Box> 
    </>
     
  );
}
