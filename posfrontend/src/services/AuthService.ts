import axios from "axios"
import { AuthServiceProps } from "../@types/auth-service";
import { useEffect, useState } from "react";
import { BASE_URL_ACCOUNT } from "../congif";
import { useNavigate } from "react-router-dom";

import useAxiosWithInterceptor from "../helper/jwtinterceptor";



export function useAuthService(): AuthServiceProps {

    const navigate = useNavigate();
    const [authError, setAuthError] = useState<string | null >(null)
    const [userId, setUserid] = useState<number|null>(null)
    const [activeOutletId, setActiveOutletId] = useState<number|null>(null)
    const [isOutletActive, setIsoutletActive] = useState<boolean>(false)
    const jwtAxios = useAxiosWithInterceptor()
    const [isLoggedIn, setIsloggedIn] = useState<boolean>((false))
    const [authLoading, setAuthLoading] = useState<boolean>((true))

    const getInitialLoggedInValue =async () => {
        // const loggedIn = localStorage.getItem("isLoggedIn");
        // return loggedIn !== null && loggedIn === "true";
        
         try {

            const response = await jwtAxios.get(
                `${BASE_URL_ACCOUNT}/user/is_authenticated/`,
                {
                    withCredentials: true
                }
            );
            
            if(response.status === 200){
                
                setIsloggedIn(response.data.is_authenticated)
                setActiveOutletId(response.data.active_outlet ?? null)
                setIsoutletActive(response.data?.is_outlet_active)
                setUserid(response.data?.auth_id)
                
            }
            
            return response;
        } catch (err: any) {
            if(err.response?.status === 401){
                setIsloggedIn(false);
                setUserid(null);
                setActiveOutletId(null);
                setIsoutletActive(false);
            }
            
            throw err.response;
        }finally{
            setAuthLoading(false)
        }
    };
    
    useEffect(()=>{
        getInitialLoggedInValue()
    }, [])
    const AuthenticateUserPass = async (
        password:string,
        requestId:null|{}, 
        purpose?:string, 
        handleDelete?:  () => Promise<any>, 
        checked?:boolean
    ) => {
        setAuthError(null)
        const payload = {
            "requestId":requestId,
            "password":password,
            "lag_time_check":checked,
            "outlet_id": localStorage.getItem("outlet_id"),
            "purpose":purpose
        }
        try {

            const response = await jwtAxios.post(
                `${BASE_URL_ACCOUNT}/user/authenticate_password/`,payload,
                {
                    withCredentials: true
                }
            );
            
            if(response.status === 200){
                
                if(handleDelete){
                  await  handleDelete()
                }
                
            }
            
            return response;
        } catch (err: any) {
             console.log(err.response)
            setAuthError(err.response.data["error"] ||  "Request failed")
            setTimeout(() => {
                setAuthError(null);
            }, 5000);
            throw err.response;
        }

    }


    const getUserDetails = async () => {
        setAuthError(null)
        if(!userId) return;
        try {
            // const userId = localStorage.getItem("user_id");
            // const accessToken = localStorage.getItem("access_token")
            const response = await jwtAxios.get(
                `${BASE_URL_ACCOUNT}/user/?user_id=${userId}`,
                {
                    // headers: {
                    //     Authorization: `Bearer ${accessToken}`
                    // }
                    withCredentials: true
                }
            );
            const userDetails = response.data;
            
            return userDetails;
            // localStorage.setItem("username", userDetails.username);
            // localStorage.setItem("isLoggedIn", "true")
        } catch (err: any) {
            
            setAuthError(err.response.data["error"])
            // localStorage.setItem("isLoggedIn", "false")
            throw err.response;
        }

    }


    const login = async (email: string, password: string) => {
        setAuthError(null)
        
        try {
            const response = await axios.post(
                `${BASE_URL_ACCOUNT}/token/`, {
                email,
                password,
            },
                {
                    withCredentials: true
                }
            );

            if(response.status === 200){
                            
                const user_id = response.data.user_id
                setIsloggedIn(true)
                
                localStorage.setItem("isLoggedIn", "true")
                localStorage.setItem("user_id", user_id)
                setUserid(response.data.user_id)
                setIsloggedIn(true)
                // setIsloggedIn(true)
                // const decoded = jwtDecode<CustomJwtPayload>(response.data['access']);
                // if(decoded.is_verified === false){
                //     navigate("/email_confirmation")
                // }
            }
            
            
            return response.data;
        } catch (err: any) {
            setAuthError(err.response.data["error"])
            setIsloggedIn(false)
            localStorage.setItem("isLoggedIn", "false")
            return err.response.status;
        }

    }

    const register = async (email: string,first_name:string, last_name:string, password: string ) => {
            setAuthError(null);
        try {
            const response = await axios.post(
                `${BASE_URL_ACCOUNT}/register/`, {

                email,
                first_name,
                last_name,
                password
            },
                {
                    withCredentials: true
                }
            );

            if(response.status === 201){
                await login(email, password)
                navigate("/")
            }
            return response.data;
        } catch (err: any) {
            if (err.response) {
                return { status: err.response.status, data: err.response.data };
            }
            return { status: 500, data: { message: "Network or server error" } };
            
        }

    }

    const refreshAccessToken = async () => {
        setAuthError(null)
        try {
            await axios.post(
                `${BASE_URL_ACCOUNT}/token/refresh/`, {}, { withCredentials: true }
            )
        } catch (refreshError :any) {
            
            setAuthError(refreshError.response.data["error"])
            return Promise.reject(refreshError)

        }
    }
    const logout = async () => {

        // localStorage.removeItem("access_token");
        // localStorage.removeItem("refresh_token");
        setAuthError(null)
   
        try {
            const response = await axios.post(
                `${BASE_URL_ACCOUNT}/logout/`, {}, { withCredentials: true }
            )
            if(response.status === 200){
                setIsloggedIn(false)
                setUserid(null)
                localStorage.removeItem("user_id");
                localStorage.removeItem("username");
                localStorage.setItem("isLoggedIn", "false")
                setIsloggedIn(false);
                navigate("/login")

            }
              
        } catch (logError) {
            
            return Promise.reject(logError)
        }



    }
    return {
        userId,
        authLoading, 
        login, 
        isLoggedIn,
        getUserDetails,
        AuthenticateUserPass,
        getInitialLoggedInValue,
        activeOutletId,
        isOutletActive,
         logout, refreshAccessToken, register, authError }

}