
import {  Box,useMediaQuery } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";

interface DateRangePickerProps{
    startDate :Dayjs | null;
    endDate: Dayjs| null;
    onStartDateChange: (value: Dayjs | null) => void;
    onEndDateChange: (value: Dayjs | null) => void;

}
export default function DateRangePicker({startDate, endDate, onStartDateChange,onEndDateChange}:DateRangePickerProps) {
  const IsMoobile = useMediaQuery("(max-width: 500px)")

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display={IsMoobile?"block":"flex"}  gap={2}>
        {/* Start Date */}
        <DatePicker
          
          label="Start"
          value={startDate}
          onChange={(value)=>onStartDateChange(value)}
          slotProps={{ textField: { variant: "outlined", 
              sx: { "& .MuiPickersOutlinedInput-root":{fontSize:IsMoobile?"0.5rem !important":"0.8rem important", marginBottom:IsMoobile?"6px !important":"0px !important"},
                    
        }
                }  
                      }}
        />

  
        <DatePicker
          label="End"
          value={endDate}
        onChange={onEndDateChange}
          slotProps={{ textField: { variant: "outlined", 
              sx: { "& .MuiPickersOutlinedInput-root": {fontSize:IsMoobile?"0.5rem !important":"0.8rem important"}
        }
                                  }  
                      }}
          minDate={startDate || undefined} 
        />
      </Box>
    </LocalizationProvider>
  );
}
