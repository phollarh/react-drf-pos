import {
    Box,
    Typography,
    useTheme,
    Container,
    Toolbar,
    Paper,
    useMediaQuery,
    Alert
} from "@mui/material";
import useCrud from "../../hooks/useCrud";
import React, { useEffect, useState } from "react";
import ProductSearchForm from "./ProductLists/ProductSearchForm";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ProductListTable from "./ProductLists/ProductListTable";
import { Server } from "../../@types/server";
import { useAuthServiceContext } from "../../context/AuthContext";




const MainSection = () => {
    const theme = useTheme();
    const [drawerOpen, setDrawerOpen] = React.useState(true);
    
    const [searchByproductName, setSearchByproductName] = React.useState<string>("");
    // const [filterOption] = React.useState(() => localStorage.getItem("outlet_id") || "" );
    const [, setCreateProduct] = React.useState(false)
    const below750 = useMediaQuery("(max-width: 750px)")
    const below350 = useMediaQuery("(max-width: 350px)")
    const [open, setOpen] = React.useState(false);
    const [dataObject, setDataObject] = React.useState<Server | null >(null)
    const isDarkMode = theme.palette.mode === ("dark")
    const {activeOutletId} = useAuthServiceContext();
    const [filterOption, setFilterOption] = useState("")
    const [noOutletError , setNoOutletError] = useState<null | string>(null)
    
    useEffect(()=>{
                if(activeOutletId === null){
                     setNoOutletError("No active outlet, please add/activate an outlet to view data")
                    
                }else{
                    
                    setFilterOption(String(activeOutletId))
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
    
    const handleCreateNewProduct = ()=>{
        console.log("hererer")
        setDataObject(null)
        setCreateProduct(true);
        setOpen(true)
    }

    const url = React.useMemo(() => {
        if(filterOption === "")return null;
        let base = `/products/`;
        const params = new URLSearchParams();

        if (filterOption !== "") {
            params.append("outlet_id", filterOption);
        }
        

        if (searchByproductName !== "") {
            params.append("search", searchByproductName);
        }

        if (params.toString()) {
            base += `?${params.toString()}`;
        }
        

        return base;
    }, [filterOption, searchByproductName]);
    
    const { dataCRUD, fetchData,setDataCRUD, deleteData } = useCrud<Server>([], url)



    const handleClose = () => {
        setOpen(false);
        setDataObject(null)
      };
    
      
    const handleOrderDelete = async (productId:number|undefined) =>{
        if (!productId) return;
        await deleteData(productId)
        setDataCRUD((prevData)=>prevData.filter((item)=>(item.id !== productId)))
        handleClose()
    
  }
      const handleSearchClick = (event:React.ChangeEvent<HTMLInputElement>)=>{
          const inputId = event.target.value.trim()
          setSearchByproductName(inputId)
      }
      
    return (
        <>
            <Container  sx={{width:below750?"100%":`calc(100vw - ${drawerWidth}px)`,mb:4,pb:4,height:`calc(100vh - ${theme.primaryAppBar.height}px)`, overflowX:"hidden", overflowY:"hidden", ml:below750?"0px":`${drawerWidth}px`}}>
            <Paper sx={{height:"100%",}}>
                {noOutletError && <Alert severity="error">{noOutletError}</Alert> }
                { activeOutletId  &&
                <Toolbar  sx={{display:below350?"block":"flex",justifyContent:"space-between", height:"20%",mt:2}}>
                    
                    <>
                        <Typography variant="h4" sx={{fontSize:below350?"25px !important": "inherit", textAlign:"center", m:1}}>
                        {dataCRUD?.length > 0 ? ('Product Lists')
                         : <Alert severity="error">No product added. Add to list....</Alert>
                          }
                    </Typography>
                    <Box component="button" onClick={handleCreateNewProduct}  sx={{display:"block",margin:below350?"0.5px auto !important":"auto",border:"none",textAlign:"center", backgroundColor:isDarkMode?theme.palette.primary.dark:theme.palette.primary.contrastText}}>
                        <AddCircleOutlineIcon  sx={{cursor:"pointer",m:1,textAlign:"center", display:"block",color:"blue",backgroundColor:isDarkMode?"none":theme.palette.primary.contrastText, fontSize:"2rem"}} />
                    </Box>
                    <ProductSearchForm inputValue={searchByproductName} handleChange={handleSearchClick}/>
                    </>
                    
                </Toolbar>
                }
                {activeOutletId &&
                <Box sx={{height:"80%"}}>

                    <ProductListTable dataObject={dataObject} setDataObject={setDataObject} 
                    onSuccess={fetchData} handleClose={handleClose} open={open} setOpen={setOpen} 
                    handleOrderDelete={handleOrderDelete} handleClick={()=>{return null}} dataCRUD={dataCRUD} />
                </Box>
                }
                
                
                

             </Paper>
                 

            </Container>

        </>
    )

};

export default MainSection