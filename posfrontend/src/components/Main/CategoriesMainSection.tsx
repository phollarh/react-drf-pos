import {
    Box,
    Typography,
    useTheme,
    Container,
    useMediaQuery,
    Paper,
    Toolbar,
    Alert
} from "@mui/material";
import useCrud from "../../hooks/useCrud";
import React, { useEffect, useState } from "react";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import useAxiosWithInterceptor from "../../helper/jwtinterceptor";
import CatListTable from "./CategoryList/CatListTable";
import { useAuthServiceContext } from "../../context/AuthContext";
import { BASE_URL } from "../../congif";




interface catProps {
    id: number;
    name: string;
    
}


const CategoriesMainSection = () => {
    const theme = useTheme();
    const [drawerOpen, setDrawerOpen] = React.useState(true);
    const jwtAxios = useAxiosWithInterceptor();
    const [, setCreateProduct] = React.useState(false)
    const below750 = useMediaQuery("(max-width: 750px)")
    const [open, setOpen] = React.useState(false);
    const [dataObject, setDataObject] = React.useState<catProps | null >(null)
    const isDarkMode = theme.palette.mode === ("dark")
    const [noOutletError , setNoOutletError] = useState<null | string>(null)
    const {activeOutletId} = useAuthServiceContext();
    const [outletId, setOutletId] = useState("")

    useEffect(()=>{
             if(activeOutletId === null){
                     setNoOutletError("No active outlet, please add/activate an outlet to view data")
                    
                }else{
                    
                    setOutletId(String(activeOutletId))
                    setNoOutletError(null)
                }
                    
    },[activeOutletId])
    

    React.useEffect(() => {
                const handleDrawerToggle = (e: Event) => {
                const customEvent = e as CustomEvent;
                setDrawerOpen(customEvent.detail);
                };
                window.addEventListener("drawer-toggle", handleDrawerToggle);
                return () => window.removeEventListener("drawer-toggle", handleDrawerToggle);
    }, []);
    
    const drawerWidth = drawerOpen ? theme.primaryDraw.width : theme.primaryDraw.closed;
    // const outletId = localStorage.getItem("outlet_id") || ""
    
        const url_cat = React.useMemo(() => {
            if(outletId === "") return null;
                let base = `/categories_info/`;
                
                const params = new URLSearchParams();
        
                if (outletId !== "") {
                    params.append("outlet_id", outletId);
                }
    
        
                if (params.toString()) {
                    base += `?${params.toString()}`;
                }
                
        
                return base;
            }, [outletId]);

    const handleCreateNewProduct = ()=>{
        setDataObject(null)
        setCreateProduct(true);
      setOpen(true)
    }

    const handleClose = () => {
        setOpen(false);
        setDataObject(null)
      };
    
    const { dataCRUD, setDataCRUD,fetchData} = useCrud<catProps>([], url_cat);


    const handleDelete = async (catId:number | undefined) =>{

    try{
        const response = await jwtAxios.delete(
        `${BASE_URL}/categories_info/${catId}/?outlet_id=${outletId}`,{
            withCredentials:true
        })
        
        setDataCRUD((prevData)=>prevData.filter((item)=>(item.id !== catId)))
        if(response.status === 200){
            fetchData()
            handleClose()
        }
        return response.data
    }catch(err:any){
        if (err.response?.status === 400) {
                new Error("400");
            }
        throw err;
        
    }
    
  }

    return (
        
            <>
            <Container  sx={{width:below750?"100%":`calc(100vw - ${drawerWidth}px)`,mb:4,pb:4,height:`calc(100vh - ${theme.primaryAppBar.height}px)`, overflowX:"hidden", overflowY:"hidden", ml:below750?"0px":`${drawerWidth}px`}}>
            <Paper sx={{height:"100%"}}>
                {noOutletError && <Alert severity="error">{noOutletError}</Alert> }
                <Toolbar sx={{justifyContent:"space-between", height:"10%",mt:2}}>
                    <Typography variant="h4">
                        {
                        (dataCRUD?.length > 0 ) 
                            ? 
                           ( 'Category Lists' )
                            : 
                         (<Alert severity="error">No category added. Add to list....</Alert>) 
                        }
                    </Typography>
                    <Box component="button" onClick={handleCreateNewProduct}  sx={{border:"none", backgroundColor:isDarkMode?theme.palette.primary.dark:theme.palette.primary.contrastText}}>
                        <AddCircleOutlineIcon  sx={{cursor:"pointer",color:"blue",backgroundColor:isDarkMode?"none":theme.palette.primary.contrastText, fontSize:"2rem"}} />
                    </Box>
                    {/* <ProductSearchForm inputValue={searchByproductName} handleChange={handleSearchClick}/> */}
                </Toolbar>

                <Box sx={{height:"90%"}}>

                   <CatListTable dataObject={dataObject} setDataObject={setDataObject} 
                   onSuccess={fetchData} handleClose={handleClose} open={open} 
                   setOpen={setOpen} handleOrderDelete={handleDelete} handleClick={()=>{return null}} dataCRUD={dataCRUD} />
                </Box>
                
                

             </Paper>
                 

            </Container>

        </>
            
    )

};

export default CategoriesMainSection