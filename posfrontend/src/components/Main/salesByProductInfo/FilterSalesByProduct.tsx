
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import {useTheme } from "@mui/material";

type filterOptionType= {
  filterOption:string;
  handleChange:(event: SelectChangeEvent)=>void;
}

export default function FilterSalesByProduct({filterOption, handleChange}:filterOptionType) {
    const theme = useTheme();

  return (
    <>
      <FormControl sx={{ m: 1, fontFamily:"sans-serif", minWidth: 150 }} size="small">
      {/* <InputLabel id="demo-select-small-label">Today</InputLabel> */}
      <Select
        labelId="demo-select-small-label"
        id="demo-select-small"
        value={filterOption}
        label="Payment Option<"
        onChange={handleChange}
      >
        <MenuItem value='today'>Today</MenuItem>
        <MenuItem value='yesterday'>Yesterday</MenuItem>
        <MenuItem value='this_week'>This Week</MenuItem>
        <MenuItem value='this_month'>This Month</MenuItem>
        <MenuItem value='last_week'>Last Week</MenuItem>
        <MenuItem value='last_month'>Last Month</MenuItem>
        {/* <Typography gutterBottom variant='h6' sx={{borderTop:`1px solid ${theme.palette.divider}`}}> */}
          <MenuItem 
          onClick={() => {
      
            handleChange({ target: { value: 'custom' } } as any);
          }}
          sx={{borderTop:`1px solid ${theme.palette.divider}`}} value='custom'>Custom</MenuItem>
        {/* </Typography> */}
        
        
      </Select>
    </FormControl>

    </>
    
  );
}
