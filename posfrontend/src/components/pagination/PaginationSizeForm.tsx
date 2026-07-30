
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

type PaginationSizeFormType= {
  size:number | null;
  handleChange:(event: SelectChangeEvent<number>)=>void;
}

export default function PaginationSizeForm({handleChange, size}:PaginationSizeFormType) {


  return (
    <FormControl sx={{ m: 4, fontFamily:"sans-serif", minWidth: 150 }} size="small">
      <InputLabel id="demo-select-small-label">filter size</InputLabel>
      <Select
        labelId="demo-select-small-label"
        id="demo-select-small"
        value={size ?? ""}
        label="filter size"
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        <MenuItem value="30">30</MenuItem>
        <MenuItem value="50">50</MenuItem>
        <MenuItem value="100">100</MenuItem>
        <MenuItem value="200">200</MenuItem>
      </Select>
    </FormControl>
  );
}
