
import React, { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Tooltip, Typography, useMediaQuery } from '@mui/material';
import qz from "qz-tray";



export default function PrinterSettings() {
    const isBelow750 = useMediaQuery("(max-width: 750px)") 
    const [printerList, setPrinterList]  = React.useState<string[]>([]);
    const [selectedPrinter, setSelectedPrinter] = useState("")
    
    useEffect(()=>{
       const printerSelection = localStorage.getItem("selectedPrinter") || ""
       if(printerSelection !== ""){
            setSelectedPrinter(printerSelection)
            setPrinterList((prevValue)=>
            ([...prevValue, printerSelection])
            )
       }
    }, [])

    const handlePrinterChange = (event: SelectChangeEvent)=>{
        setSelectedPrinter(event.target.value)
        localStorage.setItem("selectedPrinter", event.target.value)
    }
    const searchPrinter = async ()=>{
       const printers = await qz.printers.find()
       if(Array.isArray(printers)){
            setPrinterList(printers)
       }else{
        setPrinterList([printers])
       }

       
    }

  return (
    <>

        <Box sx={{display:"block",width:'100%',mt:4,}}>
            <Tooltip title="No printer on dropdown, click to refresh" placement="top">
                 <Box component="button" onClick={searchPrinter} sx={{borderRadius:2,display:"block",p:1,cursor:"pointer", backgroundColor:"#6feca3",margin:"1px auto", border:"transparent"}}>
                    <Typography sx={{display:"block",color:"white",width:"100%", backgroundColor:"transparent"}}>
                        Search for Printer
                    </Typography>

                </Box>
            </Tooltip>
           
        </Box>
      

        <Box sx={{ width:isBelow750?"50%":undefined, display:"block", margin:"1px auto"}}>
                        <FormControl fullWidth sx={{mt:2, fontFamily:"sans-serif", minWidth: 150 }} size="small">
                            <InputLabel id="demo-select-small-label">Choose Printer</InputLabel>
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
                                value={selectedPrinter}
                                label="Outlet Staff Login"
                                onChange={handlePrinterChange}
                              >
                                <MenuItem value="">
                                  <em>None</em>
                                </MenuItem>
                                  { printerList?.map((item, index)=>{
                                    return(<MenuItem key={index}  value={item}>{item}</MenuItem>)
                                })}
                              </Select>
                        </FormControl>
         </Box> 
    </>
     
  );
}
