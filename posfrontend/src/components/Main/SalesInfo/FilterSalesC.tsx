
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

type filterOptionType= {
  filterOption:string;
  handleChange:(event: SelectChangeEvent)=>void;
}

export default function FilterSales({filterOption, handleChange}:filterOptionType) {


  return (
    <FormControl sx={{ m: 1, fontFamily:"sans-serif", minWidth: 150 }} size="small">
      {/* <InputLabel id="demo-select-small-label">Today</InputLabel> */}
      <Select
        labelId="demo-select-small-label"
        id="demo-select-small"
        value={filterOption}
        label="Payment Option<"
        onChange={handleChange}
      >
        {/* <MenuItem value="">
          <em>None</em>
        </MenuItem> */}
        <MenuItem value='today'>Today</MenuItem>
        <MenuItem value='yesterday'>Yesterday</MenuItem>
        <MenuItem value='this_week'>This Week</MenuItem>
        <MenuItem value='this_month'>This Month</MenuItem>
        <MenuItem value='last_week'>Last Week</MenuItem>
        <MenuItem value='last_month'>Last Month</MenuItem>
      </Select>
    </FormControl>
  );
}
