import useAxiosWithInterceptor from "../helper/jwtinterceptor";
import { BASE_URL_CHARTS } from "../congif";
import { useState } from "react";

interface IuseCrud<L, D> {
    xLabelsMonthlySales:L[];
    labelsDataMonthlySales:D[];
    fetchData: () => Promise<void>;
    error: Error | null;
    isLoading: boolean;
}

const useCrudCharts = <L,D>(initialData: L[],initialLabelData : D[], apiURL: string|null): IuseCrud<L, D> => {
    const jwtAxios = useAxiosWithInterceptor();
    const [xLabelsMonthlySales , SetxLabelsMonthlySales] = useState<L[]>(initialLabelData)
    const [labelsDataMonthlySales , SetlabelsDataMonthlySales] = useState<D[]>(initialData)
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsloading] = useState(false);

    const fetchData = async () => {
        setIsloading(true);
        try {
            const response = await jwtAxios.get(`${BASE_URL_CHARTS}${apiURL}`, {
                withCredentials: true,
            });
            const data = response.data;
            const salesData= response.data[0].monthly_sales
            const lablesData :D[]= [] as unknown as D[]
            const lables:L[] = [] as unknown as L[]
        for(let x in salesData){
            lables.push(x as unknown as L)
            lablesData.push(salesData[x] ?? 0 as unknown as D)
            
        }
            SetxLabelsMonthlySales(lables)
            SetlabelsDataMonthlySales(lablesData)
            
            setError(null);
            return data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                setError(new Error("400"));
            } else {
                setError(error);
            }
            throw error;
        } finally {
            setIsloading(false);
        }
    };

    return {
        fetchData,
        xLabelsMonthlySales,
        labelsDataMonthlySales,
        error,
        isLoading,
    };
};

export default useCrudCharts;
