import {
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    Typography,
    useTheme,
    Container,
    Grid,
    Card,
    CardContent,
    useMediaQuery,
    Alert,
    Toolbar,
} from "@mui/material";
import useCrud from "../../hooks/useCrud";
import React, { useEffect, useState } from "react";
import ProductionQuantityLimitsOutlinedIcon from '@mui/icons-material/ProductionQuantityLimitsOutlined';
import UpdateMeasurementDialogue from "./ProductLists/UpdateMeasurementDialogue";
import useAxiosWithInterceptor from "../../helper/jwtinterceptor";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useAuthServiceContext } from "../../context/AuthContext";
import { BASE_URL } from "../../congif";



interface Server {
    id: number;
    measurement_type: string;
    value: number;
    outlet_id:string;
}


const MeasurementsMainSection = () => {
    const theme = useTheme();
    const [drawerOpen, setDrawerOpen] = React.useState(true);
    const jwtAxios = useAxiosWithInterceptor();
    
    const below750 = useMediaQuery("(max-width : 750px)");
    const {activeOutletId} = useAuthServiceContext();
    const [outletId, setOutletId] = useState("")
    const [noOutletError , setNoOutletError] = useState<null | string>(null)
        
        useEffect(()=>{
                    if(activeOutletId === null){
                         setNoOutletError("No active outlet, please add/activate an outlet to view data")
                        
                    }else{
                        
                        setOutletId(String(activeOutletId))
                        setNoOutletError(null)
                    }
                            
            },[activeOutletId])
        
  
    
        const urlMeasure = React.useMemo(() => {
            if(outletId === "")return null;
            let base = `/measurements_info/`;
                
                const params = new URLSearchParams();
        
                if (outletId !== "") {
                    params.append("outlet_id", outletId);
                }
    
        
                if (params.toString()) {
                    base += `?${params.toString()}`;
                }
                
        
                return base;
            }, [outletId]);

            
    React.useEffect(() => {
                const handleDrawerToggle = (e: Event) => {
                const customEvent = e as CustomEvent;
                setDrawerOpen(customEvent.detail);
                };
                window.addEventListener("drawer-toggle", handleDrawerToggle);
                return () => window.removeEventListener("drawer-toggle", handleDrawerToggle);
    }, []);
    
    const drawerWidth = drawerOpen ? theme.primaryDraw.width : theme.primaryDraw.closed;
   
    
    const { dataCRUD, fetchData, setDataCRUD } = useCrud<Server>([], urlMeasure)


    const handleDelete = async (measureId:number) =>{

    try{
        const response = await jwtAxios.delete(
        `${BASE_URL}/measurements_info/${measureId}/?outlet_id=${outletId}`,{
            withCredentials:true
        })
        
        setDataCRUD((prevData)=>prevData.filter((item)=>(item.id !== measureId)))
        console.log(response.data)
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
            <Container  sx={{width:below750?"100%":`calc(100vw - ${drawerWidth}px)`,overflowX:"hidden", ml:below750?"auto":`${drawerWidth}px`, height:"100%", overflowY:"auto"}}>
                    {noOutletError && <Alert severity="error">{noOutletError}</Alert> }
                {/* <Box sx={{m:2, pt: 2,width:"100%", display:"flex", justifyContent:"space-between" }}>
                    <Box >
                        <Typography variant="h4"
                        
                        component="h1"

                        sx={{
                            m:1,
                            display: {
                                xs: "flex",
                                // margin:"1px auto",
                                fontWeight: 100,
                                letterSpacing: "-2px"
                            },
                            textAlign: { xs: "center", sm: "left" }
                        }}
                    >
                        {dataCRUD?.length > 0 ? 'Measurement Lists' :
                          <Alert severity="error">No measurement added. Add to list....</Alert>
                         }
                        
                    </Typography>
                    </Box>
                    <Box></Box>
                    <Box sx={{m:1}}>
                        <UpdateMeasurementDialogue outlet_id={outletId} dataCRUD={dataCRUD} onSuccess={fetchData} />
                    </Box>
                </Box> */}
                <Toolbar sx={{justifyContent:"space-between",width:"100%", height:"10%",mt:2}}>
                    <Typography variant="h5" sx={{width:"70%"}}>
                        {dataCRUD?.length > 0 ? 'Measurement Lists' :
                          <Alert severity="error">No measurement added. Add to list....</Alert>
                        }
                    </Typography>
                                    <Box >
                                        <UpdateMeasurementDialogue outlet_id={outletId} dataCRUD={dataCRUD} onSuccess={fetchData} />
                                    </Box>
                </Toolbar>


                <Grid container spacing={2}>
                    {dataCRUD.map((item) => {
                        return (
                            <Grid  
                                size={{ xs:6, sm: 4, lg:2}}
                                key={item.id}  sx={{
        
                                }}
                                >
                                <Card
                                    sx={{
                                        height: "100%",
                                        width:"100%",
                                        padding:1,
                                        '&:hover':{
                                            backgroundColor:theme.palette.action.hover,
                                       }
                                        
                                        
                                    }}
                                >

                                   
                                        {/* <CardMedia
                                            component="img"
                                            image={item.banner ? `${MEDIA_URL}${item.banner}` : ""}
                                            alt="random"
                                            sx={{ display: { xs: "none", sm: "block" } }}

                                        /> */}
                                        <CardContent sx={{height:'100%', p: 0, "&:last-child": { paddingBottom: 0 } }}>
                                            <ListItem disablePadding>
                                                <ListItemIcon sx={{ minWidth: 0, pr:1 }}>
                                                    <ProductionQuantityLimitsOutlinedIcon/>
                                                </ListItemIcon>
                                                <ListItemText
                                                    disableTypography
                                                    primary={
                                                        <Box sx={{display:"flex",m:1, justifyContent:"space-between"}}>
                                                            <Typography
                                                            
                                                            variant="body2"
                                                            textAlign="start"
                                                            sx={{
                                                                fontWeight: 700,
                                                                textOverflow: "ellipsis",
                                                                overflow: "hidden",
                                                                whiteSpace: "nowrap"
                                                            }}>
                                                            {item.measurement_type} 
                                                        </Typography>
                                                        <Typography></Typography>
                                                        <Typography
                                                            
                                                            variant="body2"
                                                            textAlign="start"
                                                            sx={{
                                                                fontWeight: 700,
                                                                textOverflow: "ellipsis",
                                                                overflow: "hidden",
                                                                whiteSpace: "nowrap"
                                                            }}>
                                                             {item.value}
                                                        </Typography>
                                                        </Box>
                                                        
                                                        }
                                                        
                                                        
                                                    secondary={
                                                        <>
                                                        <Box sx={{display:"flex", pt:2,borderTop:`1px solid ${theme.palette.divider}`, mt:1, justifyContent:"space-between" }}>
                                                          
                                                             <Box >
                                                                <UpdateMeasurementDialogue onSuccess={fetchData} outlet_id={item?.outlet_id} key={item.id} idDataCrud={item.id} dataCRUD={dataCRUD}/>
                                                            </Box>
                                                            <Box></Box>
                                                           
                                                            
                                                              <Box sx={{color:"red", border:"none", backgroundColor:theme.palette.primary.contrastText, cursor:"pointer"}} component="button" onClick={()=>handleDelete(item.id)}>
                                                                < DeleteForeverIcon/>
                                                            </Box>
                                                        
                                                            
                                                            {/* <Typography
                                                                variant="body2"
                                                            >
                                                                {item.category}

                                                            </Typography> */}
                                                        </Box>
                                                        </>
                                                        
                                                       }
                                                />
                                            </ListItem>
                                        </CardContent>
                                </Card>

                            </Grid>
                        )
                    })}
                </Grid> 

            </Container>

        </>
    )

};

export default MeasurementsMainSection