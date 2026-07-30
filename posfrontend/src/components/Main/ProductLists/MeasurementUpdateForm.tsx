import { useFormik } from "formik"
import { Box, Button, Container, MenuItem, TextField } from "@mui/material";
import useAxiosWithInterceptor from "../../../helper/jwtinterceptor";
import React from "react";


interface Server {
    id: number;
    measurement_type: string;
    value: number;
    outlet_id:string;
}

interface UpdateMeasureFormProps {
    dataCRUD?: Server[];
    measurementId:number;
    measurementType: string;
    ItemValue : number;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    onSuccess:() =>Promise<void>;
    outlet_id:string;
    onClose:() => void;


}

const MeasurementUpdateForm = ({
    outlet_id,
    measurementId,
    measurementType,
    ItemValue,
    setIsLoading,
    onClose,
    onSuccess
 }:UpdateMeasureFormProps) => {
    const jwtAxios = useAxiosWithInterceptor();

    

    const formik = useFormik({
        initialValues: {
            measurement_type: measurementType ?? "",
            value: ItemValue ?? 0,
            measure_id:measurementId ?? 0
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
            const { measurement_type, value,measure_id } = values;
            
           
           const payload ={
                
                "measurement_type": measurement_type,
                 "value":value,
                 "outlet":outlet_id
                }
                console.log(payload)
        try{
            if(measure_id && measure_id > 0){
                console.log('called........')
                const response = await jwtAxios.put(`http://127.0.0.1:8000/api/measurements_info/${measure_id}/?outlet_id=${outlet_id}`,
                payload,
                { withCredentials: true}
                )
                const dataCRUDBack = response.data
                setIsLoading(false)
                console.log(response.status)
                onSuccess()
                    
                    onClose();
                    return dataCRUDBack
            }else{
                    console.log(payload)
                const response = await jwtAxios.post(`http://127.0.0.1:8000/api/measurements_info/?outlet_id=${outlet_id}`, payload, {
                withCredentials: true,
                });
                setIsLoading(false);
               
                     onSuccess();
                
            
                    onClose();
                
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
                            id="value"
                            name="value"
                            label="Value"
                            type="text"
                            value={formik.values.value}
                            onChange={formik.handleChange}
                            // error={!!formik.touched.email && !!formik.errors.email}
                            // helperText={formik.touched.email && formik.errors.email}
                        >



                        </TextField>

                        <TextField
                            margin="normal"
                            fullWidth
                            id="measurement_type"
                            select
                            name="measurement_type"
                            label="Measurement Type"
                            value={formik.values.measurement_type}
                            onChange={formik.handleChange}
                            // error={!!formik.touched.password && !!formik.errors.password}
                            // helperText={formik.touched.password && formik.errors.password}
                        >           
                            <MenuItem value='each'>each</MenuItem>
                            <MenuItem value='g'>gram</MenuItem>
                            <MenuItem value='kg'>kilogram</MenuItem>
                            <MenuItem value='ltr'>litre</MenuItem>
                        </TextField>
                    
                        <Button variant="contained" disableElevation sx={{ maxWidth: "50%", mt: 1, mb: 2 }} type="submit">{formik.values.measure_id && formik.values.measure_id > 0 ? "Update" : "Create"}</Button>
                    </Box>
                </Box>

            </Container>
        </>
    )

};

export default MeasurementUpdateForm