// product shop list

export type Users = {
    id: string | number | undefined;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    gender?: string;
    image?: string;
    address?: string;
    created_at?: Date;
    
};

// export interface Errors  {
//     usernameError: object | [] | String | object | undefined;
//     usernameText: object | [] | String;
//     emailError: object | [] | String;
//     emailText: object | [] | String;
//     phone_numberError: object | [] | String;
//     phone_numberText: object | [] | String;
// }

// types.ts

// export type Errors = {
//   usernameError: string | null | undefined;
//   usernameText: string;

//   emailError: string | null;
//   emailText: string;

//   phone_numberError: string | null;
//   phone_numberText: string;
// }



// export interface UserstateProps {
//     users?: Users[];
//     sortBy?: String;
//     gender?: object | [] | String;
//     category?: object | [] | String;
//     price?: object | [] | String;
//     subTotal?: any;
//     total?: number;
//     discount?: any;
//     color?: string;
//     rank?: number;
//     errors?: Object | undefined
    
// }

export interface Errors {
    usernameError: any;
    usernameText: string;
    emailError: any;
    emailText: string;
    phone_numberError: any;
    phone_numberText: string;
}

export interface UsersStateProps {
    users: any[]; // Le type réel pour les utilisateurs dépendrait de votre application
    gender: string;
    category: any[]; // Le type réel pour la catégorie dépendrait de votre application
    price: string;
    subTotal: number;
    discount: number;
    total: number;
    errors: Errors;
}



