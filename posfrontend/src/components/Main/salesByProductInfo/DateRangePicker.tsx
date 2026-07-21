import * as React from "react";
import { TextField, Box, SelectChangeEvent, useMediaQuery } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

interface DateRangePickerProps{
    startDate :Dayjs | null;
    endDate: Dayjs| null;
    // handleCloseDialog : ()=>void
    onStartDateChange: (value: Dayjs | null) => void;
    onEndDateChange: (value: Dayjs | null) => void;

}
export default function DateRangePicker({startDate, endDate, onStartDateChange,onEndDateChange}:DateRangePickerProps) {
  const IsMoobile = useMediaQuery("(max-width: 500px)")
//   const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
//   const [endDate, setEndDate] = React.useState<Dayjs | null>();

//     const handleDateRangeChange = () => {
//         if (startDate && endDate) {
//         console.log("Selected range:", startDate.format("YYYY-MM-DD"), "to", endDate.format("YYYY-MM-DD"));
//         // Here you can call your API with the range
//         // fetch(`/api/products_info/?start_date_range=${startDate.format("YYYY-MM-DD")}&end_date_range=${endDate.format("YYYY-MM-DD")}`)
//         }
//     }
//     React.useEffect(() => {
//     handleDateRangeChange();
//   }, [startDate, endDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display={IsMoobile?"block":"flex"}  gap={2}>
        {/* Start Date */}
        <DatePicker
          
          label="Start"
          value={startDate}
          onChange={(value)=>onStartDateChange(value)}
          // onClose={handleCloseDialog}
        // onChange={onChangeDatePicker}
          slotProps={{ textField: { variant: "outlined", 
              sx: { "& .MuiPickersOutlinedInput-root":{fontSize:IsMoobile?"0.5rem !important":"0.8rem important", marginBottom:IsMoobile?"6px !important":"0px !important"},
                    
        }
                }  
                      }}
        />

        {/* End Date */}
        <DatePicker
          label="End"
          value={endDate}
          // onClose={handleCloseDialog}
        //   onChange={(newValue) => setEndDate(newValue)}
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
