import useWebSocket from "react-use-websocket";
import { useAuthService } from "./AuthService";
import { BASE_URL, WS_ROOT } from "../congif";
import { useEffect, useState } from "react";
import useAxiosWithInterceptor from "../helper/jwtinterceptor";



interface NewMessageType {
    id?: string;
    message: string
    is_read: boolean;
    title:string;
    created_at?: string
}



const useChatWebSocket = (userId: string | null) => {
    const jwtAxios = useAxiosWithInterceptor();
    const { logout, refreshAccessToken } = useAuthService();
    const [newMessage, setNewMessage] = useState<NewMessageType[]>([]);
    const [message, setMessage] = useState("");
    const [notificationShownMessage,setNotificationShownMessage] = useState<null|string>(null);
    const [disableButton,setDisableButton] = useState(false);
    


    const socketUrl = userId ? `${WS_ROOT}/notifications/${userId}/` : `${WS_ROOT}/`;
    const [reconnectionAttempt, setReconnectionAttempt] = useState(0);
    const maxConnectionAttempts = 4;




    // const { fetchData, dataCRUD} = useCrud<NewMessageType>(
    //     [], `/notifications/?user_id=${userId}`
    // )
    const getNotification =async ()=>{
        try{
            const response = await jwtAxios.get( `${BASE_URL}/notifications/?user_id=${userId}`,
                {
                    headers:{
                        "X-Count-Header":newMessage.length <= 0 ? 0: newMessage.length
                    },
                        withCredentials:true
                })
                const data :NewMessageType[] = response.data["data"]
                setNotificationShownMessage(response.data["message"])
                setDisableButton(response.data["disable_button"])
                if(response.status === 200){
                    setNewMessage(Array.isArray(data)? data : []  )
                }
                return response.data["data"]
            }
            
        catch(err:any){
            console.log(err.response)
            if (err.response?.status === 400) {
                throw new Error("400");
            }
            throw err;
        
        }
    }
    useEffect(()=>{
        getNotification()
    }, [userId])

    // useEffect(()=>{
    //     setNewMessage(Array.isArray(dataCRUD) ? dataCRUD : [])
        
    // }, [dataCRUD])
    const { sendJsonMessage } = useWebSocket(socketUrl, {
        onOpen: async () => {
             console.log("WebSocket connected");
            setReconnectionAttempt(0);


        },
        onClose: (event: CloseEvent) => {
            console.log("Close!", event.code);
            if (event.code === 4001) {
                console.log("Authentication Error");
                refreshAccessToken().catch((error) => {
                    if (error.response?.status === 401) {
                        logout();
                    }
                })
            }
            
            setReconnectionAttempt(prev => prev + 1);
            console.log("closed")

        },
        onError: () => {
            console.log("Error")
        },
        onMessage: (msg) => {
            console.log("im called")
            const data = JSON.parse(msg.data);
            console.log(data)
            if(data.type === "inventory.update"){
                setNewMessage((prevMessage) => {
                    return ([data.notification,...prevMessage ])
                });
            }
            if(data.type === "notification.message"){
                setNewMessage(prevMessage=>
                    prevMessage.map((messg)=>
                        messg.id === data.notification["id"] ? data.notification : messg
                    )
                )
            }
            
            
        },
        shouldReconnect:  () => {
            return reconnectionAttempt < maxConnectionAttempts;
        },
        reconnectInterval: 2000

    });
    return {
        newMessage,
        message,
        setMessage,
        sendJsonMessage,
        notificationShownMessage,
        disableButton,
        getNotification
    }

}

export default useChatWebSocket

