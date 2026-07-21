import axios from "axios"
import { AuthServiceProps } from "../@types/auth-service";
import { useState } from "react";
import { BASE_URL, BASE_URL_ACCOUNT } from "../congif";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import useAxiosWithInterceptor from "../helper/jwtinterceptor";

interface CustomJwtPayload {
    is_verified: boolean;
    user_id: number;
    exp: number;
}

export function useAuthService(): AuthServiceProps {

    const navigate = useNavigate();
    const [authError, setAuthError] = useState<string | null >(null)
    const jwtAxios = useAxiosWithInterceptor()


    const getInitialLoggedInValue = () => {
        const loggedIn = localStorage.getItem("isLoggedIn");
        return loggedIn !== null && loggedIn === "true";
    };
    const [isLoggedIn, setIsloggedIn] = useState<boolean>((getInitialLoggedInValue))

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
                `http://127.0.0.1:8000/accounts/api/user/authenticate_password/`,payload,
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
             console.log('herererere')
            setAuthError(err.response.data["error"] ||  "Request failed")
            setTimeout(() => {
                setAuthError(null);
            }, 5000);
            throw err;
        }

    }


    const getUserDetails = async () => {
        setAuthError(null)
        try {
            const userId = localStorage.getItem("user_id");
            // const accessToken = localStorage.getItem("access_token")
            const response = await axios.get(
                `http://127.0.0.1:8000/accounts/api/user/?user_id=${userId}`,
                {
                    // headers: {
                    //     Authorization: `Bearer ${accessToken}`
                    // }
                    withCredentials: true
                }
            );
            const userDetails = response.data;
            console.log(userDetails)
            return userDetails;
            // localStorage.setItem("username", userDetails.username);
            // localStorage.setItem("isLoggedIn", "true")
        } catch (err: any) {
            setAuthError(err.response.data["error"])
            // localStorage.setItem("isLoggedIn", "false")
            throw err;
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
                // setIsloggedIn(true)
                // const decoded = jwtDecode<CustomJwtPayload>(response.data['access']);
                // if(decoded.is_verified === false){
                //     navigate("/email_confirmation")
                // }
            }
            
            console.log(response.data)
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
                "http://127.0.0.1:8000/accounts/api/register/", {

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
            console.log(refreshError.response)
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
    return { login, isLoggedIn,getUserDetails,AuthenticateUserPass, logout, refreshAccessToken, register, authError }

}