import { LineChart } from '@mui/x-charts/LineChart';

interface weeklySalesProps {
        "Monday": number;
        "Tuesday": number;
        "Wednesday": number;
        "Thursday": number;
        "Friday": number;
        "Saturday":number
        "Sunday": number
    
}
interface salesWeeklyDataProps {
    salesWeeklyData:weeklySalesProps | null
}

export default function SalesByProductChart({salesWeeklyData}:salesWeeklyDataProps) {

    let data : string[]= []
    let seriesData :number[]  = []
    Object.entries(salesWeeklyData || {}  ).forEach(([key,value])=>{
        data.push(key)
        seriesData.push(value)

    })
    
  return (
    <LineChart
      xAxis={[
        { 
            "scaleType":"band",
            data: data
         }
    ]}
      series={[
        
        {
          data: seriesData,
          area: true,
          color: "#1976d2",
          showMark: true,
          
        },
      ]}
       margin={{
        left: -30,
        right: 10,
        top: 10,
        bottom: 30,
    }}
      sx={{
            width:"100%",
            "& .MuiAreaElement-root": {
            fillOpacity: 0.5,
            },
            alignContent:"flex-start",
            "& .MuiMarkElement-root": {
            fill: "#1976d2",
            stroke: "#1976d2",
            },
        }}
        grid={{ horizontal: true }}
        // margin={0}
        height={300}
    />
  );
}
