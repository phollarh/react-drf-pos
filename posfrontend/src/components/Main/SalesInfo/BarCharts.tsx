
import { BarChart } from '@mui/x-charts/BarChart';

type labelTypes ={
  uData:number[];
  xLabels:string[];
}

export default function BarChartMain({uData,xLabels}: labelTypes) {
  return (
    <BarChart
      height={300}
      series={[
        { data: uData, label: 'Monthly Sales in Naira', id: 'uvId' },
      ]}
      xAxis={[
        { data: xLabels,
             scaleType: 'band',
            categoryGapRatio: 0.5,
            barGapRatio:0.3
         }
    ]}
      yAxis={[{ width: 50 }]}
      
    />

  );
}
