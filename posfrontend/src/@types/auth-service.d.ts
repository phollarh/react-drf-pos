export interface requestIdProps {
    object_details:string,
    id:string
}
export interface AuthServiceProps {
    login: (
        username: string,
        password: string
    ) => any;
    userId:number | null
    register: (email: string,first_name: string,last_name: string, password: string) => Promise<any>;
    authLoading:boolean;
    isLoggedIn: boolean;
    activeOutletId:number|null;
    isOutletActive:boolean;
    getInitialLoggedInValue: () => Promise<AxiosResponse<any, any, {}>>;
    logout: () => void;
    
    AuthenticateUserPass: (
        password: string, 
        requestId: requestIdProps | null,
        purpose?:string,
        handleDelete?: () => Promise<any>,
        checked?:boolean
    ) => Promise<any>
        
        
    authError:null|string;
    getUserDetails : () =>any;
    refreshAccessToken: () => Promise<void>

}