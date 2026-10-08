import {Box, CssBaseline, Divider, Paper,Tooltip, Typography, useMediaQuery, useTheme} from "@mui/material"

import CreateSales from "../components/Main/sales/CreateSales";
import SalesReceipt from "../components/Main/sales/SalesReceipt";
import useAxiosWithInterceptor from "../helper/jwtinterceptor";
import React, { useEffect, useState } from "react";
import PrimaryAppBar from "./templates/PrimaryAppBar";
import PrimaryDraw from "./templates/PrimaryDraw";
import SideMenu from "../components/PrimaryDraw/SideMenu";
import SecondaryDraw from "./templates/SecondaryDraw";
import Main from "./templates/Main";
import useCrud from "../hooks/useCrud";

import MenuIcon from '@mui/icons-material/Menu';
import Alert from "../components/Alert";
import { Server } from "../@types/server";
import OutletStaffSession from "../components/Main/accounts/outletStaffSession/OutletStaffSession";
import { UseoutletNstaffContext } from "../context/OutletNStaffsContext";
import { outletStaffDataProps } from "../@types/outletsNstaff-service";
import qz from "qz-tray";
import { useAuthServiceContext } from "../context/AuthContext";
import { BASE_URL, BASE_URL_ACCOUNT } from "../congif";



interface productType{
    id?:number;
    outlet:string;
    user?:number;
    product_name:string;
    sold_in:string;
    cost_price: number;
    selling_price:number;
    stock_inventory:number;
    category:string

}
interface orderType  {
    id:number;
    product:productType;
    quantity:number;
    description?:string
    date:string;
    paid:boolean;
    sub_total:number

}

interface ServerReceipt {
    id: number;
    hold:boolean;
    orders: orderType[];
    remarks?: string;
    date?: string;
    issued?:boolean;
    total?:number
    
}

interface receiptStatusDataProps{
    id:string;
    hold:boolean
}

