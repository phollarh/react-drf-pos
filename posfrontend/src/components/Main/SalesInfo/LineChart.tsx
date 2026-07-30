
import { LineChart } from '@mui/x-charts/LineChart';

const margin = { right: 24 };

type labelTypes ={
  pData:number[];
  xLabels:string[];
}

export default function LineChartHome({pData,xLabels}:labelTypes) {
  return (
    <LineChart
      height={300}
      series={[
        { data: pData, label: 'Daily sales in NGN' },
        
      ]}
      xAxis={[{ scaleType: 'point', data: xLabels }]}
      yAxis={[{ width: 50 }]}
      margin={margin}
    />
  );
}
