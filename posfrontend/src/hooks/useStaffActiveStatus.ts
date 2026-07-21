import { useQuery } from '@tanstack/react-query';
import useAxiosWithInterceptor from '../helper/jwtinterceptor';

export const useStaffActiveStatus = (employee_id?: string) => {
    const jwtAxios = useAxiosWithInterceptor();

    return useQuery({
        queryKey: ['staffActiveStatus', employee_id],
        queryFn: async () => {
            if (!employee_id) throw new Error("Employee ID is required");

            const response = await jwtAxios.get(
                `http://127.0.0.1:8000/accounts/api/staffs-login/staff-active-status`,
                {
                    params: { staff_id: employee_id },
                    withCredentials: true,
                }
            );
            return response.data;
        },
        staleTime: 45 * 1000,        // Consider fresh for 45 seconds
        gcTime: 10 * 60 * 1000,      // Keep in cache for 10 minutes
        refetchOnWindowFocus: false, // Don't refetch when user switches tabs
        enabled: !!employee_id,      // Only run if employee_id exists
    });
};