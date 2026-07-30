
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Typography} from "@mui/material";
import { UseoutletNstaffContext } from '../context/OutletNStaffsContext';

type filterOptionType= {
  filterOption:string;
  handleChange:(event: SelectChangeEvent)=>void;
}

export default function OutletFilterSelection({filterOption, handleChange}:filterOptionType) {
    const {outletsData} = UseoutletNstaffContext();
    const safeValue =
    outletsData.some(o => String(o.id) === filterOption)
        ? filterOption
        : "";
    
  return (
    <>
      <FormControl variant='standard' sx={{ minWidth: 150 }} size="small">
      <InputLabel sx={{
        backgroundColor: "#fff", color:"black", whiteSpace:"normal", overflow:"unset",letterSpacing:"0.8px"}} id="outlet-label">Outlets</InputLabel>
      <Select
        labelId="outlet-label"
        id="outlet-select"
        value={safeValue}
        disabled={outletsData.length === 0}
        label="Outlets"
        onChange={handleChange}
      >
        {outletsData.map((item)=>{
            return(
                <MenuItem key={item.id} value={item.id}>
                    <Typography sx={{whiteSpace:"normal",letterSpacing:"0.8px", wordSpacing:"1px", fontFamily:"inherit"}} component="span">{item.name.toLowerCase()}</Typography>
                </MenuItem>
            )
        })}
        

       
        
        
      </Select>
    </FormControl>

    </>
    
  );
}
