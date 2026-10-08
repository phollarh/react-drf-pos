import axios, { AxiosInstance } from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL_ACCOUNT } from "../congif";
import { useEffect, useMemo } from "react";


let emailIsVerified = false;

let emailVerificationPromise:Promise<any> | null = null;

const checkEmailVerificationOnce = () => {
    if (emailIsVerified) {
    return Promise.resolve();
  }

  if (emailVerificationPromise) {
    return emailVerificationPromise;
  }

  emailVerificationPromise = axios.get(
      `${BASE_URL_ACCOUNT}/user/get_email_verify_status/`,
      {
        withCredentials: true,
      }
    )
    .then((response) => {
      if (response.status === 200) {
        emailIsVerified = true;
      }

      return response;
    })
    .finally(() => {
      emailVerificationPromise = null;
    });

  return emailVerificationPromise;
};

const userTimeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone;

console.log(userTimeZone);

const useAxiosWithInterceptor = () :AxiosInstance =>{
    const navigate = useNavigate();
    const jwtAxios = useMemo(()=>{
        return axios.create({
             headers: {
            "X-Timezone": userTimeZone,
        },
            withCredentials:true
            
        })
    },[])
    useEffect(()=>{
        const interceptorId = jwtAxios.interceptors.response.use(
            (response) => {
                return response;
            },
            async (error) =>{
                const originalRequest = error.config as any;
                if (error.response?.status === 401 && !originalRequest._retry ){
                    // axios.defaults.withCredentials = true;
                    originalRequest._retry =true;

                    try{
                        const response = await axios.post(
                            `${BASE_URL_ACCOUNT}/token/refresh/`,{},{withCredentials:true}
                        );
                        if (response.status === 200){
                            return jwtAxios(originalRequest)
                        }
                    }catch(refreshError : any){
                        
                        if(refreshError.response?.status === 401){
                             if (window.location.pathname !== "/forgot_password") {
                                    navigate("/login", { replace: true });
                                }
                            
                        }
                        return Promise.reject(refreshError);
                    }
                }
                
                
                if (error.response?.status === 403){
            
                
                    try{
                        await checkEmailVerificationOnce()
        
                    }catch(emailError : any){
                        
                        if(emailError.response?.status === 403 && emailError.response?.data.email_verification_status === false){
                            navigate("/email_confirmation", {replace:true}) 
                            return Promise.reject(emailError);
                        }
                        if(emailError.response?.status === 400 && emailError.response?.status === 401){
                            
                                navigate('/login', {replace:true})

                            return Promise.reject(emailError);
                            
                        }
                        throw emailError
                        
                    }
                    
                    if(error.response?.data.code === "pos_authorization_required" || 
                        error.response?.data.code === 'session_expired_please_reauthenticate'){
                        navigate("/authorization")
                        return Promise.reject(error);
                    }
                
                    return Promise.reject(error);
                }
                
        
                
                return Promise.reject(error);

            }
        );
        
        return () => {
                jwtAxios.interceptors.response.eject(interceptorId);
            };
    },[jwtAxios,navigate])

    return jwtAxios;

};


export default useAxiosWithInterceptor