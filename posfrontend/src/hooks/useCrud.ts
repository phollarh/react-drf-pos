import useAxiosWithInterceptor from "../helper/jwtinterceptor";
import { BASE_URL } from "../congif";
import React, { SetStateAction, useEffect, useState } from "react";

interface PaginatedResponse<T> {
    page_size:number;
    total_pages:number
    current_page:number
    count : number;
    next:string
    previous:string | null;
    results: T[];
}
interface IuseCrud<T> {
    dataCRUD: T[];
    dataCRUDPaginate: PaginatedResponse<T> | null;
    fetchData: () => Promise<void>;
    deleteData:(id:number)=> Promise<void>;
    setDataCRUD:React.Dispatch<SetStateAction<T[]>>;
    error: string | null;
    isLoading: boolean;
}



const useCrud = <T>(initialData: T[], apiURL: string|null): IuseCrud<T> => {
    const jwtAxios = useAxiosWithInterceptor();
    const [dataCRUD, setDataCRUD] = useState<T[]>(initialData);
    const [dataCRUDPaginate, setDataCRUDPaginate] = useState<PaginatedResponse<T>|null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsloading] = useState(false);
    
    

    

     const fetchData =React.useCallback( async () => {
        if (!apiURL) return;
        try {
            const response = await jwtAxios.get(`${BASE_URL}${apiURL}`, {
                withCredentials: true,
            });

            

            const data = response.data;

            if (Array.isArray(data)) {
                setError(null)
                setDataCRUD(data);
                setDataCRUDPaginate(null);
            } else {
                setDataCRUD(data.results);
                setDataCRUDPaginate(data);
            }
            setError(null)

        } catch (error:any) {
            
            setError(error?.response.data.error);
            console.log(error?.response.data.error)
        } finally{
            setIsloading(false)
        }
    },[apiURL]);

    const deleteData = async (id:number) => {
        
        const apiURLDel = `${apiURL?.split("/")[1]}/${id}/${apiURL?.split("/")[2]}`
        
        try {
            const response = await jwtAxios.delete(`${BASE_URL}/${apiURLDel}`, {
                withCredentials: true,
            });
            return response.data
        } catch (error:any) {
            if (error.response?.status === 400) {
                new Error("400");
                setError(error);
            }
            throw error;
           
        }
    };


    useEffect(() => {
    
        fetchData();
    
    }, [fetchData]);

    return {
        deleteData,
        fetchData,
        setDataCRUD,
        dataCRUD,
        dataCRUDPaginate,
        error,
        isLoading,
    };
};

export default useCrud;
