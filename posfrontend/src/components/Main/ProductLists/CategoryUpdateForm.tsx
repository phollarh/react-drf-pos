import { useFormik } from "formik"
import { Box, Button, Container, MenuItem, TextField, Typography } from "@mui/material";
import { useEffect } from "react";
import useAxiosWithInterceptor from "../../../helper/jwtinterceptor";
import React from "react";

interface Server {
    id: number;
    name: string;
   
}

interface UpdateCatFormProps {
    handleOrderDelete:(id:number|undefined)=>Promise<void>
  dataCRUD?: Server[];
  name?:string
  categoryId?:number;
  dataObject:Server | null
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
   onSuccess: () => Promise<any>
    onClose:() => void;

}

const CategoryUpdateForm = ({
    handleOrderDelete,
    dataCRUD,
    categoryId,
    name,
    setIsLoading,
    onSuccess,
    onClose
 }:UpdateCatFormProps) => {
    const jwtAxios = useAxiosWithInterceptor();
    const outletId = localStorage.getItem("outlet_id")

    

    const formik = useFormik({
        enableReinitialize:true,
        initialValues: {
            name: name ?? "",
            category_id:categoryId ?? 0
        },
        // validate: (values) => {
        //     const errors: Partial<typeof values> = {};
        //     if (!values.email) {
        //         errors.email = "Required"
        //     }
        //     if (!values.password) {
        //         errors.password = "password field can not be empty"
        //         console.error(formik.touched.password, formik.errors.password)
        //     }
        //     return errors;
        // },
        onSubmit: async (values) => {
            console.log('you submitted')
            setIsLoading(true)
            const { name,category_id } = values;
            
           console.log(category_id)
           const payload ={
                "outlet":outletId,
                "name": name,
                }
                console.log(payload)
        try{
            if(category_id && category_id > 0){
                const response = await jwtAxios.patch(`http://127.0.0.1:8000/api/categories_info/${category_id}/?outlet_id=${outletId}`,
                payload,
                { withCredentials: true}
                )
                const dataCRUDBack = response.data
                setIsLoading(false)
                 if(response.status === 200){
                        //  )
                    onSuccess();
                    onClose();
                }
                                       
                return dataCRUDBack
            }else{
                console.log('called')
                const response = await jwtAxios.post(`http://127.0.0.1:8000/api/categories_info/?outlet_id=${outletId}`, payload, {
                withCredentials: true,
                });
                setIsLoading(false);
                
                 if(response.status === 201){
                        //  )
                    onSuccess();
                    onClose();
                } 
                return response.data;
            }
          
        }catch(error:any){
             if (error.response?.status === 400) {
                new Error("400");
            }

            setIsLoading(false)
            throw error;
        }
        },
    })
    return (
        <>
            
            <Container component="main" maxWidth="xs">
                
                <Box sx={
                    {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: 'column',
                    }}>
                    <Box component="form" sx={{ display: "flex",maxWidth:"100%", alignItems: "center", flexDirection: "column"}} onSubmit={formik.handleSubmit}>
                       
                        <TextField
                            sx={{width:"400px"}}
                            autoFocus
                            fullWidth

                            id="name"
                            name="name"
                            label="Name"
                            type="text"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            // error={!!formik.touched.email && !!formik.errors.email}
                            // helperText={formik.touched.email && formik.errors.email}
                        >



                        </TextField>
                        <Box sx={{display :"flex"}}>
                                                    <Button size="small" variant="contained" disableElevation sx={{ m:1 }} type="submit">{formik.values.category_id && formik.values.category_id > 0 ? "Update" : "Create"}</Button>
                                                   {categoryId&& <Button  size="small" variant="contained" onClick={()=>{handleOrderDelete(categoryId)}} disableElevation sx={{textTransform:"none",height:"30px", m:1, backgroundColor:"red" }} >Delete Product</Button>} 
                                                </Box>
                        {/* <Button variant="contained" disableElevation sx={{ maxWidth: "50%", mt: 1, mb: 2 }} type="submit">{formik.values.category_id && formik.values.category_id > 0 ? "Update" : "Create"}</Button> */}
                    </Box>
                </Box>

            </Container>
        </>
    )

};

export default CategoryUpdateForm