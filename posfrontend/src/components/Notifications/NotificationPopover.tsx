import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { Box, Divider, List, ListItem, ListItemText, useMediaQuery } from '@mui/material';

import { formatDistance } from "date-fns";
import useWebSocket from 'react-use-websocket';

type SendJsonMessage = ReturnType<typeof useWebSocket>["sendJsonMessage"];

interface NewMessageType {
    id?: string;
    message: string
    is_read: boolean;
    title:string;
    created_at?: string
}

interface PopProps{
    anchorEl: HTMLButtonElement | null;
    handleClose: () => void;
    open : boolean;
    newMessage: NewMessageType[];
    sendJsonMessage: SendJsonMessage;
    notificationShownMessage:null|string;
    disableButton:boolean;
    getNotification: () => Promise<any>;
    
}


export default function NotificationsPop({anchorEl,handleClose, 
    open, newMessage,sendJsonMessage,
    notificationShownMessage,
    disableButton,
    getNotification
    }:PopProps) {
    const isBelow500 = useMediaQuery("(max-width : 500px)")
  const id = open ? 'simple-popover' : undefined;

  
    const presevOnrender  =React.useMemo(()=>(
        <List >
            {
                newMessage.map((item,index)=>{
                    return(
                        <Box  
                        onClick={()=>{
                            const sendMessage = {
                                "is_read":item.is_read? true: !item.is_read,
                                "notification_id":item.id
                            }
                            sendJsonMessage(sendMessage)
                        }}
                        key={index} 
                        component="button" 
                        display="block" 
                        sx={{ 
                            width:isBelow500?"100%":undefined,
                            border:"none", backgroundColor:"transparent", cursor:"pointer"
                            
                             }}>
                            <ListItem sx={{ width:"100%",
                                backgroundColor:item.is_read? "transparent": "#bbdefb", borderRadius:2,":hover":{backgroundColor:"#c5cae9"} }}>
                            <ListItemText
                            slotProps={{secondary:{
                                component:"div"
                            }}}
                                primary={
                                    <Typography  variant="body1" sx={{
                                        width:"100%",
                                        color:"text.primary", fontWeight:700}}>
                                        {item.title}
                                    </Typography>
                                }
                                
                                secondary = {
                                    <>
                                    <Typography  sx={{maxWidth:"100%",
                                        display: "-webkit-box",
                                        WebkitBoxOrient: "vertical",
                                        width:400,
                                        WebkitLineClamp:2,
                                         overflow:"hidden"
                                         }}>
                                            {item.message}
                                    </Typography>
                                    <Typography sx={{fontSize:"0.6rem"}}>
                                        { item.created_at && formatDistance(new Date(item.created_at), new Date, {addSuffix:true})}
                                        
                                    </Typography>
                                    <Divider/>
                                    </>
                                    
                                }
                                
                            
                            />
                        </ListItem>
                        </Box>
                        
                    )
                })
            }
        </List>
             
                
               
        
    ),[newMessage])
  return (
    <>
         <Popover
            slotProps={{
            paper:{
                sx:{
                    borderRadius:2,
                    width:isBelow500?"90%":"auto",
                    maxHeight:400
                }
            }
        }} 
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box>
            {presevOnrender}
            <Box>
                <Box component="button" 
                onClick={getNotification}
                disabled={disableButton === true ? true : false}
                        sx={{
                                cursor:disableButton === true ?" not-allowed":"pointer",
                                border : "none", 
                                p:3,
                                backgroundColor:disableButton?"#eedcc5":"#a3b4ee",borderRadius:2,padding:1, 
                                margin:"5px auto", textAlign:"center", 
                                display:notificationShownMessage === null ? "none":"block",
                                ":hover":{backgroundColor:"#9eb0ea !important"}
                                            }}>
                <Typography sx={{color:"#fff",fontSize:"0.8rem", fontFamily:"-apple-system"}}>{notificationShownMessage}</Typography>
                </Box>
            </Box>
        </Box>
        
      </Popover>

    </>
      
     
  );
}
