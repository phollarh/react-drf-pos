import { Box, Tooltip } from "@mui/material"
import {  useState } from "react";
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsPop from "./NotificationPopover";
import NotifyService from "../../services/NotifyService";


// const socketUrl = "ws://127.0.0.1:8000/ws/notifications/"

export default function Notifications() {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);
    const user_id = localStorage.getItem("user_id")
    const { sendJsonMessage,  newMessage, notificationShownMessage, disableButton,getNotification} = NotifyService(user_id)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const setNotifyBadge  = newMessage.filter(item=>!item.is_read).length
    
  return (
    <>
        <Tooltip title="toggle notification" placement="top">
            <IconButton  onClick={handleClick} aria-label="show 4 unread messages">
            <Badge variant="standard" badgeContent={setNotifyBadge} color="warning">
                 <NotificationsNoneIcon sx={{color:"blueviolet"}} />
            </Badge>
        </IconButton>
        </Tooltip>
        <Box display="none">
            <NotificationsPop getNotification={getNotification} disableButton={disableButton} notificationShownMessage={notificationShownMessage} sendJsonMessage={sendJsonMessage} newMessage={newMessage} anchorEl={anchorEl} open={open} handleClose={handleClose}/>
        </Box>
        
    </>
    
  );
}