const SalesNReceipt = () => {
  const theme=useTheme()
  const jwtAxios = useAxiosWithInterceptor();
  const [loading, setLoading] = useState(false);
  const below850 = useMediaQuery("(max-width:1000px)");
  const below720 = useMediaQuery("(max-width:720px)");
  const [, setDrawerOpen] = React.useState(true);
  const [receiptStatusData, setReceiptStatusData] = React.useState<null | receiptStatusDataProps[]>(null)
  const [receiptStatus, setReceiptStatus] = React.useState<null | boolean>(null)
  const [, setReceiptId] = React.useState<number| null>(null)
  const [, setOpen] = React.useState(false);
  const [errorOrder,setErrorOrder] = React.useState<null|string>(null);
//   const outlet_id =localStorage.getItem("outlet_id") || "" 
  const [paymentOption, setPaymentOption] = React.useState('');
  const [remarks, setRemarks] = React.useState('');
  const [amountTendered, setAmountTendered] = React.useState<number>(0)
  const [showReceiptDetaills, setShowReceiptDetaills] = React.useState<boolean>(false)
  const [assignMess, setAssignMess] = useState<null|string>(null)
  const [printerMess, setPrinterMess] = useState<null|string>(null)
  const [assignedStaff, setAssignedStaff]  = React.useState<outletStaffDataProps | null >(null)
  const {getStaffStatus, setStaffStatus,staffData} = UseoutletNstaffContext();
  const [searchByproductName, setSearchByproductName] = React.useState<string>("");
  const [inventoryError,setInventoryError] = useState<{inventory_error:string, product_id:string}|null>(null)
    const {activeOutletId, userId} = useAuthServiceContext();
    const [, setUserId] = useState("")
    const [outlet_id, setOutletId] = useState("")
    const [filterOption, setFilterOption] = React.useState("" );
      
    useEffect(()=>{
                  if(activeOutletId){
                      setOutletId(String(activeOutletId))
                      setFilterOption(String(activeOutletId))
                  }
                  if(userId){
                    setUserId
                  }
                          
      },[activeOutletId,userId])
          
  
  


    useEffect(()=>{
        
        if (!staffData.length) return;
        
        const getAssignedStaff = async ()=>{
            try{
                const response = await jwtAxios.get(`${BASE_URL_ACCOUNT}/staffs-login/assign_staff_session/`, 
                    {withCredentials:true}
                )
                
                if(response.status === 200){
                    console.log("I only set cos is 200")
                     const staff_status=await getStaffStatus(response.data.assigned_staff)
                     const IsItAssigne =  staffData?.find((item)=>String(response.data.assigned_staff) === String(item.Employee_id)) ?? null
                     if(IsItAssigne && staff_status.is_active === true){
                        setAssignedStaff(IsItAssigne)
                        
                     }
                        
                        
                }
                
                return response.data
            }catch(err:any){
                 console.log(err.response)
                if(err.response?.status === 404){
                    setStaffStatus(undefined)
                    setAssignedStaff(null)
                    setAssignMess(err.response.data?.error)
                    setTimeout(()=>{
                        setAssignMess(null)
                    },100 * 100)
                }
                
                throw err.response
            }
                
 
        }
            
            
            getAssignedStaff()
        
       
    },[staffData, activeOutletId])
    

  
  React.useEffect(() => {
                const handleDrawerToggle = (e: Event) => {
                const customEvent = e as CustomEvent;
                  console.log(customEvent.detail)
                setDrawerOpen(customEvent.detail);
                };
                window.addEventListener("drawer-toggle", handleDrawerToggle);
                console.log(window.Event)
                return () => window.removeEventListener("drawer-toggle", handleDrawerToggle);
    }, []);

     const handleSearchClick = (event:React.ChangeEvent<HTMLInputElement>)=>{
              const inputId = event.target.value.trim()
              setSearchByproductName(inputId)
          }
    const url_product = React.useMemo(() => {
        if(filterOption==="")return null
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
        }, [filterOption,searchByproductName]);
        const url_receipt = React.useMemo(() => {
            if (filterOption === "") return null
            let base =  `/sales_receipt/`;
            
            const params = new URLSearchParams();
    
            if (filterOption !== "") {
                params.append("outlet_id", filterOption);
            }

    
            if (params.toString()) {
                base += `?${params.toString()}`;
            }
            
    
            return base;
        }, [filterOption]);

        
        

      const handleReceiptSubmit = async (hold:boolean, receipt_id:number)=>{
        
            
           const payload ={
                    "id":receipt_id,
                    "orders": 
                       receiptData.flatMap((item)=>
                        item.orders.map((orderItem)=>{
                            return( {
                                'product': orderItem.product.id,
                                'quantity':orderItem.quantity,
                                'sub_total':orderItem.sub_total
                            })
                          
                        })
                       )
                    ,
                    "remarks": remarks??"",
                    "payment_option": paymentOption?? "",
                    "amount_tenderd": amountTendered,
                    "hold":hold
                    }
            try{
                if(outlet_id === "") return;
                
                const response = await jwtAxios.put(`${BASE_URL}/sales_receipt/${receipt_id}/?outlet_id=${outlet_id}`,
                payload,
               { withCredentials: true}
            )
            
                const dataCRUDBack = response.data
                // setData(dataCRUDBack)
                if(response.status === 200){
                    if(!response.data?.["hold"]){
                        
                        const printerName = localStorage.getItem("selectedPrinter") || ""
                            if(printerName !== ""){
                                const config = qz.configs.create(printerName);
                                await qz.print(config, [
                                    {
                                        type: "pdf",
                                        data:  response.data.pdf_url
                                    },
                                ] as any);
                            }else{
                                setPrinterMess("for a more robust printing experience, please setup Printer in setting");
                                window.open(response.data.pdf_url, "_blank")
                            }
                        
                            setTimeout(()=>{
                                setPrinterMess(null)
                        }, 100 * 150)

                    }
                    
                    
                  
                    await fetchReceipt()
                   await fetchProducts()
                    localStorage.removeItem("receipt_id")
                }
                return dataCRUDBack
            }catch(error:any){
                if(error.response?.status === 400 && error.response?.data?.inventory_error){
                    setInventoryError(error.response?.data)
                }
                if (error.response?.status === 404) {
                setErrorOrder(error.response?.data.detail)
                }
                 if (error.response?.status === 400) {
                    new Error("400");
                }
                if(error.response?.status === 400){
                    setAssignMess(error.response.data?.error)
                    setInterval(()=>{
                        setAssignMess(null)
                    },100 * 100)
                }
                throw error.response
            }finally{
                setRemarks("")
            }
                
            
    
        }

    const handleSetReceipt = async (id:number)=>{
        
        setErrorOrder(null);
        
        const disabled=receiptStatusData?.find((item)=>item.hold === false)
        if(disabled && String(disabled?.id) !== String(id)){
            setErrorOrder("hold the active Receipt, before switching to another")
            return;
        }
        if (loading) return;
         setLoading(true);
        const getReceiptStatusOnRefresh = receiptStatusData?.filter((item)=>String(id)===String(item.id) )
        
        const newValue = !getReceiptStatusOnRefresh?.[0].hold
        
        if(below720 && newValue !== true ){
            setShowReceiptDetaills((prevValue)=>!prevValue)
        }
        setReceiptStatus(newValue)
    
        
        setReceiptId(id)
        localStorage.setItem("receipt_id", String(id))
        const payload = {
            "hold":newValue
        }
    
        try{
            if(!id) return;
            
            const response = await jwtAxios.patch(`${BASE_URL}/sales_receipt_status/${id}/?outlet_id=${outlet_id}`, 
                payload,
                {withCredentials:true}
            )
            
            if(response.data["hold"] === true){
                
               await handleReceiptSubmit(response.data["hold"], id)
                // localStorage.removeItem("receipt_id")
            }else{
                await fetchReceipt()
            }
            
            return response.data
        }catch(err:any){
             
            if (err.response?.status === 403) {
                setAssignMess(err.response?.data.error)

                setInterval(() => {
                    setAssignMess(null)
                }, 100 * 100);
            }

            if (err.response?.status === 400) {
                new Error("400");
            }
            throw err;
        }finally{
            setLoading(false);
        }
    }
    const getReceiptStatus = async ()=>{
        
         try{
            const response = await jwtAxios.get(`${BASE_URL}/sales_receipt_status/?outlet_id=${outlet_id}`,{withCredentials:true})
            setReceiptStatusData(response.data)
           if(localStorage.getItem("receipt_id")){
                const getId=response.data?.find((item:{id:number, hold:boolean})=>!item.hold)
                if(getId){
                    localStorage.setItem("receipt_id", getId?.id)
                }else{
                    localStorage.setItem("receipt_id", "")
                }
                
           }
            
            return response.data
        }catch(err:any){
            if (err.response?.status === 400) {
                new Error("400");
            }
            throw err;
        }
    }


    const {dataCRUD: productData,fetchData: fetchProducts,error:productError} = useCrud<Server>([], url_product);

    const { dataCRUD: receiptData,fetchData: fetchReceipt, setDataCRUD:setDataCRUDReceipt, error:receiptError} = useCrud<ServerReceipt>([], url_receipt);
    
    
    // const { dataCRUD, fetchData, error,setDataCRUD } = useCrud<Server>([], url_receipt)

    React.useEffect(()=>{
            if(outlet_id === "") return
       getReceiptStatus()
    },[receiptStatus, receiptData, outlet_id])


    const handleClick = async (id:number )=>{
        setErrorOrder(null);
        const receipt_id =localStorage.getItem("receipt_id") || ""
        
        if(below720){
            setShowReceiptDetaills((prevValue)=>!prevValue)
        }
        const payload =
             {
                    "receipt_id":receipt_id,
                    'user':userId,
                    'product':id,
                    'quantity':1
                } 
        try {
            
            const response = await jwtAxios.post(`${BASE_URL}/order/`,payload,
                {
                    headers:{"X-Pass-Token":outlet_id}
                    ,withCredentials:true}
               
            // {
            //      headers: {
            //         "X-Outlet-Id": outlet_id
            //     },
            //     withCredentials: true,
            // }
        
               
            );
            const data = response.data;
            if (response.status === 201){
                setErrorOrder(null)
                setOpen(true);
                if(receiptData.length != 0){
                    setDataCRUDReceipt(
                        receiptData.map(item => ({
                            ...item,
                            orders:[
                                ...item.orders,
                                response.data?.['data']
                            ]

                            
                        }))
                    );
                }else{
                    fetchReceipt()
                }
                 
                
                setReceiptStatus(response.data['receipt_status'])
                setReceiptId(response.data["receipt_id"])
                localStorage.setItem("receipt_id", response.data["receipt_id"])
            }
            return data;
        } catch (error: any) {
            if (error.response?.data.error_len) {
                
            setErrorOrder(error.response?.data.error_len)
        }
            if (error.response?.status === 400) {
                console.log(error.response)
                new Error("400");
                setShowReceiptDetaills(false)
                setErrorOrder(error?.response.data.error);
            }

            throw error.response;
        }
    };

    const onSmallScreenClick = ()=>{
        setShowReceiptDetaills(!showReceiptDetaills)
    }
  
  
      
  return(
    <>
        <Box display="flex"  >
            <CssBaseline/>
            <PrimaryAppBar/>
            <Box sx={{display:below850?"none":"flex"}}>
                 <PrimaryDraw>
                <SideMenu open={false} />
            </PrimaryDraw>
           
            
            </Box>
                <SecondaryDraw showReceiptDetaills={showReceiptDetaills}>
                    {below720?
                    (
                        <Box sx={{position:"relative"}}>
                        {showReceiptDetaills&&
                            <Box sx={{height:"5%"}}>
                                <MenuIcon fontSize="medium" sx={{display:"block",margin:"1px auto",transform:"rotate(90deg)"}}/>
                            </Box>
                        }
                        
                        
                        <Box display={!showReceiptDetaills?"none":"block"} component="button" onClick={onSmallScreenClick}
                                    sx={{
                                        height:"100vh",
                                        border:"none",
                                        position: "absolute",
                                        cursor:"pointer",
                                        inset: 0,
                                        backgroundColor: "#aba1a180",
                                        zIndex: 2000
                                    }}
                        />
                    
                    
                            <Box>
                                 {printerMess && 
                                    <Box sx={{width : "100%", display:"block", backgroundColor:"#6feca3"}}>
                                        <Typography color="white" sx={{display:"block", margin:"1px auto"}}>
                                            {printerMess}
                                        </Typography>
                                    </Box>
                                    }
                                
                                <OutletStaffSession setDataCRUDReceipt={setDataCRUDReceipt} fetchReceipt={fetchReceipt} assignMess={assignMess} setAssignMess={setAssignMess}  assignedStaff={assignedStaff} setAssignedStaff={setAssignedStaff} staffData={staffData}/>
                                <Paper sx={{height:"7%", backgroundColor:theme.palette.primary.contrastText}}>
                                    
                                    <Box sx={{display:"flex",justifyContent:"center",alignContent:"center" }}>
                                        
                                        {receiptStatusData?.map((receiptItem)=>{
                                    return(
                                            <React.Fragment key={receiptItem.id}>
                                                <Tooltip key={receiptItem.id} arrow placement="bottom-end" title={receiptItem.hold === true?"On hold": "Active"}>
                                                    <Box disabled={loading?true:false}  key={receiptItem.id} 
                                                        sx={{m:1,p:0.5,minWidth:"50px",
                                                            position:"relative" ,
                                                            height:"35px", 
                                                            backgroundColor:receiptItem.hold===true?"#eed0d0":"#ee7e7e",color:"#fff", 
                                                            border:"none", 
                                                            borderRadius:"20%", 
                                                            cursor:loading?"not-allowed":"pointer"}} 
                                                            component="button"  onClick={()=>{handleSetReceipt(Number(receiptItem.id))}}  
                                                    >
                                                        {!receiptItem.hold&&
                                                        <Box component="span" key={receiptItem.id}
                                                            sx={{
                                                                position:"absolute", 
                                                                width:"12px", 
                                                                height:"12px",
                                                                borderRadius:"25px", 
                                                                top:-5, left:-3, 
                                                                backgroundColor:"#90b5e2"}}
                                                        >

                                                        </Box>}
                                                        {receiptItem.id}
                                                </Box>
                                                </Tooltip>
                                            
                                            </React.Fragment>
                                        )
                                        })}
                                    </Box>
                                </Paper>
                            </Box>
                            <Box sx={{maxWidth:theme.MainDrawWidth.width, whiteSpace:"wrap"}}>
                                            {receiptError &&
                                    <Alert  errorMessage={receiptError}/>
                                    }
                                    {productError &&
                                    <Alert errorMessage={productError}/>
                                    }
                                    {errorOrder&&
                                    <Alert errorMessage={errorOrder}/>
                                    }
                            </Box>
                        
                        <CreateSales searchByproduct={searchByproductName} handleSearchClick={handleSearchClick} handleClick={handleClick} dataCRUD={productData}/>
                    </Box>
                    ):
                    (
                      <>
                            <Divider/>
                            <Box>
                            {printerMess && 
                                <Box sx={{width : "100%", display:"block", backgroundColor:"#6feca3"}}>
                                    <Typography color="white" sx={{display:"block", margin:"1px auto"}}>
                                        {printerMess}
                                    </Typography>
                                </Box>
                                }
                                
                               
                                    <OutletStaffSession setDataCRUDReceipt={setDataCRUDReceipt} fetchReceipt={fetchReceipt} assignMess={assignMess} setAssignMess={setAssignMess} assignedStaff={assignedStaff} setAssignedStaff={setAssignedStaff} staffData={staffData}/>
                                
                                <Paper sx={{ backgroundColor:theme.palette.primary.contrastText}}>
                                    
                                    <Box sx={{display:"flex",justifyContent:"center",alignContent:"center" }}>
                                        
                                        {receiptStatusData?.map((receiptItem)=>{
                                    return(
                                            <React.Fragment key={receiptItem.id}>
                                                <Tooltip sx={{cursor:"not-allowed"}} arrow placement="bottom-end" title={receiptItem.hold === true?"On hold": "Active"}>
                                                    <Box disabled={loading?true:false} 
                                                     sx={{
                                                        cursor:loading?"not-allowed":"pointer",
                                                        m:1,p:0.5,minWidth:"50px",position:"relative" ,
                                                     height:"35px", 
                                                     backgroundColor:receiptItem.hold===true?"#eed0d0":"#ee7e7e",color:"#fff",
                                                      border:"none", borderRadius:"20%",}} component="button"  
                                                      onClick={()=>{handleSetReceipt(Number(receiptItem.id))}} key={receiptItem.id} >
                                                    {!receiptItem.hold&&
                                                    <Box 
                                                        sx={{position:"absolute", 
                                                        width:"12px", height:"12px",borderRadius:"25px", top:-5, left:-3, 
                                                        backgroundColor:"#90b5e2"}}
                                                    >
                                                    </Box>}
                                                    {receiptItem.id}
                                                </Box>
                                                </Tooltip>
                                            
                                            </React.Fragment>
                                        )
                                        })}
                                    </Box>
                                </Paper>
                            </Box>
                            <Box sx={{maxWidth:theme.MainDrawWidth.width, whiteSpace:"wrap"}}>
                                            {receiptError &&
                                    <Alert  errorMessage={receiptError}/>
                                    }
                                    {productError &&
                                    <Alert errorMessage={productError}/>
                                    }
                                    {errorOrder&&
                                    <Alert errorMessage={errorOrder}/>
                                    }
                            </Box>
                        
                        <CreateSales searchByproduct={searchByproductName} handleSearchClick={handleSearchClick} handleClick={handleClick} dataCRUD={productData}/>
                    
                      </>    
                    )
                    }
                    
                </SecondaryDraw>
            
            
            {/* <Box sx={{display:below900?"none":"flex"}}> */}
                <Main showReceiptDetaills={showReceiptDetaills} >
                    {below720?
                    (    <>
                            <Box  sx={{position:"relative"}}>
                                    {!showReceiptDetaills&&
                                    <Box sx={{height:"5%"}}>
                                        <MenuIcon fontSize="medium" sx={{display:"block",margin:"1px auto",transform:"rotate(90deg)"}}/>
                                    </Box>
                                    }  
                                    <Box flexGrow={1} sx={{height:"95%",m:0.5, overflowY:"auto", overflowX:"hidden"}}>
                                        <SalesReceipt 
                                        setInventoryError={setInventoryError}
                                        inventoryError={inventoryError}
                                      setAmountTendered={setAmountTendered} amountTendered={amountTendered}
                                      paymentOption={paymentOption} setPaymentOption={setPaymentOption}
                                      remarks={remarks} setRemarks={setRemarks}
                                      handleReceiptSubmit={handleReceiptSubmit} handleClick={handleClick} dataCRUD={receiptData} setDataCRUDReceipt={setDataCRUDReceipt} showReceiptDetaills={false}/>
                            </Box>
                                <Box display={showReceiptDetaills?"none":"block"} component="button" onClick={onSmallScreenClick}
                                    sx={{
                                        height:"100vh",
                                        border:"none",
                                        position: "absolute",
                                        cursor:"pointer",
                                        inset: 0,
                                        backgroundColor: "#aba1a180",
                                        zIndex: 1
                                    }}
                                />
                                        
                                                        
                            </Box>
                            
                        </>
                             
                    ):
                    (
                        <Box flexGrow={1} sx={{width:{lg:"100%",md:"100%", sm:"100%" }, height:"100%",m:0.5 ,overflow:"auto"}}>
                            <SalesReceipt 
                            inventoryError={inventoryError}
                            setInventoryError={setInventoryError}
                            showReceiptDetaills={showReceiptDetaills}
                            setAmountTendered={setAmountTendered} amountTendered={amountTendered}
                            paymentOption={paymentOption} setPaymentOption={setPaymentOption}
                            remarks={remarks} setRemarks={setRemarks}
                            handleReceiptSubmit={handleReceiptSubmit}  handleClick={handleClick} dataCRUD={receiptData} 
                            setDataCRUDReceipt={setDataCRUDReceipt}/>
                        </Box>
                    )
                    }
                    
                   
                    {/* <ReceiptDialogue
                     handleClose={handleClose} open={open} receiptData={receiptData} handleClick={handleClick} setDataCRUDReceipt={setDataCRUDReceipt}
                    /> */}
                </Main>
            {/* </Box> */}
               
        

    
            
        </Box>
        
    </>
  );
};

export default SalesNReceipt;
