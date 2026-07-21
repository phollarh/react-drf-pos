import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Typography,
    useTheme,
    Container,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Paper,
    SelectChangeEvent
} from "@mui/material";
import useCrud from "../../hooks/useCrud";
import React, { SetStateAction, useEffect } from "react";
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import { Link, useNavigate, useParams } from "react-router-dom";

import OutletFilterSelection from "../OutletFilterSelection";
import useAxiosWithInterceptor from "../../../helper/jwtinterceptor";
import CreateSalesTable from "./CreateSalesTable";
import { Server } from "../../../@types/server";

interface dataCRUDProps{
    dataCRUD: Server[];
    handleClick:(id:number)=>void;
    handleSearchClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    searchByproduct: string;
    // setReceiptId:React.Dispatch<SetStateAction<number | null>> ;
}

const CreateSales = ({dataCRUD, handleClick,handleSearchClick,searchByproduct}:dataCRUDProps) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark"
    
    return (
        <>
            <Box sx={{backgroundColor: isDarkMode?"black":theme.palette.primary.light, pt: 0,height:"80%", overflowY:"auto" }}>
                <CreateSalesTable searchByproduct={searchByproduct} handleSearchClick={handleSearchClick} handleClick={handleClick} dataCRUD={dataCRUD}/>
            </Box>
        </>
    )

};

export default CreateSales