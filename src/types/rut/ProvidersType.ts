// product shop list
export type Users = {
    id: string | number | undefined;
    username: string;
    matricule?: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    image?: string ;
    role: string;

    address?: string;
    date_joined:  Date | string;
    groups?: [];
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    last_login: string;
    user_permissions?: []
};


// checkout-cart billing address
export type Address = {
    id?: string | any | Date;
    name: string;
    destination: string;
    building: string;
    city: string;
    state: string;
    phone: string;
    isDefault: boolean;
};

// product reviews list
export type Reviews = {
    id: string | number | undefined;
    rating: number;
    review: string;
    date: Date | string;
    profile: {
        avatar: string;
        name: string;
        status: boolean;
    };
};

// product shop filter
export type ProductsFilter = {
    length?: number;
    search: string;
    sort: string;
    gender: string[];
    categories: string[];
    colors: string[];
    price:string[];
    rating: number;
};

// product shop filter - sort options
export type SortOptionsProps = {
    value: string;
    label: string;
};

// product shop filter - colors options
export type ColorsOptionsProps = {
    label: string;
    value: string;
    bg: string;
};

export type PaymentOptionsProps = {
    id: number;
    value: string;
    title: string;
    caption: string;
    image: string;
    size: {
        width: number;
        height: number;
    };
};

export interface UsersStateProps {
    users?: Users[];
   
    items?: Users[] | any;
    providers?:  Users[] | any;

    addresses?: Address[];
    sortBy?: String;
    gender?: object | [] | String;
    category?: object | [] | String;
    price?: object | [] | String;
    error?: object | string | null;
    subTotal?: any;
    total?: number;
    discount?: any;
    color?: string;
    rank?:number;
    isConfirmButton?: boolean ;
}


export interface UserCreateOptions {
    email?: string;
    username?: string;
    matricule?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    password?: string | undefined; // Champ password est facultatif
    role?: string;
    address?: string;
}
