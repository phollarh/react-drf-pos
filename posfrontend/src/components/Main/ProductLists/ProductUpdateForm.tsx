import { useFormik } from "formik"
import { useNavigate } from "react-router-dom"
import { Box, Button, Divider, MenuItem, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import useAxiosWithInterceptor from "../../../helper/jwtinterceptor";
import React from "react";
import { UseoutletNstaffContext } from "../../../context/OutletNStaffsContext";
import { Server } from "../../../@types/server";
import { FormikErrors } from "formik";
import useCrud from "../../../hooks/useCrud";
import PassCodeDiagUpdate from "../../PassCodeDiagUpdate";
import PassCodeDiag from "../../PassCodeDiag";
import { requestIdProps } from "../../../@types/auth-service";



interface UpdateProductFormProps {
    handleOrderDelete:(id:number|undefined)=>Promise<void>
  dataCRUD?: Server[];
  productName:string | undefined
  outlet:string | undefined;
  category:{name:string, id:number} | undefined;
  costPrice:string | undefined;
  sellingPrice:number | undefined;
  soldIn:{id:number; measurement_type:string;} | undefined;
  stockInventory?:number;
  productId?:number;
  dataObject:Server | null
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
   onSuccess: () => Promise<any>
    onClose:() => void;

}

interface ServerCat{
    id:number;
    name:string
}
interface ServerMeasure {
    id:number;
    measurement_type:string;
}
type payloadProps ={
    "product_name":string;
    "sold_In":{"id" : number};
    "outlet":string;
    "cost_price": string;
    "selling_price":number;
    "stock_inventory":number;
    "category": {"id" : number };
    "quantity"?:string;
    "action" ?: string;
    }



const ProductUpdateForm = ({

    productName,
    category,
    costPrice,
    sellingPrice,
    soldIn,
    stockInventory,
    productId,
    // setDataCRUD,
    setIsLoading,
    onClose,
    onSuccess
 }:UpdateProductFormProps) => {
    const jwtAxios = useAxiosWithInterceptor();
    const {outletsData, staffData} = UseoutletNstaffContext();
    const navigate = useNavigate()
    const Ref = useRef<HTMLDivElement>(null)
    const [open, setOpen] = useState(false);
    const [openDel, setOpenDel] = useState(false);
    const outletId = localStorage.getItem("outlet_id") || ""
    const passTokenRef = useRef<string | null>(null);
    const [updateInventory,setUpdateInventory] = useState(false)
    const [mess, setMess] = useState<null | string>(null)
    const [requestId, setRequestId] = useState<requestIdProps | null>(null)
    const createIdRef = useRef(crypto.randomUUID());

    useEffect(()=>{
        if(productId){
            
             setRequestId(
                {object_details:"product_update",
                    id:String(productId)
                }
                )
        }else{
            setRequestId(
                {object_details:"product_create",
                    id:createIdRef.current
                }
                )
        }
       
    },[productId])
    

    const handleDelete = async ()=>{
        // if(!productId)return
        console.log(productId, "called")
        try{
            console.log("am innnnn")
            const response = await jwtAxios.delete(`http://127.0.0.1:8000/api/products/${productId}/?outlet_id=${outletId}`,

                {
                   headers: {
                    "X-Pass-Token": passTokenRef.current
                },
                    withCredentials:true
                }
                )
                if(response.status === 200){
                    setMess(response.data.message)
                    passTokenRef.current = null
                    setTimeout(() => {
                        onClose()
                    }, 4000);
                  await onSuccess()
                  
                   
                }
                console.log(response.data)
                return response.data
        }catch(err:any){
            console.log(err)
            if(err.response?.status === 403 && err.response?.data.error_token){
                setOpenDel(true)
            }
            if(err.response.data?.error){
                    setMess(err.response.data.error)
                    
                setTimeout(()=>{
                    setMess(null)
                },6000)
            }
            
            throw err
        }
    }
    const allowedStatus = ["Supervisor", "Manager"]
    const filterStaffData = staffData.filter((item)=>
        allowedStatus.map((itemall)=>
            itemall === item.status
        )
    )
    console.log(filterStaffData)
    // dataCRUD?.map((item)=>{   
    // soldInData.push(item.sold_In)
    // })
    const url_Soldin = React.useMemo(() => {
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
    const url_cat = React.useMemo(() => {
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
    const { dataCRUD: catData} = useCrud<ServerCat>([], url_cat);
    const { dataCRUD: measuredData} = useCrud<ServerMeasure>([], url_Soldin);

    // const uniqueSoldIn = React.useMemo(() =>
    //      [...new Set(dataCRUD?.map(item => item.sold_In))],
    //     [dataCRUD]
    //     );

    // const uniqueCategory = React.useMemo(() => [...new Set(dataCRUD?.map(item => item.category))],
    //     [dataCRUD]
    // );
    // // console.log(uniqueCategory,uniqueSoldIn)
    // console.log(productId, 'product_id')

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            product_name: productName ?? "",
            outlet:outletId ?? "",
            category: category?.["id"] ?? "",
            cost_price: costPrice ?? "",
            selling_price: sellingPrice ?? 0,
            sold_In: soldIn?.['id'] ?? "",
            stock_inventory: stockInventory ?? 0,
            product_id:productId ?? 0,
            quantity:"",
            action:""
            
        },
        validate: (values) => {
            const errors:FormikErrors<typeof values> = {};
            if (!values.product_name) {
                errors.product_name = "Required"
            }else if(!values.category){
                errors.category = "Required"
                
            }else if(!values.sold_In){
                errors.sold_In = "Required"
            }else if(!values.selling_price){
                errors.selling_price = "Required"
            }else if(!values.cost_price){
                errors.cost_price = "Required"
            }else if( updateInventory == true && Number(values.quantity) <= 0){
                errors.quantity = "quantity can not be less than 0"
            }
            return errors;
        },
        onSubmit: async (values, { setErrors, setTouched }) => {
            setTouched({
                cost_price: true,
                selling_price: true,
            });
            setIsLoading(true)
            const { product_name, category,cost_price,selling_price,sold_In,stock_inventory,product_id,outlet } = values;
           
           const payload :payloadProps ={
                
                "product_name": product_name,
                 "sold_In":{"id" : Number(sold_In),},
                 "outlet":outlet,
                "cost_price": cost_price,
                "selling_price":selling_price,
                "stock_inventory":stock_inventory ,
                "category": {"id" : Number(category) },
                "quantity":values.quantity,
                 "action" : values.action
                }  
              if(updateInventory === false){
                    delete payload["quantity"]
                    delete payload["action"]
                }
        try{
            if(product_id && product_id > 0){
               
                const response = await jwtAxios.patch(`http://127.0.0.1:8000/api/products/${product_id}/?outlet_id=${outletId}`,
                payload,
                { 
                    headers: {
                    "X-Pass-Token": passTokenRef.current
                    },
                    withCredentials: true}
                )
                const dataCRUDBack = response.data
                
                
                    
            //     if(values.action && values.quantity ){
            //          await jwtAxios.post(`http://127.0.0.1:8000/api/products/inventory_log/?product_id=${dataCRUDBack.id}`,
            //         {
            //             "product":dataCRUDBack.id,
            //             "quantity":values.quantity,
            //             "action" : values.action
            //         },
            //     { 
            //         withCredentials: true}
            //     )
            //     }
            console.log(dataCRUDBack)
                    await onSuccess()
                    onClose()

                    return dataCRUDBack
            }
            else{
                const response = await jwtAxios.post(`http://127.0.0.1:8000/api/products/?outlet_id=${outletId}`, payload, {
                    headers: {
                    "X-Pass-Token": passTokenRef.current
                    },
                withCredentials: true,
                
                });
                
                // onSuccess()
                console.log(response.status)
                if(response.status === 200){
                     onSuccess();
                    onClose();
                
                }
                    // setDataCRUD(prevItem=>
                    //    [response.data,
                    //     ...prevItem] 
                    // )
                    
                return response.data;
            }
           
        }catch(error:any){
            if(error.response?.status === 403 && error.response?.data.error_token){
                setOpen(true)
            }
             if (error.response?.status === 400) {
                new Error("400");
                console.log(error.response.data)
            }
            if(error.response?.data){
                const backError = error.response?.data
                const formattedErrors: any = {};
                Object.keys(backError).forEach((key)=>{
                    formattedErrors[key] = backError[key][0]
                })

                setErrors(formattedErrors);
            }
            setIsLoading(false)
            throw error;
            
        }finally{
            setIsLoading(false)
            passTokenRef.current = null
        }
    
        },
    })
    return (
        <>
            
            
                
                <Box sx={
                    {   
                        width:"300px",

                    }}>
                    <Box  component="form" sx={{ display: "flex",maxWidth:"100%",flexGrow:1, alignItems: "center", flexDirection: "column",}} onSubmit={formik.handleSubmit}>
                        
                       
                        <TextField
                        size="small"
                            fullWidth
                            id="product_name"
                            name="product_name"
                            label="Product Name"
                            type="text"
                            value={formik.values.product_name}
                            onChange={formik.handleChange}
                            error={!!formik.touched.product_name && !!formik.errors.product_name}
                            helperText={formik.touched.product_name && formik.errors.product_name}
                        >
                        </TextField>
                        <TextField
                        size="small"
                            margin="normal"
                            fullWidth
                            id="outlet"
                            select
                            disabled
                            name="outlet"
                            label="Outlet"
                            value={formik.values.outlet}
                            onChange={formik.handleChange}
                            error={!!formik.touched.outlet && !!formik.errors.outlet}
                            helperText={formik.touched.outlet && formik.errors.outlet}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                           
                           {outletsData.map((item) => (
                                <MenuItem key={item.id} 
                                value={item.id}
                                >
                                    {item.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                        size="small"
                            margin="normal"
                            fullWidth
                            id="category"
                            select
                            name="category"
                            label="Category"
                            value={
                                    catData.some(item => item.id === formik.values.category)
                                    ? formik.values.category
                                    : ""
                                }
                            onChange={(e)=>{
                                if(e.target.value === "create_cat"){
                                    navigate("/categories")
                                    return;
                                }
                                formik.setFieldValue("category", e.target.value)
                            }}
                            error={!!formik.touched.category && !!formik.errors.category}
                            helperText={formik.touched.category && formik.errors.category}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                              
                            <MenuItem  value="create_cat">
                                Create Category
                            </MenuItem>
                             <Divider/>
                           {catData.map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                    {item.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                        size="small"
                            sx={{textAlign:"center"}}
                            margin="normal"
                            fullWidth
                            id="cost_price"
                            name="cost_price"
                            label="Cost Price"
                            type="Number"
                            value={formik.values.cost_price}
                            onChange={formik.handleChange}
                            error={!!formik.touched.cost_price && !!formik.errors.cost_price}
                            helperText={formik.touched.cost_price && formik.errors.cost_price}
                        >
                        </TextField>
                        <TextField
                            size="small"
                            margin="normal"
                            fullWidth
                            id="selling_price"
                            name="selling_price"
                            label="Selling Price"
                            type="Number"
                            value={formik.values.selling_price}
                            onChange={formik.handleChange}
                            error={!!formik.touched.selling_price && !!formik.errors.selling_price}
                            helperText={formik.touched.selling_price && formik.errors.selling_price}
                        >
                        </TextField>
                        <TextField
                            size="small"
                            margin="normal"
                            fullWidth
                            id="sold_In"
                            select
                            name="sold_In"
                            label="Sold In"
                            value={ measuredData.some(item=>item.id === formik.values.sold_In)? formik.values.sold_In :""
                            }
                            onChange={(e)=>{
                                console.log(e.target.value)
                                if(e.target.value === "create_sold"){
                                    navigate("/measurements")
                                    return;
                                }
                                formik.setFieldValue("sold_In", e.target.value)
                            }}
                            error={!!formik.touched.sold_In && !!formik.errors.sold_In}
                            helperText={formik.touched.sold_In && formik.errors.sold_In}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            <MenuItem  value="create_sold">
                                Create Sold In
                            </MenuItem>
                             <Divider/>
                           {measuredData.map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                    {item.measurement_type}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            disabled={formik.values.product_id && formik.values.product_id > 0? true: false}
                            size="small"
                            margin="normal"
                            fullWidth
                            id="stock_inventory"
                            name="stock_inventory"
                            label="Stock Inventory"
                            type="Number"
                            value={formik.values.stock_inventory}
                            onChange={formik.handleChange}
                            error={!!formik.touched.stock_inventory && !!formik.errors.stock_inventory}
                            helperText={formik.touched.stock_inventory && formik.errors.stock_inventory}
                        >
                        </TextField>
                        {(productId && productId > 0) &&
                            
                            <Box type="button" color="red"  
                                                onClick={()=>{
                                                    setUpdateInventory(!updateInventory)
                                                    // formik.setFieldValue("pin", "")
                                                    // formik.setFieldValue("confirm_pin", "")
                                                    setTimeout(()=>{
                                                        Ref.current?.scrollIntoView({ behavior: "smooth",
                                                                block: "center",})
                                                    }, 0)
                                                    // setPinChange(!pinChange)
                                                }}
                                                 component="button" sx={{border:"none",p:0.5, cursor:"pointer", backgroundColor:"transparent"}}>
                                                    Update Inventory
                        </Box>
                        }
                        
                        {updateInventory &&

                        <Box ref={Ref}>
                        <TextField
                        size="small"
                            inputProps={{ inputMode: "decimal" }}
                             onKeyDown={(e) => {
                                const allowedKeys = [
                                        "Backspace",
                                        "Delete",
                                        "ArrowLeft",
                                        "ArrowRight",
                                        "Tab",
                                    ];
                                if (
                                    !/[0-9]/.test(e.key) 
                                    &&
                                     e.key !=="."
                                    &&
                                    !allowedKeys.includes(e.key)) {
                                  e.preventDefault(); 
                                }
                            }}
                            
                            margin="normal"
                            id="quantity"
                            name="quantity"
                            label="Quantity"
                            type="text"
                            value={formik.values.quantity}
                            onChange={formik.handleChange}
                            error={!!formik.touched.quantity && !!formik.errors.quantity}
                            helperText={formik.touched.quantity && formik.errors.quantity}
                            >
                     </TextField>    
                    <TextField
                        size="small"
                            margin="normal"
                            fullWidth
                            id="action"
                            select
                            name="action"
                            label="Action"
                            onChange={formik.handleChange}
                            value={formik.values.action}
                            error={!!formik.touched.action && !!formik.errors.action}
                            helperText={formik.touched.action && formik.errors.action}
                        >

                           <MenuItem value="add" >
                            Add
                           </MenuItem>
                           <MenuItem value="subtract">
                                Subtract
                           </MenuItem>
                        </TextField>    
                    </Box>
                         
                        
                        }
                                               
                        <Box sx={{display :"flex"}}>

                            <Button size="small" variant="contained" disableElevation sx={{ m:1 }} type="submit">{formik.values.product_id && formik.values.product_id > 0 ? "Update" : "Create"}</Button>
                        {/* <Button sx={{m:1}}
                            variant="contained"
                            onClick={() => setOpen(true)}
                        >
                            {formik.values.product_id && formik.values.product_id > 0 ? "Update" : "Create"}
                        </Button> */}
                           
                           <PassCodeDiag 
                           passTokenRef={passTokenRef}
                           open={openDel}
                           handleClose={() => setOpenDel(false)} 
                           requestId={requestId}
                            purpose='product_delete'  handleDelete={handleDelete}/>
                            <Button  size="small" variant="contained" onClick={()=>{handleDelete()}} disableElevation sx={{textTransform:"none",height:"30px", m:1, backgroundColor:"red" }} >Delete</Button>
                           

                            <PassCodeDiagUpdate
                             requestId={requestId}
                            purpose={productId?'product_update':'product_create'}
                            passTokenRef={passTokenRef}
                            formik={formik}
                            open={open}
                            handleDaigClose={() => setOpen(false)}
                                                    />
                        
                        </Box>
                        {mess&& <Box ><Typography color="error"> {mess}</Typography > </Box>}
                    </Box>

                    
                </Box>

        
        </>
    )

};

export default ProductUpdateForm