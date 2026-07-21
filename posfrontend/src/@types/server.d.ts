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