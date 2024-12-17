//List des produits
export type Signator = {
    id: number;
    last_name: string;
    function_name: string;
    position: string;
    title: string;
    first_name: string;         
    modified_at: string;        
    ref: string;              
    created_at: string;     
    
};


//List des produits
export type Items = {         
    name: string;        
    image?:string;                       
    price: number;             
    rate_per_days: number;    
    unite: string          
    divider: number;        
    description?: string;     
};

