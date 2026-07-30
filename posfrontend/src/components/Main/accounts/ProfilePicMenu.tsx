import { Box,IconButton, Menu, MenuItem, useTheme } from "@mui/material";
import React, { useState } from "react";
import ProfilePicDiaglogue from "./ProfilePicDiaglogue";

interface dataProps{
    "email":string;
    "first_name":string;
    "last_name":string;
    "phone_number":string;
    "image": string
}
interface dataP{
    data : dataProps | null;
    onUpload: (file: File) => void;

}


const ProfilePicMenu = ({data,onUpload}:dataP) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const theme = useTheme()
    const isMenuOpen = Boolean(anchorEl);

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const renderMenu = (
        <>
         <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            open={isMenuOpen}
            keepMounted
            onClose={handleMenuClose}

        >

            
                <MenuItem><ProfilePicDiaglogue data={data}/></MenuItem>
                <MenuItem sx={{fontSize:'inherit', color:theme.palette.primary.main}} component="label">
               
                upload Profile Picture
                
                
                <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            onUpload(file);
                            handleMenuClose();
                        }
                    }}
                />
                
                </MenuItem>
            
        </Menu>
        
        </>
       
    );
    return (
        <>
            <Box sx={{display:"flex" , justifyContent:"space-between"}}>
               
                
                <Box sx={{ display: { xs: "flex" } }}>
                <IconButton
                    edge="end"
                    color="inherit"
                    onClick={handleProfileMenuOpen}

                >
                     <img src={data?.image} alt="profile picture" 
                    style={{ width: 100, height: 100, borderRadius: "50%" }}
                    />
                </IconButton>
                {renderMenu}

                </Box>
            </Box>
           
        
        </>
       

    )
}

export default ProfilePicMenu;