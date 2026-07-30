import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import React from 'react';

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
    
      const isOnSalesReceipt = location.pathname === "/sales_receipts"


  return (
    <Paper
      component="form"
      sx={{ p: '1px', display: 'flex', alignItems: 'center', width: 250 }}
    >
        <SearchIcon />
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        value={inputValue}
        onChange={handleChange}
        placeholder= {isOnSalesReceipt?"search product using name/id":"product name e.g cooking gas"}
        // inputProps={{ 'aria-label': 'search google maps' }}
      />
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
    </Paper>
  );
}
