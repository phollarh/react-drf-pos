import axios, { AxiosInstance } from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../congif";



const useAxiosWithInterceptor = () :AxiosInstance =>{
const  jwtAxios = axios.create({})
const navigate = useNavigate();
const requestPasswordReset = location.pathname === "/forgot_password"

jwtAxios.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) =>{
            const originalRequest = error.config;
            
            if (error.response?.status === 403){
                console.log("im called...")
                 axios.defaults.withCredentials = true;
                try{
                    const response = await axios.get(
                        "http://127.0.0.1:8000/accounts/api/user/get_email_verify_status/"
                    );
                   
                    // if (response.status === 200){
                    //     return jwtAxios(originalRequest)
                    // }
                    // return response.data
                }catch(emailError : any){
                    
                     if(emailError.response?.status === 403 && emailError.response.data.email_verification_status === false){
                        navigate("/email_confirmation")
                    }
                    if(emailError.status === 400){
                        
                            navigate('/login')
                        
                        
                    }
                    return Promise.reject(emailError);
                    
                }
            
                return Promise.reject(error);
            }
            if (error.response.status === 401 ){
                axios.defaults.withCredentials = true;
                try{
                    const response = await axios.post(
                        "http://127.0.0.1:8000/accounts/api/token/refresh/"
                    );
                    if (response.status === 200){
                        return jwtAxios(originalRequest)
                    }
                }catch(refreshError : any){
                    
                    if(refreshError.status === 401){
                        if(!requestPasswordReset){
                            navigate('/login')
                        }
                        
                    }
                    return Promise.reject(refreshError);
                }
            }
            
       
            
            return Promise.reject(error);

        }
    );
    return  jwtAxios
}

export default useAxiosWithInterceptor