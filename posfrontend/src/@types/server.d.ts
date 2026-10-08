interface catProps {
    name:string;
    id:number;
}
export interface categoryProps {
    category:catProps
}
export interface Server { 
    id: number;
    outlet:string
    product_name: string;
    sold_In: {id:number; measurement_type:string;}
    selling_price: number;
    stock_inventory: number
    category: {name:string, id: number}
    cost_price?:string
    user?:number
    
}
interface ProductProps{
    id:number;
    product_name:string;
    category:string;
    cost_price:number;
    selling_price :number;
    stock_inventory:number;
    sold_In:string
    
}

interface OrderProps {
    id:number;
    date:string;
    description:string;
    paid:boolean;
    product:ProductProps;
    product_name_at_sale?:string;
    measurement_type_at_sale?:string;
    measurement_value_at_sale?:string;
    unit_selling_price?:number;
    quantity:number;
    sub_total:number

}