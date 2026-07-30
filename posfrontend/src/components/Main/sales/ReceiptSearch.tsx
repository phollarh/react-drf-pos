import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import React from 'react';
import { useMediaQuery } from '@mui/material';

type handleSearchClickProps={
    // handleSearchClick : (id :number | null)=>void
    inputValue:string
    handleChange:(event:React.ChangeEvent<HTMLInputElement>)=>void
}

export default function ReceiptSearch(
    {
        inputValue,
        handleChange
    }
    :handleSearchClickProps) {
    const isMobile = useMediaQuery("(max-width:500px)")



  return (
    <Paper
      component="form"
      sx={{m:1, alignItems: 'center', width:isMobile?150: 250 }}
    >
      <InputBase
        sx={{fontSize:isMobile?"0.7rem":"0.8rem", ml: 1, flex: 1 }}
        value={inputValue}
        onChange={handleChange}
        placeholder="Search Receipt by id #00-"
        // inputProps={{ 'aria-label': 'search google maps' }}
      />
    </Paper>
  );
}
