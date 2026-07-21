import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

type PaymentOptionType= {
  paymentOption:string;
  handleChange:(event: SelectChangeEvent)=>void;
}

export default function PaymentMethodOption({paymentOption, handleChange}:PaymentOptionType) {


  return (
    <FormControl sx={{ m:1,fontSize:"20px",height:"50px", fontFamily:"sans-serif", minWidth: 150 }} size="small">
      <InputLabel id="demo-select-small-label">Payment Option</InputLabel>
      <Select sx={{fontSize:"10px"}}
      size='small'
        labelId="demo-select-small-label"
        id="demo-select-small"
        value={paymentOption}
        label="Payment Option<"
        onChange={handleChange}
      >
        <MenuItem sx={{fontSize:"12px"}} value="">
          <em>None</em>
        </MenuItem>
        <MenuItem sx={{fontSize:"12px"}} value='CASH'>Cash</MenuItem>
        <MenuItem sx={{fontSize:"12px"}} value='TF'>Tranfer</MenuItem>
        <MenuItem sx={{fontSize:"12px"}} value='CARD'>Card</MenuItem>
      </Select>
    </FormControl>
  );
}
