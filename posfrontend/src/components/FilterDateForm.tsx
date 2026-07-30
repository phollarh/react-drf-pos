
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useMediaQuery, useTheme } from "@mui/material";

type filterOptionType= {
  filterOption:string;
  handleChange:(event: SelectChangeEvent)=>void;
}

export default function FilterDateForm({filterOption, handleChange}:filterOptionType) {
    const theme = useTheme();
    const isMobile = useMediaQuery("(max-width: 500px)")

  return (
    <>
      <FormControl sx={{ 
         "& .MuiInputLabel-root": {
      fontSize: "14px",
      color: "gray",
      },
        m: 1, fontFamily:"sans-serif", width:isMobile?100: 150 }} size="small">
      {/* <InputLabel id="demo-select-small-label">Today</InputLabel> */}
      <Select
      size='small'
        MenuProps={{
      PaperProps: {
                sx: {
                  "& .MuiMenuItem-root": {
                    fontSize: "15px",
                  },
                },
              },
            }}
        labelId="demo-select-small-label"
        id="demo-select-small"
        value={filterOption}
        label="Payment Option<"
        onChange={handleChange}
      >
        <MenuItem value='today'>Today</MenuItem>
        <MenuItem  value='last_24_hours'>Last 24 hours</MenuItem>
        <MenuItem value='this_week'>This Week</MenuItem>
        <MenuItem value='this_month'>This Month</MenuItem>
        {/* <Typography gutterBottom variant='h6' sx={{borderTop:`1px solid ${theme.palette.divider}`}}> */}
          <MenuItem 
          onClick={() => {
      
            handleChange({ target: { value: 'custom' } } as any);
          }}
          sx={{fontSize:"15px",borderTop:`1px solid ${theme.palette.divider}`}} value='custom'>Custom</MenuItem>
        {/* </Typography> */}
        
        
      </Select>
    </FormControl>

    </>
    
  );
}
