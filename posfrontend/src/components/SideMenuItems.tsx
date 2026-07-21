import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, useMediaQuery } from "@mui/material";
import { Link } from "react-router-dom";
import React from "react";
import HomeIcon from '@mui/icons-material/Home';
import { useTheme } from "@mui/material/styles";
import SideMenuAccordion from "./sideMenuAccord/SideMenuDrop";
import SideMenuAccordionProduct from "./sideMenuAccord/SideMenuAccordionProduct";

type MenuItem = {
  label: string;
  link:string;
  icon: React.ReactElement;
};
type SideMenuItemsProps={
    sideMenu:MenuItem[];
    otherSideMenu: MenuItem[];
    open:boolean;
}



const SideMenuItems:React.FC<SideMenuItemsProps> = ({sideMenu, otherSideMenu, open}) =>{
    const theme = useTheme();
    const below600 = useMediaQuery("(max-width:750px)")
    return(
        <>

            <List>
                {sideMenu.map((item, index)=>{
                    return(
                        <ListItem
                             key={index}
                            disablePadding
                            sx={{
                                 display: "block",
                                 m:1,
                                }}
                            dense={true}
                        >
                        <Link to={`/${item.link}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                        >

                            <ListItemButton
                                sx={{minHeight:0}}
                            
                            >
                                <ListItemIcon
                                    
                                    sx={{minWidth:0,mr:1.3}}
                                >
                                   {React.cloneElement(item.icon, {
                                        fontSize: !open ? 'large' : 'small',
                                    })}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="body1"
                                        
                                            sx={{
                                                fontSize:below600?"0.8em":'1em',
                                                fontWeight:400,
                                                fontFamily:'sans-serif',
                                                lineHeight:1.2,
                                                // color:`${theme.palette.primary.main}`,
                                                textOverflow:"hidden",
                                                whiteSpace:"nowrap"
                                            }}
                                        >
                                            {item.label} 
                                        </Typography>
                                    }
                                />
                            </ListItemButton>

                        </Link>
                            

                        </ListItem>
                    )
                })}
                        
            </List>
            <Box sx={{mb:2}}>
                <SideMenuAccordionProduct open={open}/>
            </Box>
            <Box>
                <SideMenuAccordion open={open} />
            </Box>
            <List sx={{borderTop:`1px solid ${theme.palette.divider}`,mt:6}}>
                {otherSideMenu.map((item, index)=>{
                    return(
                        <ListItem
                             key={index}
                            disablePadding
                            sx={{ display: "block",m:1 }}
                            dense={true}
                        >
                        
                         <Link to={item.link}
                                style={{ textDecoration: "none", color: "inherit" }}
                        >
                            <ListItemButton
                                sx={{minHeight:0}}
                            
                            >
                                <ListItemIcon
                                    sx={{minWidth:0,mr:1.3}}
                                >
                                   {React.cloneElement(item.icon, {
                                        fontSize: !open ? 'large' : 'small',
                                    })}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontFamily:'sans-serif',
                                                fontSize:below600?"0.8em":'1em',
                                                fontWeight:300,
                                                lineHeight:1.2,
                                                textOverflow:"hidden",
                                                whiteSpace:"nowrap"
                                            }}
                                        >
                                            {item.label}
                                        </Typography>
                                    }
                                />
                            </ListItemButton>
                        </Link>

                        </ListItem>
                    )
                })}
                        
            </List>

        </>
    )
}

export default SideMenuItems;