import {
    Box,
    useTheme,
} from "@mui/material";

import React from "react";
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